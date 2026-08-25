# Clinic 360 — Roles, Permissions & Access Control

## 1. Two independent questions

Authorization here answers two questions that must never be conflated:

1. **Capability** — "may this role perform this kind of action at all?"
   (Can a nurse write a prescription? No.)
2. **Scope** — "may this actor act on *this specific patient*?"
   (Can Dr. Menon open patient #4102? Only with a care relationship.)

Most healthcare privacy breaches are scope failures, not capability failures. The system
therefore checks scope on every patient-data access, separately from the role check.

## 2. Roles

| Role | Surface | Identity table |
|---|---|---|
| `PATIENT` | `/app` | `User` → grants → `Patient` |
| `DOCTOR` | `/console` | `User` → `Doctor` |
| `NURSE` | `/console` | `User` → `StaffProfile` |
| `LAB_TECH` | `/console` | `User` → `StaffProfile` |
| `PHARMACIST` | `/console` | `User` → `StaffProfile` |
| `RECEPTIONIST` | `/ops` | `User` → `StaffProfile` |
| `ADMIN` | `/ops` | `User` → `StaffProfile` |

A `User` has exactly one role. A person who is both a doctor and an admin gets two
accounts — deliberately. Role-switching within a session is a well-known source of
privilege-escalation bugs, and the ambiguity it creates in audit logs ("which hat were
they wearing?") is unacceptable in a clinical record.

## 3. Capability matrix

`✓` allowed · `~` allowed with conditions (noted below) · blank denied

| Capability | PAT | DOC | NUR | LAB | PHA | REC | ADM |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **Identity & profile** |
| Manage own profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Add family member | ✓ | | | | | ~1 | ✓ |
| Register a new patient | ~2 | | | | | ✓ | ✓ |
| Edit patient demographics | ~3 | | | | | ✓ | ✓ |
| Merge duplicate patients | | | | | | | ✓ |
| **Appointments** |
| Book appointment | ~4 | | | | | ✓ | ✓ |
| Reschedule / cancel | ~4 | ~5 | | | | ✓ | ✓ |
| View doctor availability | ✓ | ✓ | ✓ | | | ✓ | ✓ |
| Check patient in | | | | | | ✓ | ✓ |
| Override slot limits (overbook) | | | | | | ~6 | ✓ |
| **Queue** |
| View own queue position | ✓ | | | | | | |
| View / reorder clinic queue | | ~7 | ~7 | | | ✓ | ✓ |
| Mark consultation started/ended | | ✓ | | | | | |
| **Clinical** |
| View own medical record | ✓ | | | | | | |
| View any patient's record | | ~8 | ~9 | ~10 | ~11 | ~12 | ~13 |
| Record vitals | | ✓ | ✓ | | | | |
| Write consultation note | | ✓ | | | | | |
| Amend a signed note | | ~14 | | | | | |
| Issue prescription | | ✓ | | | | | |
| Order lab / imaging | | ✓ | | | | | |
| Update sample collection status | | | | ✓ | | | |
| Upload lab result | | | | ✓ | | | |
| Verify/release lab result | | | | ~15 | | | |
| Dispense medication | | | | | ✓ | | |
| Create follow-up | | ✓ | | | | ~16 | ✓ |
| Instantiate a care journey | | ✓ | | | | | ✓ |
| **Money** |
| View own invoices | ✓ | | | | | | |
| View any invoice | | | | | ~17 | ✓ | ✓ |
| Create / adjust invoice | | | | | ✓ | ✓ | ✓ |
| Record payment | | ~18 | | | ✓ | ✓ | ✓ |
| Issue refund | | | | | | | ✓ |
| Change service pricing | | | | | | | ✓ |
| **Administration** |
| Manage doctors / departments | | | | | | | ✓ |
| Manage staff & permissions | | | | | | | ✓ |
| Manage doctor schedules | | ~19 | | | | ~19 | ✓ |
| View clinic analytics | | ~20 | | | | | ✓ |
| Configure clinic branding | | | | | | | ✓ |
| Manage AI knowledge base | | | | | | | ✓ |
| Read audit log | | | | | | | ✓ |

**Conditions**

1. Reception may link an existing patient to an account holder only with recorded consent.
2. Patient may add family members, which creates patients — subject to §5 limits.
3. Patient may edit their own demographics; clinical fields (blood group, allergies) are
   *proposed* by the patient and confirmed by staff, never silently overwritten.
4. Only for patients they hold a non-revoked access grant for.
5. Doctor may cancel/reschedule appointments on their own list only.
6. Reception overbooking requires a reason string; it is audited.
7. Doctor/nurse see the queue for their own clinic session only.
8. **Doctor scope:** has an appointment (any status) with the patient, OR is on the
   patient's care team, OR a referral to them exists, OR break-glass (§6).
9. **Nurse scope:** patient is on today's list for a doctor the nurse is assigned to.
10. **Lab scope:** restricted view — demographics, the order, and clinical notes attached
    to the order. Not the full record. A lab tech does not need the psychiatric history.
11. **Pharmacy scope:** restricted view — demographics, allergies, active prescriptions.
12. **Reception scope:** demographics, appointments, invoices. **No clinical content.**
    Reception can see that a lab report exists and that it is ready; not what it says.
13. **Admin scope:** admins get the *operational* record by default. Access to clinical
    content is break-glass and always audited. An administrator is not a clinician.
14. Signed notes are append-only. An amendment creates a linked `Consultation` revision;
    the original is never mutated or deleted. Time-limited to 24h without a reason.
15. Verification requires a lab tech with `canVerifyResults`; the verifier may not be the
    same user who uploaded the raw result where the clinic policy requires two-person
    release. Enforced by config flag, defaulting to same-person allowed for a small clinic.
16. Reception may create a follow-up *task* only when a doctor recorded the instruction.
17. Pharmacy sees pharmacy invoice lines only.
18. Doctor may record a consultation payment they collected directly.
19. Doctor manages own availability; reception manages exceptions with a reason.
20. Doctors see their own utilisation, not clinic-wide revenue.

## 4. Scope resolution (the important part)

```ts
assertCanAccessPatient(actor, patientId, action) →
  PATIENT      : a non-revoked PatientAccessGrant(userId=actor.userId, patientId) exists
                 AND the grant permits `action`
  DOCTOR       : appointment | care-team | referral | break-glass
  NURSE        : patient on today's list for an assigned doctor
  LAB_TECH     : an open LabOrder for this patient  → RESTRICTED projection
  PHARMACIST   : an active Prescription for this patient → RESTRICTED projection
  RECEPTIONIST : same clinic → OPERATIONAL projection (no clinical content)
  ADMIN        : same clinic → OPERATIONAL projection; clinical requires break-glass
```

Two things make this safe rather than merely stated:

- It returns a **projection level** (`FULL | RESTRICTED | OPERATIONAL`), not a boolean.
  Callers must handle the projection, so "allowed" can never accidentally mean "allowed
  to see everything".
- There is no `getPatient(id)` that skips it. The data-access module does not export one.

## 5. Family access grants

`PatientAccessGrant(userId, patientId, relationship, level, grantedBy, grantedAt, revokedAt)`

- Level `FULL` (manage everything) or `VIEW_ONLY`.
- Created when a user adds a family member, or when reception links an existing patient
  with recorded consent.
- **Adults are not automatically shareable.** Adding an adult family member creates a
  *pending* grant that the adult confirms via OTP on their own number. A minor (under 18
  by DOB) is granted immediately to the adding adult, who is recorded as guardian.
- On a minor's 18th birthday the grant transitions to `PENDING_REVIEW` and the young
  adult is prompted to confirm or revoke it. This is a background job (Phase 4) — the
  schema carries `reviewDueAt` from day one.
- Revocation is immediate and is never a delete: `revokedAt` is set, and the historical
  fact that access existed remains auditable.

**The rule that must never break:** no query for patient data may be constructed from a
patient ID supplied by the client without first resolving it through a grant check. All
patient-scoped API routes take the patient ID from the path and immediately call the
policy. There is no "current patient" stored in a cookie that could be tampered with —
the selected family member is a client-side UI preference that is re-validated on every
request.

## 6. Break-glass

Emergencies happen and a rigid system gets bypassed with a shared password, which is
worse. So break-glass is *supported* and *expensive*:

- Requires an explicit action and a typed reason.
- Grants `FULL` for 60 minutes on that patient only.
- Writes a `HIGH` severity `AuditLog` entry.
- Notifies the clinic admin.
- Appears in a dedicated review list.

## 7. Audit

Audited actions (§39), each recording actor, role, action, target type + ID, patient ID
where applicable, IP, user agent, timestamp, and a metadata blob:

- Any read of a patient record by a non-patient actor
- Break-glass invocation
- Consultation created / amended
- Prescription created / modified / cancelled
- Lab result uploaded / verified / amended
- Document uploaded / downloaded / shared
- Appointment created / rescheduled / cancelled by staff
- Invoice adjusted, payment recorded, refund issued
- Access grant created / revoked
- Any admin configuration or permission change
- Failed authorization attempts (these are the interesting ones)

Audit rows are append-only. No application code path updates or deletes them; the
application database role is granted `INSERT` and `SELECT` on that table only.
