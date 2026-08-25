# Clinic 360 — Database Architecture

Canonical definition: `prisma/schema.prisma`. This document explains the decisions the
schema encodes.

## 1. Why `User` ≠ `Patient` (the most important decision here)

A naïve design puts login credentials on the patient row. That design cannot express any
of these, all of which are ordinary in an Indian clinic:

- A 3-year-old is a patient with no phone and no login.
- A grandmother is a patient whose son books and reads everything for her.
- A husband and wife share one phone but must have separate medical records.
- A daughter moves abroad and should lose access to her father's record.
- A patient's phone number changes; their medical record must not.

So we split:

```
User  ──< PatientAccessGrant >──  Patient
(login identity)                  (clinical subject)
```

`PatientAccessGrant` carries the relationship, the level (`FULL` / `VIEW_ONLY`), the
status, who issued it, and when it was revoked. It is a **join table with meaning**, and
it is the sole gateway to patient data for a patient-role user.

Consequences that fall out for free:

- Revoking access is one row update and takes effect on the next request.
- "Who can see this patient?" is a single indexed query — required for a privacy request.
- A patient with no login (infant) is fully representable.
- One user can hold grants over six family members without any data duplication.

## 2. Preventing cross-patient exposure (§26's hard requirement)

Three independent layers, because one is not enough:

1. **Schema** — there is no foreign key from `Patient` to `User`. There is no such thing
   as "the user's patient row". Access *must* go through a grant.
2. **Policy** — `assertCanAccessPatient()` is the only way to resolve a patient ID into a
   readable patient, and it returns a projection level rather than a boolean.
3. **Query shape** — patient-scoped list queries take `patientId: { in: allowedIds }`
   where `allowedIds` came from grants, never from a client-supplied value.

The `Session.activePatientId` field is explicitly documented in the schema as a **UI
convenience that is never trusted**. A tampered cookie changes which family member the
app *shows as selected*; it cannot change what the server will return, because every
request re-resolves the grant.

## 3. The timeline spine

`MedicalRecord` is a thin denormalised index row, not the record itself:

```
MedicalRecord { patientId, kind, occurredAt, title, summary, sourceType, sourceId, authorName }
```

- `@@index([patientId, occurredAt DESC])` makes the patient timeline — the most-viewed
  clinical screen in the product — a single index scan with no joins and no union.
- `@@unique([sourceType, sourceId])` guarantees one timeline row per underlying artefact,
  so re-running a backfill is idempotent.
- `authorName` / `specialityName` are denormalised deliberately: the timeline list needs
  them, and they are historical facts. If a doctor later changes speciality, the record
  of *what they were when they wrote it* should not change.

The strongly-typed tables (`Consultation`, `LabOrder`, `ImagingStudy`, `Prescription`,
`Document`) remain the source of truth. The spine is an access path.

## 4. Concurrency: the double-booking race

Two patients tap "Confirm" on the same 10:20 slot in the same second. An application-level
`findFirst` then `create` loses this race — both reads happen before either write.

The fix is in the database. `Appointment.slotLock` is a unique nullable column:

```
slotLock = "<doctorId>|2026-08-26T10:20:00.000Z"   while the appointment is live
slotLock = NULL                                     once cancelled or marked no-show
```

Postgres treats NULLs as distinct in unique indexes, so the constraint reads exactly as
"at most one live appointment per doctor per start time" while allowing any number of
cancelled appointments at the same time. The second concurrent insert fails with
`P2002`, which the booking service translates into a friendly "that slot was just taken"
and a refreshed slot list.

This is a case where correctness belongs in the database, not the application.

## 5. Soft deletion policy

`deletedAt` exists only where deletion is a legitimate business action: configuration
(`Location`, `Department`, `Speciality`, `Service`), identities (`User`, `Patient`,
`Doctor`, `StaffProfile`), and `Document`.

Clinical events — consultations, prescriptions, lab results, invoices, audit rows — have
**no** `deletedAt`. They are never deleted. They are:

- **superseded** (`Prescription.supersededById`),
- **amended** (`Consultation.amendsId` + `amendmentReason`, original untouched), or
- **cancelled** (a status, which preserves the fact that it happened).

A medical record that can vanish is not a medical record.

## 6. Money

Every amount is `Int` paise. `₹1,850.00` is `185000`. There is no `Float` or `Decimal`
anywhere in the billing tables. Formatting happens once, in `formatMoney()`, at the
display boundary. `Invoice.amountDue` is stored rather than computed so it can be indexed
for "who owes us money" — the invoice service is the only writer and keeps it consistent
inside the same transaction as the payment.

## 7. Time

- Instants (`startAt`, `occurredAt`, `createdAt`) are `timestamptz`, stored in UTC.
- Calendar days (`queueDate`, `dueFrom`, `startDate`) are `@db.Date` — a follow-up window
  is a date, not an instant, and must not shift across a timezone boundary.
- Recurring schedule times (`DoctorScheduleRule.startTime`) are `"HH:mm"` **strings** in
  clinic-local wall time. A doctor's Monday clinic starts at 09:00 local regardless of
  DST or how the server is configured. Resolution against `Clinic.timezone` happens in
  one place, in the availability service.

Storing wall-clock strings for recurring rules and instants for events is the standard
way to avoid the class of bug where a schedule silently shifts by an hour.

## 8. Indexing strategy

Indexes exist where a real query needs them, not on every column.

| Index | Query it serves |
|---|---|
| `medical_records (patientId, occurredAt DESC)` | patient timeline |
| `appointments (doctorId, startAt, status)` | slot availability, doctor's day |
| `appointments (patientId, startAt)` | patient's upcoming/past lists |
| `appointments (clinicId, status, startAt)` | reception's day board |
| `appointments (slotLock) UNIQUE` | double-book prevention |
| `patient_access_grants (userId, status)` | "which patients can this user see?" — every request |
| `patient_access_grants (patientId, status)` | "who can see this patient?" — privacy requests |
| `lab_results (labAnalyteId, measuredAt)` | trend charts (§8) |
| `queue_entries (doctorId, queueDate, position) UNIQUE` | queue ordering integrity |
| `invoices (clinicId, status, issuedAt)` | outstanding-payments board |
| `audit_logs (patientId, createdAt DESC)` | "everything that touched this patient" |
| `follow_ups (clinicId, status, dueFrom)` | follow-up engine sweep |

## 9. What is `jsonb` and why

Used only where the shape is genuinely open and we will never filter on it in SQL:

- `Clinic.settings` — policy switches
- `Location.openingHours` — array of day/time objects
- `Consultation.examination` — findings differ per speciality; forcing columns would
  produce a table with 80 mostly-null fields
- `LabAnalyte.refVariants` — sex/age-specific reference intervals
- `Notification.metadata`, `AuditLog.metadata` — payloads
- `StaffProfile.permissions` — fine-grained switches over the role
- `Message.citations` — which records an AI answer drew on

Anything queried, sorted, or constrained is a real column.

## 10. Audit table privileges

`audit_logs` is append-only by intent and should be append-only by grant. The
application's database role should hold `INSERT, SELECT` on it and nothing else:

```sql
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM clinic360_app;
```

This is a deployment step (documented in `docs/09-security-and-privacy.md`), not
something Prisma can express. Until it is applied, "append-only" is a convention rather
than a guarantee — which is exactly the kind of gap worth naming rather than glossing.
