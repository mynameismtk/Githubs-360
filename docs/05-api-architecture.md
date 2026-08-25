# Clinic 360 — API Architecture

## 1. Shape

REST over JSON under `/api`, implemented with Next.js Route Handlers. Server Components
read through the same service layer directly (no HTTP hop for first render); the HTTP API
exists for client interactivity and as the contract a future native app would consume.

**The rule:** route handlers never touch Prisma. They parse, authenticate, authorise, call
a service in `src/server/services/*`, and shape the response. All business logic and every
data access lives in services. This keeps the authorization checks in one layer instead of
scattered across handlers.

## 2. Envelope

Success:
```json
{ "data": { ... }, "meta": { "page": 1, "pageSize": 20, "total": 57 } }
```

Error:
```json
{ "error": { "code": "SLOT_TAKEN", "message": "That slot was just booked.", "details": {} } }
```

`code` is a stable machine-readable string. `message` is patient-safe, human language
that can be shown directly in the UI (§32) — never a stack trace, never a SQL error,
never a Prisma error code. The mapping from internal failure to safe message happens once,
in `toApiError()`.

| HTTP | When |
|---|---|
| 200 / 201 | success |
| 400 `VALIDATION_ERROR` | Zod rejected the payload; `details` carries field errors |
| 401 `UNAUTHENTICATED` | no or expired session |
| 403 `FORBIDDEN` | authenticated but not permitted — capability or scope |
| 404 `NOT_FOUND` | also returned instead of 403 where existence itself is sensitive |
| 409 `CONFLICT` / `SLOT_TAKEN` | uniqueness or state conflict |
| 422 `UNPROCESSABLE` | valid shape, invalid clinically (e.g. booking in the past) |
| 429 `RATE_LIMITED` | with `Retry-After` |
| 500 `INTERNAL` | logged server-side with a correlation id; opaque to the client |

## 3. Surface

```
POST   /api/auth/request-otp          { phone }               → { challengeId, expiresInSeconds }
POST   /api/auth/verify-otp           { challengeId, code }   → sets session cookie
POST   /api/auth/logout
GET    /api/auth/session                                      → current user + accessible patients

GET    /api/patients/:id                                      → projection-aware
PATCH  /api/patients/:id
GET    /api/patients/:id/timeline     ?kind=&cursor=
GET    /api/patients/:id/appointments ?scope=upcoming|past
GET    /api/patients/:id/prescriptions
GET    /api/patients/:id/lab-orders
GET    /api/patients/:id/documents
GET    /api/patients/:id/invoices
GET    /api/patients/:id/journeys
GET    /api/patients/:id/follow-ups

GET    /api/family                                            → grants held by current user
POST   /api/family                    { name, dob, gender, relationship }
DELETE /api/family/:grantId                                   → revoke (never deletes)

GET    /api/specialities
GET    /api/doctors                   ?specialityId=&availableOn=
GET    /api/doctors/:id
GET    /api/doctors/:id/availability  ?from=&to=              → computed slots

POST   /api/appointments              { patientId, doctorId, startAt, type, reason }
GET    /api/appointments/:id
PATCH  /api/appointments/:id          { action: "reschedule"|"cancel"|"check-in", ... }

GET    /api/queue                     ?doctorId=&date=
GET    /api/queue/position            ?appointmentId=          → patient-facing view

POST   /api/consultations             (doctor)
PATCH  /api/consultations/:id         { ...draft }  |  { action: "sign" }
POST   /api/prescriptions
POST   /api/lab-orders
PATCH  /api/lab-orders/:id            { action: "collect"|"upload"|"verify" }
POST   /api/imaging
POST   /api/follow-ups

GET    /api/documents/:id/download                            → authorised stream, never a public URL
POST   /api/documents/:id/share       { expiresInHours }      → revocable tokenised link

POST   /api/payments/intent           { invoiceId }           → provider-agnostic intent
POST   /api/payments/webhook                                  → signature-verified callback

GET    /api/notifications             ?unread=
PATCH  /api/notifications/:id         { read: true }

GET    /api/admin/overview
GET    /api/admin/analytics           ?metric=&from=&to=
GET    /api/admin/audit               ?patientId=&actorId=&action=
```

## 4. Cross-cutting middleware

Every handler is wrapped by `withApi()`, which composes, in order:

1. **Correlation id** — generated or read from `x-request-id`, attached to every log line.
2. **Session resolution** — cookie → session → user; expired sessions are cleared.
3. **Capability check** — declared per route as `{ roles: [...] }`.
4. **Validation** — Zod schema for params, query and body. Parse, don't validate: the
   handler receives typed data or the request never reaches it.
5. **Rate limiting** — on auth (strict, per-phone and per-IP), on writes, on search.
6. **Handler** — calls a service.
7. **Audit** — routes declare `audit: { action, severity }`; the wrapper writes the row
   after a successful response, including on failed authorization (those are the
   interesting ones).
8. **Error mapping** — any thrown `AppError` becomes its envelope; anything else becomes
   an opaque 500 with the correlation id logged server-side.

## 5. Pagination

Cursor-based on anything time-ordered (timelines, notifications, audit): `?cursor=<id>&limit=20`
returns `meta.nextCursor`. Offset pagination only for admin tables where a page number is
genuinely useful. Cursors are opaque record ids, and the cursor record is re-scoped on
every request — a cursor from another patient's timeline resolves to nothing.

## 6. Rate limits

| Endpoint | Limit |
|---|---|
| `POST /auth/request-otp` | 3 / 10 min per phone; 20 / hour per IP |
| `POST /auth/verify-otp` | 5 attempts per challenge, then burned |
| write endpoints | 60 / min per session |
| search | 30 / min per session |
| `documents/:id/download` | 30 / min per session |

The Phase 1 implementation is an in-process fixed-window counter, which is correct for a
single instance and clearly marked as needing Redis before horizontal scaling.

## 7. Idempotency

Booking and payment accept an `Idempotency-Key` header. `Payment.idempotencyKey` is a
unique column, so a retried or double-tapped payment cannot double-charge. Booking relies
on the `slotLock` unique constraint for the same guarantee.
