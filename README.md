# Clinic 360

> One clinic. One app. One complete health journey.

A production-shaped digital platform for a multi-speciality clinic, connecting patients,
doctors, reception, nurses, laboratory, pharmacy, billing and administration.

**Status: Phase 1 (Foundation) complete and running.** See
[`docs/08-mvp-and-roadmap.md`](docs/08-mvp-and-roadmap.md) for what is built, what is not,
and why.

---

## Quick start

```bash
# 1. Postgres 16+ must be running
createdb clinic360

# 2. Configure
cp .env.example .env      # set DATABASE_URL

# 3. Install, migrate, seed
npm install
npm run db:migrate
npm run db:seed

# 4. Run
npm run dev               # http://localhost:3000
```

### Demo accounts

Sign in at `/login` with any of these numbers. **In development the OTP is displayed on
screen**, so no SMS gateway is needed. In production the app refuses to start with the
development SMS transport.

| Role | Mobile | Who |
|---|---|---|
| Patient | `9400000001` | Arun Menon — a family of four |
| Doctor | `9400100001` | Dr. Anil Kumar, Cardiology |
| Reception | `9400200001` | Front desk |
| Nurse | `9400200002` | Sreeja Nair |
| Laboratory | `9400200003` | Arun Dev |
| Pharmacy | `9400200004` | Nisha Joseph |
| Administrator | `9400200005` | Clinic manager |

All demo data is fictional. No real person's medical information appears anywhere.

### A five-minute tour

1. Sign in as the **patient**. The home screen shows the next appointment, an unread lab
   report, a pending payment of ₹1,850, a follow-up that is due, and a live care journey.
2. Tap the name in the header to **switch family member** — note the tinted band that
   appears whenever you are viewing someone else's records.
3. **Book an appointment**: speciality → doctor → a real slot computed from that doctor's
   schedule → confirm. Then reschedule it, then cancel it.
4. Open **Records** for the timeline, then a **lab report** — an out-of-range value is
   flagged with its reference range and the previous value, and never with a diagnosis.
5. Sign in as **reception** and check a patient in from the day board.
6. Sign in as the **doctor** to see today's list, then open a patient — allergies, current
   medicines and ongoing conditions sit above the timeline.
7. Sign in as the **administrator** and open the **audit log** to see every action above,
   recorded.

---

## Architecture

| Document | What it covers |
|---|---|
| [`docs/01-product-architecture.md`](docs/01-product-architecture.md) | Product vision, the three surfaces, information architecture, core concepts |
| [`docs/02-technical-decisions.md`](docs/02-technical-decisions.md) | Every significant technical choice, its reasoning, and its cost |
| [`docs/03-roles-and-permissions.md`](docs/03-roles-and-permissions.md) | The full capability matrix and how patient scope is resolved |
| [`docs/04-database-architecture.md`](docs/04-database-architecture.md) | Why `User` ≠ `Patient`, the timeline spine, concurrency, indexing |
| [`docs/05-api-architecture.md`](docs/05-api-architecture.md) | Endpoints, error envelope, middleware, pagination, rate limits |
| [`docs/06-design-system.md`](docs/06-design-system.md) | Identity, tokens, components, the four states, accessibility, safety copy |
| [`docs/07-security-privacy-and-storage.md`](docs/07-security-privacy-and-storage.md) | Threat model, risk register, file storage, regulatory posture |
| [`docs/08-mvp-and-roadmap.md`](docs/08-mvp-and-roadmap.md) | MVP definition, phases, and the 12 requirements the brief left open |
| [`docs/09-project-structure.md`](docs/09-project-structure.md) | Folder layout and the layering rule |

### Stack

Next.js 15 (App Router) · TypeScript (strict) · PostgreSQL 16 · Prisma 7 · Tailwind CSS ·
first-party component library.

### The layering rule

```
route handler / server component
        ↓  (never skipped)
    service          ← authorization happens here or above, never below
        ↓
     Prisma
```

A route handler that imports `db` directly is a bug. This is what keeps the patient-scope
check from being forgotten on the one endpoint where it matters.

---

## Three things worth knowing

**`User` and `Patient` are separate tables.** A login identity may act on several clinical
subjects through `PatientAccessGrant`. This is what makes family accounts, infants without
phones, and revocable access work at all — and it is the reason a whole class of
cross-patient privacy bug is structurally impossible here. See
[`docs/04`](docs/04-database-architecture.md) §1.

**Double-booking is prevented by the database, not by application code.** A unique index
on a nullable `slotLock` column enforces "at most one live appointment per doctor per start
time". Two patients confirming the same slot in the same second is a real scenario, and a
read-then-write check loses that race. Verified by concurrent test. See
[`docs/04`](docs/04-database-architecture.md) §4.

**External services are interfaces with honest development adapters.** Nothing pretends to
work. The dev SMS adapter says where the code went and refuses to run in production; the
payment adapter records an at-the-counter settlement rather than simulating a charge. Run
`grep -rn "INTEGRATION POINT" src/` to list every place that still needs a real vendor.

---

## Scripts

```bash
npm run dev          # development server
npm run build        # production build (runs prisma generate first)
npm run typecheck    # tsc --noEmit
npm run db:migrate   # create and apply a migration
npm run db:seed      # reset and reseed demo data
npm run db:reset     # drop, re-migrate, reseed
```

## Before this touches real patient data

Not optional. Each is expanded in
[`docs/07-security-privacy-and-storage.md`](docs/07-security-privacy-and-storage.md).

- [ ] Configure a real SMS provider with DLT-registered templates.
- [ ] Move object storage to a private S3-compatible bucket with encryption at rest.
- [ ] Revoke `UPDATE`/`DELETE` on `audit_logs` from the application database role, so
      append-only is a guarantee rather than a convention (risk R-7).
- [ ] Replace the in-process rate limiter with Redis before running more than one
      instance (risk R-15).
- [ ] Enable TLS with HSTS; confirm `secure` cookies in production.
- [ ] Set up encrypted, access-controlled backups (risk R-10).
- [ ] Complete a DPIA against the DPDP Act 2023, and take legal advice on ABDM/ABHA
      alignment (risk R-11) and on digital prescription requirements.
- [ ] Answer the twelve open product questions in
      [`docs/08`](docs/08-mvp-and-roadmap.md) §5 — several change the data model if
      answered late.
