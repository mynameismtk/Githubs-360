# Clinic 360 — MVP Definition & Phased Plan

## 1. The MVP, stated as an outcome

The MVP is not a feature list. It is this sentence being true:

> A patient books an appointment from their phone in under 60 seconds, arrives, is seen,
> and afterwards finds their prescription and their report in the app without calling the
> clinic — while the clinic runs the visit entirely inside the system.

Anything that does not serve that sentence is not MVP.

## 2. What that requires

| Capability | Why it is in |
|---|---|
| Phone + OTP login | Patients have no email habit; this is the only viable Indian entry point |
| Family profiles | A single-patient account is unusable for the actual Indian household |
| Speciality → doctor → slot booking | The core transaction |
| Real availability from schedules | Fake slots destroy trust on day one |
| Patient home with next appointment | The 3-second comprehension requirement |
| Check-in + queue | The thing that changes the waiting-room experience |
| Consultation notes + prescription | Without this the clinic keeps using paper and the data never arrives |
| Lab order → result → notify | The "where is my report" problem, which is the loudest patient complaint |
| Invoice + payment record | The clinic will not run two systems for money |
| Notifications | Without them the app is a place you have to remember to visit |
| Audit log | Non-negotiable the moment real patient data exists |

## 3. What is explicitly NOT MVP

Deferred with reasons, not silently dropped:

- AI assistant — high effort, high risk, zero value until there is data to retrieve.
- Analytics dashboards — the clinic cannot analyse a month it has not yet recorded.
- Care journeys — a differentiator, not a necessity, and it needs real pathways from real
  clinicians to be anything other than decoration.
- Video consults — a separate product with its own compliance surface.
- Multi-language — architected for from day one, translated once the English product is
  validated with real users.
- Medication reminders — genuinely useful, but a notification-infrastructure problem
  wearing a feature costume. It comes after notifications are reliable.

## 4. Phases

### Phase 1 — Foundation ✅ *(this deliverable)*

Design system · auth (OTP, sessions, RBAC) · policy layer · audit service · clinic
configuration · specialities & departments · doctor profiles & schedules · **computed
availability** · patient registration & profile · **family profiles and switching**
· **end-to-end appointment booking** · patient home · appointment management
(reschedule/cancel) · doctor's day view · reception day board · admin overview and
management lists · realistic seed data · demo accounts for every role.

*Exit criteria:* a seeded patient logs in, books a real slot against a real schedule,
sees it on Home, reschedules it, cancels it; reception sees the same appointment on the
day board; the doctor sees it on their list; every action is audited. Type-checks and
builds clean.

### Phase 2 — Clinical

Consultation composer · diagnoses · prescriptions + patient viewer · lab catalogue,
orders, results, verification, trend data · imaging orders and reports · document upload,
authorised download, secure share · the medical timeline · follow-up engine · break-glass
· amendment workflow.

*Exit criteria:* the doctor completes a consultation that produces a prescription and a
lab order; the lab uploads and verifies a result; both appear in the patient's timeline
with correct reference ranges and non-diagnostic language.

### Phase 3 — Operations

Live queue with position and wait estimation · check-in flow · nurse vitals module ·
reception console · invoicing · payment abstraction with a real UPI provider ·
notification delivery (push/SMS/email adapters) and preferences · pharmacy dispensing.

*Exit criteria:* the full §44 workflow runs end to end with a real patient device
receiving real notifications.

### Phase 4 — Advanced

Care journey templates and instances · AI assistant with the retrieval boundary ·
analytics · localisation (ml/ta/hi/kn/te) · granular consent · device management ·
medication reminders and adherence · advanced permissions.

## 5. Missing requirements the brief did not specify (§47.10)

Raised now because each one changes the design if it is answered late:

1. **Walk-in patients.** The brief models booked appointments only. Indian clinics run
   substantially on walk-ins. The queue must accept a patient with no prior appointment —
   the schema supports it (appointment created at the desk), but the reception UX needs an
   explicit walk-in path. **Recommendation: add to Phase 3.**
2. **Doctor running late / session cancelled.** `DOCTOR_DELAYED` is modelled as a
   notification, but the operational flow — who declares it, what happens to the queue,
   whether patients may rebook without penalty — is undefined. **Needs a clinic policy.**
3. **Refunds and cancellation policy.** Is a paid consultation refundable? Within what
   window? Partially? This determines invoice state transitions. **Needs a clinic policy
   before payments ship.**
4. **Prescription regulatory format.** Indian prescriptions have conventions (doctor
   registration number, signature, schedule-H drug handling). Digital prescriptions may
   require a digital signature to be dispensable outside the clinic. **Needs legal input
   before Phase 2 sign-off.**
5. **Who verifies a lab result.** Single-technician release or two-person? Modelled as a
   config flag defaulting to single, which suits a small clinic. **Confirm with the lab.**
6. **Duplicate patient records.** Two registrations for one person is inevitable at a
   front desk. A merge tool is in the permission matrix but has no design. **Phase 3.**
7. **Offline and poor connectivity.** A clinic basement has no signal. Which screens must
   work offline? The strongest candidate is the doctor's consultation composer, where
   losing a half-written note is unacceptable. **Recommendation: local draft persistence
   in Phase 2, full offline deferred.**
8. **Data export / portability.** DPDP gives patients access rights. The timeline API is
   the natural basis for an export, but a patient-initiated "download everything" flow is
   undesigned. **Phase 4.**
9. **Staff handover and shift model.** Nurse-to-patient assignment is assumed but no shift
   model exists. Affects nurse scope resolution. **Phase 3.**
10. **What happens when a patient dies.** Records must be retained, the account must stop
    sending appointment reminders, and family access needs a defined outcome. Unpleasant
    to specify and worse to discover in production. **Needs a clinic policy.**
11. **Multi-location booking.** `Location` is modelled and schedules are per-location, but
    the patient booking UI does not yet ask which branch. Trivial now, painful later.
    **Phase 2 if the clinic has more than one site at launch.**
12. **Notification quiet hours.** `SUPPRESSED` exists as a delivery status but no quiet-hours
    policy is defined. A 6 AM medication reminder is a feature; a 2 AM one is a complaint.
