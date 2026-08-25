# Clinic 360 — Product Architecture

> One clinic. One app. One complete health journey.

## 1. What this product is

Clinic 360 is the operating system for a single multi-speciality clinic. It is **not** a
marketplace and **not** a doctor-discovery app. Every patient in it is a patient *of this
clinic*. That single constraint drives most of the architecture:

- There is exactly one `Clinic` record. Branding, departments, timings, emergency numbers
  and locations are **data**, not constants. The product is white-labelable from day one
  (§42 of the brief) without being a multi-tenant SaaS — see "Tenancy" below.
- Identity is clinic-issued. A patient's `MRN` (medical record number) is the durable
  clinical identifier; the phone number is only a *login credential* and can change.
- Every clinical artefact (report, prescription, invoice) has a known author who works
  at this clinic. There is no "unverified content" problem, which lets us show data with
  confidence instead of hedging every screen.

## 2. The three products inside one system

Clinic 360 is one codebase serving three genuinely different experiences. They are **not**
the same UI at different breakpoints (§30).

| Surface | Primary users | Form factor | Design centre of gravity |
|---|---|---|---|
| **Patient app** | Patients + their family | Mobile-first PWA, one-handed | Calm, spacious, 3-second comprehension, thumb-reachable |
| **Clinical console** | Doctors, nurses, lab, pharmacy | Tablet + desktop, keyboard-heavy | Dense, fast, keyboard-first, zero decorative chrome |
| **Operations console** | Reception, admin | Desktop-first | Tabular, batch-oriented, high information density |

They share a design *system* (tokens, primitives, semantics) but not a design *layout*.
The patient app optimises for reassurance; the consoles optimise for keystrokes per task.

### Route namespaces

```
/                      → marketing/entry, redirects by session role
/onboarding            → 4-screen intro (patient only, first run)
/login                 → mobile + OTP
/app/*                 → PATIENT surface   (mobile-first shell, bottom nav)
/console/*             → CLINICAL surface  (doctor, nurse, lab, pharmacy)
/ops/*                 → OPERATIONS surface (reception, admin)
/api/*                 → JSON API
```

A session's role determines which namespace it may enter. Cross-namespace access is a
403, not a redirect loop — see `docs/03-roles-and-permissions.md`.

## 3. Core product concepts

Five concepts carry most of the product's value. Everything else is plumbing around them.

### 3.1 The Patient Record is a timeline, not a folder
Consultations, lab results, imaging, prescriptions, procedures and documents are all
`MedicalRecord`-adjacent events with a `occurredAt` timestamp and a `kind`. The patient
UI and the doctor UI render the *same* underlying timeline with different density and
different permissions. This is why `MedicalRecord` exists as a thin polymorphic spine
alongside the strongly-typed detail tables — it makes "show me everything, newest first"
a single indexed query instead of a seven-way union.

### 3.2 The Care Journey is configurable, not hardcoded
`CareJourneyTemplate` → `CareJourneyStepTemplate` defines a pathway (Pregnancy, Fertility,
Diabetes, Post-op…). Instantiating one for a patient copies the steps into
`CareJourney` → `CareJourneyStep`. **Copying rather than referencing is deliberate**: a
patient's journey must not silently mutate when an admin edits the template a year later.
Clinical history is immutable-by-default.

### 3.3 The Queue is the trust feature
The queue turns "come at 10:30 and wait until 12:00" into "you are 3rd, ~25 minutes".
It is the single highest-leverage feature for perceived quality and the one that most
directly reduces physical crowding in the clinic. Architecturally it needs: a per-doctor
per-day ordered list, a live consultation-duration estimator, and a push channel. It is
Phase 3, but the schema supports it from Phase 1 so appointments can carry queue state.

### 3.4 The Follow-up Engine is the retention loop
A `FollowUp` is created by a doctor at the end of a consultation with a *window*
(`dueFrom`/`dueTo`), not a single date — clinics rarely mean "exactly 14 days". The
engine surfaces it on the patient home card and enables one-tap rebooking with the same
doctor. This is the difference between a records app and a care app.

### 3.5 The Family Account is the Indian-market requirement
One login, many patients. The `User` (login identity) and the `Patient` (clinical
subject) are **separate tables joined by `PatientAccessGrant`**. This is the single most
important schema decision in the product and is discussed in
`docs/04-database-architecture.md` §"Why User ≠ Patient".

## 4. Information architecture

### Patient app (bottom nav — exactly 5, never more)

```
Home           Appointments      Records          Messages        Profile
 │              │                 │                │               │
 ├ Next appt    ├ Upcoming        ├ Timeline       ├ Clinic chat   ├ My family
 ├ Health today ├ Past            ├ Lab reports    ├ Ask Clinic360 ├ Personal details
 ├ Quick acts   ├ Book new        ├ Prescriptions  └ Announcements ├ Insurance
 ├ Care journey └ Appt detail     ├ Imaging                        ├ Notifications
 └ Updates         ├ Reschedule   ├ Documents                      ├ Language
                   ├ Cancel       └ Bills & payments               └ Sign out
                   └ Directions
```

Emergency is **not** in the nav. It is a persistent affordance in the app header on
every patient screen, so it is reachable in one tap from anywhere (§15).

Billing lives under Records, not in the nav. Rationale: patients look for a bill *in the
context of the visit that generated it*. It is additionally reachable from Home's
"Pending payment" card and from Profile. Two paths to a rarely-used destination beats a
permanent nav slot.

### Clinical console (doctor)

```
Today            Patients          Inbox              Schedule
 ├ Queue          ├ Search          ├ Reports to sign  ├ My availability
 ├ Appointments   └ Patient view    ├ Follow-ups due   └ Leave
 └ Completed         ├ Timeline     └ Clarifications
                     ├ Consultation
                     └ Actions
```

### Operations console (reception / admin)

```
Overview   Appointments   Queue   Patients   Billing   Lab   Pharmacy   Manage   Analytics
```

## 5. The end-to-end workflow this product must support

This is the acceptance test for the whole system (§44). Every phase is judged by how
much of this chain works for real:

```
patient books  →  reception checks in  →  queue advances  →  nurse records vitals
     →  doctor opens patient  →  doctor writes consultation  →  prescription issued
     →  lab order created  →  lab collects sample  →  lab uploads report
     →  patient notified  →  patient views report + prescription  →  bill generated
     →  patient pays  →  follow-up surfaces  →  patient rebooks
```

## 6. Tenancy

Single-clinic, multi-location. There is one `Clinic` row and many `Location` rows.
Every clinically-scoped table carries `clinicId` **even though there is only one clinic
today**. This costs one integer per row now and saves a migration that touches every
table later. Queries always filter on it, so the day the product becomes multi-tenant
the change is an auth-context change, not a data-model rewrite.

## 7. Non-goals for v1

Stated explicitly so scope stays honest:

- Not an EMR/HIS replacement (no IPD, OT scheduling, ward management, inventory).
- No insurance claim adjudication — we store policy documents and pre-auth references only.
- No DICOM viewer. We store study metadata and a link to the PACS/report artefact (§27).
- No teleconsultation video stack in Phase 1 — `consultationType: VIDEO` is modelled and
  the join-link field exists, but the provider is an integration point, not built.
- No ABDM/ABHA integration yet — the schema reserves `abhaAddress`/`abhaNumber` on
  `Patient` so it can be added without migration pain. See risk register R-11.
