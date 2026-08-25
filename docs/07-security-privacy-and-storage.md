# Clinic 360 — Security, Privacy & File Storage

## 1. Threat model

The realistic adversaries for a clinic app, in the order they actually occur:

1. **A curious insider** — a staff member looking up a neighbour, a celebrity, an ex.
   This is the most common real breach in healthcare and the one most systems ignore.
   Countered by scope checks, restricted projections, and audit logs that are actually
   reviewed.
2. **A family member with stale access** — a separated spouse who still holds a grant.
   Countered by revocable grants, adult confirmation, and the 18th-birthday review.
3. **A shared or lost phone** — extremely common in the Indian market. Countered by
   session expiry, revocable sessions, and re-authentication for sensitive actions.
4. **Credential stuffing / OTP brute force.** Countered by hashed OTPs, attempt caps,
   rate limits, and enumeration-resistant responses.
5. **Object-storage URL leakage** — a report URL forwarded on WhatsApp. Countered by never
   issuing a public URL; see §4.
6. **Ordinary web vulnerabilities** — XSS, CSRF, IDOR. Countered by React's escaping,
   `sameSite=lax` cookies, and IDOR being structurally impossible because every object
   fetch is patient-scoped through the policy.

## 2. Risk register

| ID | Risk | Severity | Mitigation | Status |
|---|---|---|---|---|
| R-1 | Family member reads another patient's records | **Critical** | Grant-gated access; no unscoped patient getter; projection levels; `activePatientId` untrusted | Implemented |
| R-2 | Staff browse records with no care relationship | **Critical** | Scope rules per role; restricted projections for lab/pharmacy/reception; break-glass requires a reason and alerts admin | Policy implemented; break-glass Phase 2 |
| R-3 | Report file URL leaks and is world-readable | **Critical** | No public bucket, no direct URLs; downloads via authorised route; shares are hashed, expiring, view-capped, revocable | Implemented |
| R-4 | OTP interception or brute force | High | scrypt-hashed OTP, 5-min TTL, 5 attempts then burned, per-phone and per-IP rate limits | Implemented |
| R-5 | Session theft on a shared device | High | httpOnly + sameSite cookie, 30-day absolute expiry, server-side revocation, visible device list | Cookie + revocation implemented; device list Phase 3 |
| R-6 | PHI in logs / error messages / analytics | High | No PHI in client logs; API errors are opaque with a correlation id; audit metadata allow-lists fields | Implemented |
| R-7 | Audit trail tampered or deleted | High | Append-only by design; DB grant revocation documented as a deploy step | **Partial — grant step is deployment work, not code** |
| R-8 | Payment data mishandled | High | We never touch PAN/CVV/VPA; provider-hosted collection only; we store a provider reference | By design |
| R-9 | Secrets in the repository | High | All secrets via env; `.env` git-ignored; `.env.example` documents names only | Implemented |
| R-10 | Backup exfiltration | High | Encrypted backups, restricted restore, key rotation | **Deployment work — not addressed in code** |
| R-11 | ABDM/ABHA compliance divergence | Medium | `abhaAddress`/`abhaNumber` reserved; consent-artefact model deferred | **Open — needs legal review** |
| R-12 | Patient consent not recorded | Medium | Consent captured at registration and per document share | Partial — registration consent Phase 1, granular consent Phase 4 |
| R-13 | Insecure direct object reference on documents | High | Document ids are cuids; every fetch re-checks patient scope | Implemented |
| R-14 | AI leaks records across patients | **Critical** | AI receives only pre-authorised, redacted retrieval output; no DB access; no cross-patient retriever exists | Design fixed, Phase 4 |
| R-15 | Rate limiter is per-process | Medium | Correct for one instance; documented as requiring Redis before scaling out | **Known limitation, marked in code** |
| R-16 | Notification content reveals PHI on a lock screen | Medium | Push/SMS bodies are deliberately non-clinical: "Your report is ready" — never the result | Implemented in copy rules |

Items marked **partial** or **open** are stated as such rather than claimed as done.

## 3. Data protection

- **In transit** — TLS everywhere, HSTS, secure cookies in production. No mixed content.
- **At rest** — Postgres volume encryption plus encrypted object storage. Application-level
  column encryption is deliberately *not* used for clinical text: it would break search and
  indexing while adding little against the realistic threats above, where the attacker has
  application-level access anyway.
- **Secrets** — environment only. `.env.example` lists every variable by name with no
  values. Nothing sensitive is ever committed.
- **Retention** — medical records are retained per clinic policy and Indian medical-records
  norms (a 3-year minimum is the common professional standard; the clinic's own policy is
  configurable). Sessions expire at 30 days. OTP challenges are purged after 24 hours.
  Audit logs are retained long-term.

## 4. File storage (§27)

**Metadata and bytes are separated.** `Document` holds the metadata and an opaque
`storageKey`. The bytes live in object storage. The key is never sent to the browser.

Download path:

```
GET /api/documents/:id/download
  → session               (401 if absent)
  → assertCanAccessPatient(actor, doc.patientId, "READ_DOCUMENT")
  → releasedToPatientAt check for patient-role actors
  → AuditLog "document.downloaded"
  → stream from StorageProvider with Content-Disposition and no-store
```

There is **no** code path that returns a storage URL to the client. Even when the real
adapter is S3, the route streams or issues a short-lived presigned URL server-side, never
a bucket path.

Sharing (§8 "Share securely") issues a `DocumentShare`: a random token whose SHA-256 is
stored, with an expiry, a view cap, and a revocation timestamp. The token appears exactly
once, in the generated link. A forwarded link stops working; a leaked link can be killed.

Dev adapter writes to `.storage/` on local disk (git-ignored) behind the same authorised
route — so the security-relevant code path is the *same* in development and production.
Only the byte source changes.

**DICOM:** we store `studyInstanceUid` and `pacsAccessionNo` plus the rendered report
document. We do not proxy pixel data, do not build a viewer, and do not re-host imaging.
The PACS remains the system of record for images.

## 5. Consent

- Registration captures consent to treat and to store records, with a timestamp.
- Family grants over adults require the adult's own OTP confirmation.
- Every document share is an explicit, logged, revocable act by the patient.
- Access grant history is preserved after revocation — "who could see this, and when" is
  answerable.

## 6. Regulatory posture

Written to be adaptable rather than claiming certification:

- **DPDP Act 2023** — health data is sensitive personal data. The design supports purpose
  limitation (projections), consent records, access rights (an export path exists via the
  timeline API), and breach-relevant audit trails. A formal DPIA is outstanding.
- **Telemedicine Practice Guidelines 2020** — relevant when video consults ship; the
  consultation model already records type and prescribing context.
- **ABDM/ABHA** — fields reserved, integration deferred, flagged as R-11 needing legal
  review before it is attempted.

This product is not claimed to be HIPAA-compliant; HIPAA is US law and does not apply to
an Indian clinic. Saying so plainly is more useful than a compliance badge.
