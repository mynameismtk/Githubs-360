# Clinic 360 — Technical Decisions

Each decision records the choice, the reasoning, and what it costs.

---

## TD-1 — Stack: Next.js 15 (App Router) + TypeScript, single deployable

**Chosen.** The brief's preferred stack, and it is the right call here.

Server Components let the patient home screen — the most latency-sensitive screen in the
product (§38, §46) — render on the server with its data already resolved, in one round
trip, with no client-side fetch waterfall and no loading spinner on first paint. For a
patient on a 4G connection in an Indian clinic waiting room, that is the difference
between "instant" and "sluggish".

One deployable (web + API in the same process) is correct at this scale: a single clinic
is thousands of patients, not millions. Splitting into a separate API service now would
buy nothing and cost a network hop, a second deploy pipeline, and duplicated auth.

**Cost:** couples web and API release cadence. Acceptable; revisit if a native mobile app
ships, at which point the `/api` layer is already the contract that app would consume —
which is why the API is a real REST surface and not only server actions.

## TD-2 — PostgreSQL + Prisma

**Chosen.** Health data is deeply relational (patient → episode → order → result →
invoice line) and demands referential integrity and transactions. Postgres also gives us
`jsonb` for the genuinely schemaless parts (structured examination findings, notification
payloads, audit metadata) without reaching for a second database.

Prisma over Drizzle: the schema here is large (30+ models) and much of the value is in
generated types flowing into React Server Components. Prisma's migration story and
relation ergonomics are stronger for a schema this shape. Drizzle wins on raw
query control and bundle size — neither is the binding constraint here.

**Cost:** Prisma's query builder can generate suboptimal SQL for deep nested reads. The
mitigation is explicit `select`s on hot paths (never `include` everything) and raw SQL for
analytics aggregates, both of which we do.

## TD-3 — Auth: first-party mobile + OTP, not a third-party auth SaaS

**Chosen, with care.** The brief says "a secure, production-ready authentication
solution". For this product that is a first-party implementation, and here is why:

- Indian patients authenticate by phone + OTP. Auth.js/Clerk/Auth0 all treat phone-OTP as
  a secondary path bolted onto an email/social primary. We would be fighting the library.
- The identity model is unusual: a login `User` may act on behalf of *several* `Patient`s
  (family). No off-the-shelf provider models that; we would end up writing the
  authorization layer ourselves regardless, and only outsourcing the credential check.
- Storing PHI-adjacent identity with a third party adds a data-residency question we do
  not need to answer.

What "production-ready" means concretely, and what is implemented:

| Property | Implementation |
|---|---|
| OTP never stored in plaintext | scrypt hash + per-code salt, `OtpChallenge.codeHash` |
| OTP not brute-forceable | 6 digits, 5-minute TTL, max 5 attempts, then challenge is burned |
| Request flooding | per-phone + per-IP rate limit on request and verify |
| Session tokens not guessable | 32 bytes from `crypto.randomBytes`, stored as SHA-256 hash |
| Session theft window bounded | 30-day absolute expiry, revocable server-side, `lastSeenAt` tracked |
| Cookie hardening | `httpOnly`, `sameSite=lax`, `secure` in production, `path=/` |
| Enumeration resistance | request-OTP responds identically for known and unknown numbers |
| No OTP in prod logs | dev-only console transport; the delivery interface is provider-agnostic |

`crypto.scrypt` from the Node stdlib rather than bcrypt/argon2 — it is memory-hard, it is
in the standard library, and it avoids a native build step in the container. For OTPs
(6-digit, 5-minute lifetime) it is comfortably sufficient.

**Cost:** we own this code and must maintain it. Mitigated by keeping it small
(~200 lines), pure, and concentrated in `src/server/auth/`.

## TD-4 — Authorization is a server-side policy layer, never a UI concern

Hiding a button is not access control. Every read and write of patient data goes through
`assertCanAccessPatient(actor, patientId, action)` in `src/server/auth/policy.ts`, which is
the *only* place patient-scope is decided. Route handlers and server components call it
before touching data. The UI then hides what the policy would refuse — as a courtesy, not
as a control.

The critical case is family access (§11, §26): a `User` may read a `Patient` only if a
non-revoked `PatientAccessGrant` exists linking them. There is no code path that resolves
a patient by ID without that check. This is the single most likely place for a
catastrophic privacy bug, so it is deliberately narrow and heavily commented.

## TD-5 — External services are interfaces with a dev adapter, never fake internals

Per the brief's "do not generate fake backend functionality while pretending it is
production-ready": each external dependency is a TypeScript interface plus a development
adapter, and the integration point is marked with `INTEGRATION POINT` in the source.

| Concern | Interface | Dev adapter | Real adapter (later) |
|---|---|---|---|
| SMS/OTP | `SmsProvider` | logs to server console | MSG91 / Gupshup / Twilio |
| Push | `PushProvider` | no-op + in-app record | FCM / APNs |
| Email | `EmailProvider` | logs to server console | SES / Resend |
| Object storage | `StorageProvider` | local disk under `.storage/`, served only via authorised route | S3 / MinIO with presigned URLs |
| Payments | `PaymentProvider` | manual/offline settlement | Razorpay / Cashfree (UPI) |

These adapters are *honest*: the dev SMS adapter does not pretend to send an SMS, it says
where the code went. The dev payment adapter records an offline settlement — which is a
real thing a clinic does at the counter — rather than simulating a card charge.

## TD-6 — Tailwind + a first-party component library, not a component kit drop-in

The brief asks for a strong original visual identity and explicitly rejects generic
templates. shadcn/ui is excellent, but it is a *starting point that everyone shares*; its
defaults are recognisable. We use Tailwind with a bespoke token layer (see
`docs/06-design-system.md`) and hand-built primitives sized for the two very different
surfaces (48px touch targets for patients, 32px dense rows for staff). Radix-style
behaviours (focus trap, roving tabindex, escape-to-close) are implemented in the few
components that need them rather than pulling the full dependency tree.

**Cost:** more code to own, and we must get accessibility right ourselves rather than
inheriting it. Mitigated by keeping the primitive set small and testing keyboard paths.

## TD-7 — Slot availability is computed, not stored

`DoctorScheduleRule` (recurring weekly availability) + `ScheduleException` (leave, extra
clinics) + booked `Appointment`s are combined at query time to produce bookable slots.
We do **not** pre-materialise a row per slot.

Reason: pre-materialising means a doctor changing next month's timings triggers a bulk
rewrite, and every schedule bug becomes a data-corruption bug. Computing keeps a single
source of truth. The cost is CPU per availability query, which is trivial (one doctor,
one day, a few dozen slots) and cacheable.

Double-booking is prevented at the **database** level, not in application logic: a unique
constraint on `(doctorId, startAt)` for non-cancelled appointments. Two patients tapping
"confirm" in the same second is a real scenario, and application-level checking loses that
race. See `docs/04-database-architecture.md` §"Concurrency".

## TD-8 — Money is integer paise, never floats

All amounts are `Int` paise (₹1,850.00 → `185000`). Floating-point rupees produce
reconciliation errors that are extremely expensive to unwind in a billing system.
Formatting to `₹1,850` happens once, at the display boundary.

## TD-9 — Localisation from day one, translations later

Every user-facing string goes through `t('key')` (§37). The dictionary starts with
English only; adding Malayalam, Tamil, Hindi, Kannada or Telugu is then a data task, not
a refactor. The message catalogue is typed, so a missing key is a compile error rather
than a blank label in production.

We use a small first-party i18n layer rather than next-intl: our needs are a typed
dictionary, a locale on the session, and an Indian number/date formatter. That is ~60
lines, and it avoids a routing-level dependency we would have to unwind.

## TD-10 — AI is a retrieval service with a hard data boundary

The assistant never receives a database connection and never receives raw PHI beyond what
the *asking user is already authorised to see* (§40). The pipeline is:

```
question → session auth → authorise patient scope → structured retrieval (typed queries only)
        → redaction → prompt assembly → model → safety post-check → answer + citations
```

The model chooses *which retriever to call from a fixed allow-list*; it never composes a
query. If retrieval returns nothing, the answer is "I don't have enough information to
answer that" — the service refuses to answer from parametric knowledge about this
patient. Symptom questions get a routing response, never a diagnosis. Phase 4.
