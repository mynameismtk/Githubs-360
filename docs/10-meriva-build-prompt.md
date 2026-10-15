# Build prompt — Meriva Medical Centre patient & clinic app

> **How to read this prompt**
> - **v1**: the reference implementation ships this. Build it.
> - **Fix**: the reference has a defect here. Build the corrected behaviour described. §15 lists every defect so you do not copy it.
> - **Not in v1**: designed but not built. Do not build it. Where this prompt names an honest placeholder, show that placeholder.
> - In screen specs, text in "quotes" is verbatim UI copy. `{braces}` are interpolations. Developer comments and design rationale taken from the source are marked "rationale, not UI copy". Never render them.
> - Anything clinic-specific (name, colours, phones, logo, tagline) comes from the `Clinic` database row. Nothing Meriva-specific is hard-coded.
> - All demo data is fictional.

---

## 1. Role & objective

You are building the **Clinic 360** platform and launching it as **Meriva Medical Centre, Coimbatore, Tamil Nadu**. Clinic 360 is a single-clinic digital ecosystem. One Next.js deployment and one Postgres database serve one clinic through three surfaces:
- a mobile-first **patient app** (`/app`) for patients and their families
- a keyboard-first **clinical console** (`/console`) for doctors, nurses, the laboratory and the pharmacy
- a desktop **operations console** (`/ops`) for reception and administration

"Clinic 360 is the operating system for a single multi-speciality clinic. It is **not** a marketplace and **not** a doctor-discovery app. Every patient in it is a patient *of this clinic*."

v1 is the **Phase 1 Foundation**:
- phone-OTP auth, sessions, RBAC and a central policy layer
- audit
- clinic configuration
- specialities and doctors with computed availability
- family profiles and switching
- end-to-end booking, reschedule and cancel
- patient home and read-only record viewers over seeded data
- reception check-in and day board
- doctor, nurse, lab and pharmacy day views
- admin lists and audit log

The UI must re-skin entirely from the clinic record without a rebuild.

- **Product promise (one line):** "One clinic. One app. One complete health journey."
- **Clinic tagline (Meriva):** "A place where care meets life."
- **MVP outcome, your north star:** "A patient books an appointment from their phone in under 60 seconds, arrives, is seen, and afterwards finds their prescription and their report in the app without calling the clinic — while the clinic runs the visit entirely inside the system."
- **Non-negotiable principles:** "Hiding a button is not access control." · "External services are interfaces with a dev adapter, never fake internals." · "A route handler that imports `db` directly is a bug." · "The patient app optimises for reassurance; the consoles optimise for keystrokes per task."

---

## 2. Brand

### 2.1 Identity
- **Name:** "Meriva Medical Centre". Always spell it "Centre", as the logo does. **City:** Coimbatore, Tamil Nadu. **Tagline:** "A place where care meets life."
- "Clinic 360" is the internal platform name. **It must never appear to Meriva patients or staff**: not in the tab title, onboarding, the login tile, MRNs, placeholders, SMS or the i18n catalogue (see §15 A).
- No public Meriva website was found (`assets/README.md`). Set `Clinic.websiteUrl = null`. Do not link to or reference a website until the clinic supplies one.

### 2.2 Logo
- **Construction:**
  - A flower of 8 leaf-petals around a navy medical cross. 4 royal-blue petals sit on the axes (top, bottom, left, right) and 4 orange petals sit on the diagonals.
  - The wordmark "MERIVA" is set in a classical serif, with a sky-blue swoosh through the A.
  - "— MEDICAL CENTRE —" is set in wide-tracked geometric caps.
  - The tagline is set in a serif.
- **Files (`assets/logo/`):**
  - the original 440×440 JPG
  - an alpha PNG at ×3
  - layers at ×4: `mark.png` (flower and cross), `wordmark.png` (also split into `wordmark_text.png` and `wordmark_swoosh.png`), `descriptor.png` ("— MEDICAL CENTRE —"), `tagline.png`
  - `petal_0…8.png`: 8 petals plus the cross, which is id 3, `#00316A`
- **Usage rules:**
  - Use the **mark** (`mark.png`) wherever a small square logo is needed. In v1 that is the login tile (48px, `rounded-xl`), which replaces the hard-coded "360" tile. Serve it through `Clinic.logoUrl`.
  - Use the **full lockup** (mark, wordmark, descriptor, tagline) only for brand and marketing moments outside the product UI, such as launch video and print.
  - Always render the wordmark, descriptor and tagline from the supplied image layers. Never re-typeset them in a live font. Never recolour the petals, swap axis and diagonal colours, detach the swoosh, or change the aspect ratio.
  - Place the logo on white `#FFFFFF` or bone `#FAF9F7`.
  - When the logo is the only identifier on screen, give it `alt="{clinic.name}"`. Otherwise mark it decorative (`alt=""`).

### 2.3 Palette → token mapping

| Brand colour | Hex | Where it appears in the logo | Product use |
|---|---|---|---|
| Navy | `#002C69` | wordmark, cross | Inspires `--brand-ink`. Not a token |
| Royal blue | `#035EA6` | axis petals | Inspires `--brand`. Not a token |
| Sky blue | `#1E8DD2` | highlights, swoosh | Marketing only. White on it is ≈3.6:1, so never use it behind text |
| Orange | `#FA7A11` | diagonal petals | Inspires `--accent`. Not a token |
| Amber | `#FDA01A` | orange highlights | Marketing only. White on it is ≈2.1:1 |
| App bone | `#FAF9F7` | — | `--bg` (unchanged) |
| App ink | `#16211F` | — | `--ink` (unchanged) |

**Launch token mapping.** Store these on the Clinic record, never in CSS files.

> **These Meriva values are proposed.** They are derived from `assets/palette.json` (royal blue `#035EA6`, orange `#FA7A11`) and the clinic has not approved them. Confirm them with Meriva before seeding.

| Token | Platform default | **Meriva (proposed)** | Source |
|---|---|---|---|
| `--brand` | `#0E7C6B` | **`#0E56A0`** | `Clinic.brandPrimary` |
| `--accent` | `#C2703D` | **`#F07F1A`** | `Clinic.brandAccent` |
| `--brand-hover` | `#0B6759` | **`#0B4787`** | `Clinic.settings.theme.brandHover` (Fix) |
| `--brand-ink` | `#0A5F52` | **`#0B3A6E`** | `Clinic.settings.theme.brandInk` (Fix) |
| `--brand-wash` | `#E8F3F0` | **`#E7EFF8`** | `Clinic.settings.theme.brandWash` (Fix) |
| `--accent-wash` | `#FBF0E8` | **`#FEF1E3`** | `Clinic.settings.theme.accentWash` (Fix) |

Status tokens (positive, caution, critical, emergency) are **never** re-themed per clinic. This is intentional.

**Contrast of the proposed Meriva mapping.** These are calculated values. Verify each one with tooling.
- White on `#0E56A0` ≈ 7.3:1 ✓
- `#0E56A0` on `#FAF9F7` ≈ 7.0:1 ✓
- `#0B3A6E` on `#E7EFF8` ≈ 9.8:1 ✓
- **White on `#F07F1A` ≈ 2.7:1 ✗.** Any text on an accent fill must use `--ink` (≈6.1:1). This includes the notification count badge.
- **`#F07F1A` on `#FEF1E3` ≈ 2.4:1 ✗.** Accent-tone badges must use ink text plus an icon on accent-wash. Never put accent-coloured text on a wash.

### 2.4 Typography
- **Inter** (400/500/600/700) is used for **all product UI**, on every surface.
- **Cinzel** (wordmark match), **Montserrat** (descriptor match) and **Cormorant Garamond** (tagline match) are for brand and marketing moments only. Do not load them in the product bundle. The font files are in `assets/fonts/`.

### 2.5 Voice & tone: calm, premium, non-alarming, never diagnostic
1. **Plain language with no technical residue.** A patient never sees a status code or a stack trace. Say whose problem it is: "This is a problem on our side, not yours. Please try again in a moment."
2. **Always offer a next step**, such as "Try again", "Contact clinic" or "Call {clinic.name}".
3. **Never state or imply a diagnosis.** Lab flags are positional words ("Above range", "Below range") followed by "Please discuss them with your healthcare professional. This is not a diagnosis."
4. **Be honest about what is not built:** "Arriving in the next release", "Online payment is not switched on for this clinic yet." Never fake a working feature (TD-5: "never fake internals").
5. **Never judge.** Adherence would show as counts ("12 of 14 doses logged"), never as percentages. That feature is not in v1.
6. **Emergency copy is direct**, with no interstitial: "If this is a medical emergency, call for help now."
7. **Lock-screen discretion.** Push and SMS bodies are non-clinical: "Your report is ready", never the result.
8. **Use the clinic's voice:** "we" means the clinic. Use the clinic's name, never the platform name. Use Indian English with British spellings ("Centre", "Paediatrics", "Gynaecology", "speciality") and en-IN formats (₹1,850 · 26 Aug 2026 · 10:20 am).

---

## 3. Tech stack & architecture

### 3.1 Stack

| Concern | Choice |
|---|---|
| Framework | Next.js `^15.5` App Router, React `^19.2`, TypeScript `^5.9`. One deployable for web and API |
| DB | PostgreSQL 16+ |
| ORM | Prisma `^7.9` with `@prisma/adapter-pg` + `pg`. The datasource block has no `url`; Migrate reads `DATABASE_URL` from `prisma.config.ts`. The runtime client is a `PrismaPg` adapter singleton on `globalThis` outside production. It throws at boot if `DATABASE_URL` is missing: "DATABASE_URL is not set. Copy .env.example to .env and fill it in." |
| Env loading | `dotenv` (dev dependency). Put `import 'dotenv/config'` in `prisma.config.ts` and `prisma/seed.ts` |
| Validation | zod `^4` |
| Dates | First-party Intl helpers in `src/lib/dates.ts`. `date-fns ^4` is declared as a dependency, but the reference never imports it. Drop it, or use it only behind `dates.ts` |
| Styling | Tailwind `^3.4` + PostCSS (`tailwindcss`, `autoprefixer`) and a first-party token layer and component library. **Not shadcn**, because its defaults are recognisable. You own the accessibility |
| Server-only guard | `server-only`. `src/server/db.ts` must import `'server-only'` (Fix: the reference's `db.ts` does not). The seed builds its own `PrismaPg` client |
| Lint | `eslint` + `eslint-config-next` as devDependencies, plus an `eslint.config.mjs`. **Fix:** the reference has a `lint` script but no ESLint config or dependencies, so `next lint` prompts for setup or fails. `next lint` is also deprecated in Next 15.5 |
| Seed runner | `tsx prisma/seed.ts` |
| Fonts | Inter via Google Fonts, weights 400;500;600;700, `display=swap` |

**Scripts:**
- `dev`, `start`, `typecheck`
- `lint` = `eslint .`
- `build` = `prisma generate && next build`
- `db:generate`, `db:push`, `db:migrate` = `prisma migrate dev`
- `db:seed` = `tsx prisma/seed.ts`
- `db:reset` = `prisma migrate reset --force`
- **Add `test`.** The reference has no tests (§14).

**Local bootstrap:**
1. `createdb <name>` (Postgres 16+ running)
2. `cp .env.example .env`, then set `DATABASE_URL`
3. `npm install`
4. `npm run db:migrate`
5. `npm run db:seed`
6. `npm run dev`

**Architectural decisions (keep the reasoning):**
- **TD-1:** Server Components resolve the patient home in one round trip "for a patient on a 4G connection in an Indian clinic waiting room". `/api` is a real REST surface so a future native app can consume it. A single clinic means thousands of patients, not millions, so there is no separate API service.
- **TD-2:** Postgres plus Prisma. Health data is relational and transactional, and `jsonb` covers the schemaless parts. Use explicit `select`s and raw SQL for analytics.
- **TD-3:** First-party phone OTP built on Node `crypto.scrypt`. Keep it to about 200 lines in `src/server/auth/`.
- **TD-4:** Authorisation is a server-side policy layer, never a UI concern. The UI hides what the policy would refuse "as a courtesy, not as a control".
- **TD-5:** External services are interfaces with honest dev adapters.
- **TD-7:** Slot availability is computed, never stored.
- **TD-8:** Money is integer paise.
- **TD-9:** Localisation infrastructure exists from day one.

### 3.2 Layering rule
```
route handler / server component
        ↓  (never skips)
    service            ← authorization happens here or above, never below
        ↓
     Prisma
```
No page or route imports `db`. **Fix:** the reference broke this in six server components. Move their queries into services: the booking page loader, records hub, messages, console patient chart, ops patient view and ops audit.

### 3.3 Folder structure
```
prisma/            schema.prisma, migrations/, seed.ts
prisma.config.ts   next.config.ts   tailwind.config.ts   postcss.config.mjs   eslint.config.mjs   .env.example
src/app/
  layout.tsx  page.tsx  globals.css
  login/  onboarding/
  app/        (patient surface; layout guard + PatientShell)
  console/    (clinical surface; layout guard + StaffShell)
  ops/        (operations surface; layout guard + StaffShell)
  api/        auth/{request-otp,verify-otp,logout,session}  family/  family/active
              patients/search  appointments/  appointments/[id]  doctors/[id]/availability
src/components/
  ui/         button, card, badge, avatar, input, sheet, states, icons
  patterns/   patient-shell, staff-shell, appointment-status, coming-next
src/server/
  db.ts  api.ts (withApi)  audit.ts
  auth/       otp.ts  session.ts  policy.ts  rate-limit.ts
  services/   auth-, clinic-, doctor-, availability-, appointment-, patient-, home-,
              records-, console-, notification-service.ts
  integrations/index.ts
src/lib/      dates.ts  money.ts  errors.ts  cn.ts
src/i18n/     en.ts  index.ts
```
- Files are kebab-case. Services are named `*-service.ts`.
- `cn()` is a falsy-filtering class joiner with no dedupe, so a later class does not override an earlier one. Write classes accordingly.

### 3.4 Runtime theming from the clinic record (Fix version)
- **Data:**
  - `Clinic.brandPrimary` defaults to `"#0E7C6B"`. `Clinic.brandAccent` defaults to `"#C2703D"`.
  - Add a `Clinic.settings.theme` object `{ brandHover, brandInk, brandWash, accentWash }`.
  - Validate every value as `#RRGGBB` on write.
  - When a theme key is absent, derive the value (for example with `color-mix()`) and verify contrast.
- **Injection:**
  - The **root layout** calls `getClinic()` once per request (React `cache()`d) and sets all six brand variables on `<html>`.
  - This brands `/`, `/login`, `/onboarding`, the unlinked-account screen, `/app`, `/console` and `/ops` alike.
  - The reference injected only `--brand` and `--accent`, and only inside PatientShell. Do not repeat that.
- **Token format:**
  - Define every colour token as RGB channels, for example `--brand-rgb: 14 86 160`, and map Tailwind colours to `rgb(var(--brand-rgb) / <alpha-value>)`. Opacity classes such as `bg-surface/95`, `border-brand/15` and `bg-brand-wash/40` must compile.
  - In the reference they silently produced no CSS. The sticky header and bottom nav had no background, and tinted borders fell back to the default border colour.
  - Alternatively, use `color-mix()`.
- **Clinic-derived chrome:**
  - `metadata.title` = `{clinic.name}`. Description = "Your clinic, your records, your care — in one place."
  - The `theme-color` meta is light `#FAF9F7` and dark `#101614`. Keep these neutral.
  - The login tile uses `Clinic.logoUrl`, falling back to an initials tile on `--brand`.
  - The onboarding title uses `clinic.name`.
- Sheets render inline, with no portal, inside the themed tree.

### 3.5 Timezone (Fix)
- There must be one source of truth: `Clinic.timezone` (`"Asia/Kolkata"` for Coimbatore). `CLINIC_TIMEZONE` is an env fallback, read only when the Clinic row has no timezone.
- All formatting and day-boundary logic goes through `src/lib/dates.ts`. Client components receive the timezone as a prop and never hard-code `'Asia/Kolkata'`.
- **How helpers get the timezone:** in the reference, the helpers are module-level and bound to the env value. Instead, give every helper an explicit `tz: string` argument, or create them with `makeDateHelpers(clinic.timezone)`. Server code passes `getClinic().timezone`. Client components receive `timezone` as a prop.
- Instants are stored in UTC. Calendar days are `@db.Date`. Recurring times are `"HH:mm"` clinic-local strings, resolved in one place by `wallTimeToInstant`.
- **Helpers:**

  | Helper | Behaviour |
  |---|---|
  | `formatTime`, `formatDate`, `formatDateShort`, `formatWeekday`, `formatDayNum`, `formatDateTime`, `formatLongDate` | en-IN, clinic timezone |
  | `clinicDateKey` | en-CA locale, `YYYY-MM-DD` |
  | `dateOnly` | — |
  | `clinicDayOfWeek` | noon-UTC anchor |
  | `wallTimeToInstant` | DST-safe; probes the offset twice with Intl |
  | `addDays`, `addMinutes`, `ageFromDob` | — |
  | `ageLabel` | "N yrs" from age 2, otherwise "N mo" |
  | `relativeDayLabel` | "Today" / "Tomorrow" / "Yesterday" / "Tue, 26 Aug" |
  | `greeting` | "Good morning" before 12, "Good afternoon" before 17, otherwise "Good evening" |

### 3.6 Money
- Store integer paise everywhere: ₹1,850.00 = `185000`.
- `formatMoney(paise, {showPaise})` uses Intl en-IN INR and shows paise only when they are non-zero ("₹1,850", "₹800"). Also provide `formatAmount` and `rupeesToPaise` (`Math.round`).
- Use `formatMoney` at every display boundary, including the Home payment line (§15 D).

### 3.7 i18n
- **Structure:**
  - A typed dictionary at `src/i18n/en.ts` with sections `common`, `nav`, `home`, `booking`, `errors`, `emergency` and `safety`.
  - A typed dot-path `t()` in `src/i18n/index.ts`. It falls back to English and warns in development on a missing key.
  - `SUPPORTED_LOCALES`: en, ml, ta, hi, kn, te. `LOCALE_LABELS` are English, മലയാളം, தமிழ், हिन्दी, ಕನ್ನಡ, తెలుగు.
- **v1:** only `en` is populated, and `<html lang="en">` is fixed. Route patient-facing strings through `t()`. The reference inlined every string (see §15).
- Where the catalogue and the rendered copy disagree, **the rendered copy in this prompt wins**:
  - "…call for help now."
  - "Call {clinic.name}"
  - "Directions to the clinic"
  - the plural lab banner
- Delete `common.appName: 'Clinic 360'`.

### 3.8 Environment variables (`.env.example`)

| Var | Read in v1 | Notes |
|---|---|---|
| `DATABASE_URL` | ✓ required | fail fast |
| `CLINIC_TIMEZONE` | ✓ fallback | `"Asia/Kolkata"`; used only when `Clinic.timezone` is empty |
| `NODE_ENV` | ✓ | gates the dev OTP display and secure cookies |
| `SMS_PROVIDER` | ✓ | unset or `console` gives the dev transport, which is refused in production |
| `SMS_PROVIDER_KEY`, `SMS_SENDER_ID`, `SMS_DLT_TEMPLATE_OTP` | stub | "DLT registration is mandatory for transactional SMS in India" |
| `EMAIL_PROVIDER`, `EMAIL_PROVIDER_KEY`, `EMAIL_FROM` | stub | |
| `PUSH_PROVIDER`, `FCM_SERVICE_ACCOUNT_JSON` | stub | |
| `STORAGE_LOCAL_PATH` | declared, never read at runtime | Read only by the `LocalDiskStorage` adapter, which has no v1 callers. Default `.storage`, git-ignored |
| `STORAGE_PROVIDER`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | stub | |
| `PAYMENT_PROVIDER`, `PAYMENT_PROVIDER_KEY`, `PAYMENT_PROVIDER_SECRET`, `PAYMENT_WEBHOOK_SECRET` | stub | |
| `ANTHROPIC_API_KEY` | Not in v1 | the Phase 4 assistant "never receives a database connection" |

`.env` is git-ignored. Only `.env.example` is tracked.

### 3.9 Integration points as stubs (`src/server/integrations/index.ts`)
Mark each one with an `// INTEGRATION POINT` comment. `grep -rn "INTEGRATION POINT" src/` then lists the five integration points (SMS, email, push, storage, payments) plus the file's explanatory header comment, which also contains the phrase. Alternatively, reword the header so the grep returns exactly five lines.

| Concern | Interface | Dev adapter (v1) | Planned vendors |
|---|---|---|---|
| SMS | `SmsProvider.send({to, body, templateId?})` | `ConsoleSmsProvider` prints a box headed "┌─ SMS (not actually sent — dev transport)" | MSG91, Gupshup, Twilio with DLT templates |
| Email | `EmailProvider` (plain-text body by design) | `ConsoleEmailProvider` logs `[email:dev] to=… subject=…` | SES, Resend, Postmark |
| Push | `PushProvider` | `NoopPushProvider` returns `{skipped:true}`. The in-app row is still written | FCM, APNs ("Needs device-token registration") |
| Storage | `StorageProvider.put/get/delete` | `LocalDiskStorage` under `STORAGE_LOCAL_PATH`, with a path-traversal guard | Private S3 or MinIO with SSE and server-side presign |
| Payments | `PaymentProvider.createIntent/verifyWebhook`, `supportsUpi` | `ManualPaymentProvider`: at-counter settlement. `createIntent` returns `manual_<ref>`, status PENDING, no redirect. `verifyWebhook` always returns false | Razorpay, Cashfree, PhonePe for UPI |

- **SMS guard (Fix):**
  - In production with `SMS_PROVIDER` unset or `console`, the app must **refuse to start**: "SMS_PROVIDER is not configured. Refusing to run in production with the dev SMS transport." The reference threw lazily on the first send.
  - Any other unimplemented name throws `SMS provider "X" is not implemented yet.`
- Storage and payment getters exist but have no callers in v1.

---

## 4. Users, roles & permissions

### 4.1 Roles
`Role` enum: `PATIENT, DOCTOR, NURSE, LAB_TECH, PHARMACIST, RECEPTIONIST, ADMIN`. Each User has **exactly one role**. "Role-switching within a session is a well-known source of privilege-escalation bugs… ('which hat were they wearing?')".

| Role | Identity chain | Surface | Shell product label / role label |
|---|---|---|---|
| PATIENT | User → PatientAccessGrant → Patient | `/app` | — |
| DOCTOR | User → Doctor (1:1) | `/console` | "Clinical console" / "Doctor" |
| NURSE | User → StaffProfile | `/console` | "Clinical console" / "Nurse" |
| LAB_TECH | User → StaffProfile (`permissions` e.g. `{ "canVerifyResults": true }`) | `/console` | "Clinical console" / "Laboratory" |
| PHARMACIST | User → StaffProfile | `/console` | "Clinical console" / "Pharmacy" |
| RECEPTIONIST | User → StaffProfile | `/ops` | "Front desk" / "Reception" |
| ADMIN | User → StaffProfile | `/ops` | "Administration" / "Administrator" |

`surfaceForRole`: PATIENT → `/app`. DOCTOR, NURSE, LAB_TECH and PHARMACIST → `/console`. RECEPTIONIST and ADMIN → `/ops`.

### 4.2 Two independent questions
- **Capability:** may this role do this kind of action at all? Enforce it with `assertRole(actor, roles)` and the `withApi` `roles` option.
- **Scope:** may this actor act on *this* patient? Enforce it with `assertCanAccessPatient`.
- "Most healthcare privacy breaches are scope failures, not capability failures."

### 4.3 Capability matrix
Legend: ✓ allowed · ~n allowed with condition n · blank = denied.

| Capability | PAT | DOC | NUR | LAB | PHA | REC | ADM | v1 status |
|---|---|---|---|---|---|---|---|---|
| Manage own profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Read-only in v1 (no edit endpoint) |
| Add family member | ✓ | | | | | ~1 | ✓ | **v1 for PATIENT only** (`POST /api/family`) |
| Register new patient | ~2 | | | | | ✓ | ✓ | Not in v1 (staff registration) |
| Edit demographics | ~3 | | | | | ✓ | ✓ | Not in v1 |
| Merge duplicates | | | | | | | ✓ | Not in v1 |
| Book appointment | ~4 | | | | | ✓ | ✓ | **v1** API for PAT/REC/ADM. Patient UI only; no staff booking UI |
| Reschedule / cancel | ~4 | ~5 | | | | ✓ | ✓ | **v1 + Fix**: enforce this row exactly (§4.6) |
| View doctor availability | ✓ | ✓ | ✓ | | | ✓ | ✓ | **v1 + Fix**: gate the role list |
| Check patient in | | | | | | ✓ | ✓ | **v1** |
| Overbook | | | | | | ~6 | ✓ | Not in v1 (`settings.allowOverbooking` is seeded but unread) |
| View own queue position | ✓ | | | | | | | Not in v1 (Phase 3) |
| View / reorder clinic queue | | ~7 | ~7 | | | ✓ | ✓ | Not in v1 |
| Mark consultation started/ended | | ✓ | | | | | | Not in v1 |
| View own record | ✓ | | | | | | | **v1** |
| View any patient's record | | ~8 | ~9 | ~10 | ~11 | ~12 | ~13 | **v1 + Fix**: enforce projections on data |
| Record vitals | | ✓ | ✓ | | | | | Not in v1 (placeholder) |
| Write / amend consultation note, prescribe, order lab/imaging | | ✓ (~14) | | | | | | Not in v1 (Phase 2) |
| Sample status / upload result / verify (~15) | | | | ✓ | | | | Not in v1 |
| Dispense medication | | | | | ✓ | | | Not in v1 (worklist is read-only) |
| Create follow-up | | ✓ | | | | ~16 | ✓ | Not in v1 |
| Instantiate care journey | | ✓ | | | | | ✓ | Not in v1 |
| View own invoices | ✓ | | | | | | | **v1** |
| View any invoice | | | | | ~17 | ✓ | ✓ | **v1** for REC/ADM (ops patient view) |
| Create / adjust invoice | | | | | ✓ | ✓ | ✓ | Not in v1 |
| Record payment | | ~18 | | | ✓ | ✓ | ✓ | Not in v1 |
| Issue refund | | | | | | | ✓ | Not in v1 |
| Change service pricing | | | | | | | ✓ | Not in v1 |
| Manage doctors/departments, staff & permissions, branding, AI knowledge base | | | | | | | ✓ | Not in v1. `/ops/doctors` is a read-only admin list |
| Manage doctor schedules (~19) | | ~19 | | | | ~19 | ✓ | Read-only "My schedule" in v1 |
| View clinic analytics (~20) | | ~20 | | | | | ✓ | **v1** admin-only stat tiles. **Fix:** compute revenue server-side only for ADMIN |
| Read audit log | | | | | | | ✓ | **v1** `/ops/audit` |

**Conditions**
1. Reception may link an existing patient to an account holder only with recorded consent.
2. A patient adding family creates patients, subject to the family limits (§4.7).
3. A patient may edit their own demographics. Clinical fields (blood group, allergies) are *proposed* by the patient and confirmed by staff.
4. Only for patients the user holds a non-revoked grant for.
5. A doctor may cancel or reschedule on their own list only.
6. Reception overbooking requires a reason string and is audited.
7. Doctor and nurse see the queue for their own clinic session only.
8. Doctor scope: an appointment (any status) OR care team OR referral OR break-glass. v1 implements appointment and care journey only.
9. Nurse scope: patient on today's list for a doctor the nurse is assigned to. v1 has no shift model, so it uses today's list with any doctor.
10. Lab: restricted view of demographics, the order, and notes attached to the order. "A lab tech does not need the psychiatric history."
11. Pharmacy: restricted view of demographics, allergies and active prescriptions.
12. Reception: demographics, appointments and invoices. **No clinical content.** Reception "can see that a lab report exists and that it is ready; not what it says."
13. Admin: operational record by default. Clinical content is break-glass only and always audited. "An administrator is not a clinician."
14. Signed notes are append-only. An amendment creates a linked Consultation revision, time-limited to 24h without a reason.
15. Verification requires `canVerifyResults`. Two-person release is a config flag that defaults to allowing the same person.
16. Reception may create a follow-up *task* only when a doctor recorded the instruction.
17. Pharmacy sees pharmacy invoice lines only.
18. A doctor may record a consultation payment they collected directly.
19. A doctor manages their own availability. Reception manages exceptions, with a reason.
20. Doctors see their own utilisation, not clinic-wide revenue.

### 4.4 Scope resolution: `assertCanAccessPatient(actor, patientId, action)` in `src/server/auth/policy.ts`
"This module is the single place that decides whether an actor may touch a patient."
- **Actions:** `READ | READ_CLINICAL | READ_DOCUMENT | BOOK | UPDATE | WRITE_CLINICAL`.
- **Returns** a projection, not a boolean: `FULL | RESTRICTED | OPERATIONAL`, plus a `basis` string that is recorded in the audit row's metadata.

| Actor | Rule | Result / basis | Denial |
|---|---|---|---|
| PATIENT | Grant found by `(userId, patientId)` with status ACTIVE and `revokedAt` null | FULL, basis `grant:<relationship>` | Missing, revoked or not ACTIVE → **404** ("telling someone 'that patient exists but is not yours' is itself a disclosure"). VIEW_ONLY + BOOK/UPDATE/WRITE_CLINICAL → 403 "You have view-only access to this family member." WRITE_CLINICAL is always forbidden for patients |
| Any staff (precondition) | Patient is in `actor.clinicId` and `deletedAt` is null | — | 404 |
| DOCTOR | Any appointment with this doctor (any time, any status) → basis `care-relationship:appointment`; or a CareJourney with this doctor → basis `care-relationship:journey` | FULL | 403 "You do not have a care relationship with this patient. Use emergency access if this is clinically necessary." A DOCTOR user with no Doctor row → 403 with the default message "You don't have access to this." |
| NURSE | Patient has a non-cancelled appointment **today**. **Fix:** today in the clinic timezone, not server-local midnight | RESTRICTED, basis `nurse:today` | 403 "This patient is not on today’s list." |
| LAB_TECH | Patient has a LabOrder not CANCELLED. The docs say "open order", but the reference also counts VERIFIED (see §15) | RESTRICTED, basis `lab:open-order` | 403 "No laboratory order exists for this patient." |
| PHARMACIST | Patient has an ACTIVE prescription | RESTRICTED, basis `pharmacy:active-rx` | 403 "No active prescription exists for this patient." |
| RECEPTIONIST | Non-clinical actions | OPERATIONAL, basis `reception:same-clinic` | READ_CLINICAL / WRITE_CLINICAL → 403 |
| ADMIN | Non-clinical actions | OPERATIONAL, basis `admin:same-clinic` | Clinical → 403 "Clinical records require emergency access, which is logged and reviewed." |

Helpers:
- `accessiblePatientIds(actor)` returns the ACTIVE, non-revoked grant patient ids for PATIENT, and `[]` for staff.
- `requireAccessiblePatientIds` throws NOT_FOUND "No patient profile is linked to this account yet."
- `resolveActivePatientId` is described in §4.7.

### 4.5 Projection enforcement

| Projection | What the server may return | Status |
|---|---|---|
| FULL (patient on own grant; doctor in scope) | Everything for that patient | v1 |
| OPERATIONAL (reception/admin) | Demographics, contact, emergency contact, appointments, invoices. `notableHistory` and `allergies` are stripped server-side. No timeline, prescriptions, diagnoses, vitals or report contents | **v1 (already built:** `getPatientForActor` removes `notableHistory` and returns `allergies: []`) |
| RESTRICTED: LAB_TECH | Demographics, the patient's lab orders and the notes attached to them only | **Fix** (§15 #9) |
| RESTRICTED: PHARMACIST | Demographics, active allergies, active prescriptions only | **Fix** (§15 #9) |
| RESTRICTED: NURSE | The docs define the scope but not the content. **Open decision**: until the clinic decides, render the chart (§6.30) with the "Limited view" badge, and record the decision | **Fix** (§15 #9) |

The projection is applied in the service query, **not** in the UI.

**Decision to record: `reasonForVisit` under OPERATIONAL.** Reception sees the patient-typed reason on the appointments board (seed example: "Chest discomfort while walking uphill"). That is arguably clinical content. v1 default: treat `reasonForVisit` as operational, because the patient wrote it at booking for the clinic and the front desk uses it. If the clinic decides otherwise, strip it from OPERATIONAL responses and drop the Reason column from `/ops/appointments`. Either way, record the decision in §15 E.

### 4.6 Capability gates per endpoint (Fix)
`PATCH /api/appointments/:id`:
- `cancel` and `reschedule`:
  - PATIENT with a FULL grant
  - RECEPTIONIST and ADMIN in the same clinic
  - DOCTOR only when `appointment.doctorId` is the actor's own Doctor row
  - NURSE, LAB_TECH and PHARMACIST → 403
- `check-in`: RECEPTIONIST and ADMIN only.

### 4.7 Patient scope & family access rules
- **User ≠ Patient.** `User` is a login. `Patient` is a clinical subject, with or without a login. They are joined **only** by `PatientAccessGrant`, and **there is no FK from Patient to User**. This makes "a whole class of cross-patient privacy bug … structurally impossible".
- **Grant fields:**
  - `relationship`: SELF, SPOUSE, CHILD, PARENT, SIBLING, GRANDPARENT, GUARDIAN, OTHER
  - `level`: FULL, VIEW_ONLY
  - `status`: ACTIVE, PENDING_CONFIRMATION, PENDING_REVIEW, REVOKED
  - `isGuardian`, `reviewDueAt`, `grantedById`, `grantedAt`, `confirmedAt`, `revokedAt`, `revokedReason`
  - `@@unique([userId, patientId])`
- **Adding a family member (v1, patient only):**
  - age < 18 → ACTIVE, `isGuardian=true`, `reviewDueAt` = 18th birthday, `confirmedAt=now`
  - adult → PENDING_CONFIRMATION
  - The Patient is created with `isDependent=true`. The MRN is allocated from the sequence in the same transaction. Audit `family.member.added`, severity HIGH.
- **Family list** = ACTIVE, non-revoked grants only, SELF first. "Grants only — never a phone-number match." Pending grants are not listed.
- **Active family member:**
  - Stored as `Session.activePatientId`: "UI convenience only — never trusted".
  - Resolved on every request: the stored id if it is in the user's ACTIVE grants, otherwise the SELF grant, otherwise the first grant.
  - Switching (`POST /api/family/active`) re-runs `assertCanAccessPatient(READ)` before saving.
- **The rule that must never break:** "no query for patient data may be constructed from a patient ID supplied by the client without first resolving it through a grant check… There is no 'current patient' stored in a cookie." Every patient-side query filters on `patientId: { in: allowedIds }` or on a resolved id.
- **Revocation** is never a delete: it sets `revokedAt`. Revocation itself is not in v1.

---

## 5. Information architecture

### 5.1 The three surfaces
The surfaces share a design *system* but not a *layout*.

| Surface | Users | Form factor | Root | Guard |
|---|---|---|---|---|
| Patient app | Patients and family | Mobile-first PWA, one-handed, "3-second comprehension, thumb-reachable" | `/app/*` | No session → `/login`. Non-PATIENT → own surface |
| Clinical console | Doctor, nurse, lab, pharmacy | Tablet/desktop, keyboard-first, "zero decorative chrome" | `/console/*` | No session → `/login`. Other roles → own surface |
| Operations console | Reception, admin | Desktop-first, tabular | `/ops/*` | No session → `/login`. Other roles → own surface |

- There is no `middleware.ts`. Guards run in layouts, and every page re-checks `getActor()`.
- Cross-surface behaviour is an **open decision**. The docs say "Cross-namespace access is a 403, not a redirect loop". The reference redirects to the role's own surface, which cannot loop. Pick one and test it.

### 5.2 Entry
- `/`: signed in → `surfaceForRole(role)`; otherwise → `/onboarding`. "There is no marketing page to sit between a patient and their records."
- `/onboarding`: a 4-slide skippable carousel. No auth check.
- `/login`: phone + OTP. A signed-in user is redirected to their surface.
- `/api/*`: JSON. `robots: noindex, nofollow` on every page.

### 5.3 Routes

| Route | Who | Purpose |
|---|---|---|
| `/` | anyone | Role redirect or → `/onboarding` |
| `/onboarding` | anyone | 4-slide intro → `/login` |
| `/login` | signed out | Mobile number + OTP |
| `/app` | PATIENT | Home |
| `/app/book` `?specialityId=&doctorId=&followUpId=` | PATIENT | Booking flow |
| `/app/appointments` | PATIENT | Upcoming and past |
| `/app/appointments/[id]` | PATIENT (grant on that appointment's patient) | Detail, cancel, reschedule |
| `/app/records` | PATIENT | Records hub + medical timeline |
| `/app/records/lab-reports` | PATIENT | Reports in progress / available |
| `/app/records/lab-reports/[id]` | PATIENT (active patient, VERIFIED only) | Report detail |
| `/app/records/prescriptions` | PATIENT | Prescriptions |
| `/app/records/imaging` | PATIENT | Honest placeholder |
| `/app/records/bills` | PATIENT | Bills & payments |
| `/app/messages` | PATIENT | Call card + clinic announcements |
| `/app/notifications` | PATIENT | In-app notifications |
| `/app/profile` | PATIENT | Active patient's profile, family, preferences, sign out |
| `/app/profile/family/add` | PATIENT | Add a family member |
| `/console` | DOCTOR, NURSE, LAB_TECH, PHARMACIST | Role-specific day view |
| `/console/patients` | DOCTOR, NURSE (**Fix:** deny LAB_TECH/PHARMACIST or confirm) | Patient search |
| `/console/patients/[id]` | console roles in scope | Patient chart (projection-aware) |
| `/console/schedule` | DOCTOR | My weekly schedule (read-only) |
| `/ops` | RECEPTIONIST, ADMIN | Today: stats + day board |
| `/ops/appointments` `?date=YYYY-MM-DD` | RECEPTIONIST, ADMIN | Appointments by day |
| `/ops/patients` | RECEPTIONIST, ADMIN | Patient search |
| `/ops/patients/[id]` | RECEPTIONIST, ADMIN | Front-desk (operational) view |
| `/ops/doctors` | ADMIN | Doctors & departments (read-only) |
| `/ops/audit` | ADMIN | Audit log (latest 100) |

**A role on the right surface but the wrong page:**
- RECEPTIONIST opening `/ops/doctors` or `/ops/audit` → redirect to `/ops`.
- NURSE, LAB_TECH or PHARMACIST opening `/console/schedule` → redirect to `/console`.
- An unknown role on `/console` → `/login`.

### 5.4 Navigation

| Surface / role | Items (label → href) |
|---|---|
| Patient bottom nav ("exactly 5, never more") | Home `/app` (exact match) · Appointments `/app/appointments` · Records `/app/records` · Messages `/app/messages` · Profile `/app/profile` |
| Doctor | Today `/console` (exact) · Patients `/console/patients` · My schedule `/console/schedule` |
| Nurse | Today's patients `/console` · Patients `/console/patients` |
| Lab | Lab orders `/console` |
| Pharmacy | Prescriptions `/console` |
| Reception | Overview `/ops` (exact) · Appointments · Patients |
| Admin | Overview · Appointments · Patients · Doctors · Audit log |

**Placement decisions:**
- Emergency is **not** in the patient nav. It is a persistent header button on every patient screen.
- Billing lives under Records. It is also reachable from Home's "Pending payment" card.
- On `/app/book` and `/app/notifications` no nav item is active.

---

## 6. Screen-by-screen spec

**Conventions for every screen:**
- Each screen lists layout (top → bottom), data, actions and the four states: **Loading** (a skeleton shaped like the content, never a centred spinner), **Empty** (never blank), **Error** (plain language + "Try again" + "Contact clinic" `tel:`), **Success** (explicit and specific).
- Every patient route gets its own `loading.tsx` and `error.tsx` (Fix: the reference had them only for `/app`, `/app/appointments` and `/app/records`).
- Every ErrorState receives `clinicPhone` (Fix).
- **Active-patient scoping:** Home, Appointments, the Records hub, Lab reports, Prescriptions, Bills and Profile show only the active patient (`resolveActivePatientId`). If no active patient resolves, redirect to `/app/profile`. The layout's unlinked screen (§6.4) normally catches this first. Appointment detail is the exception: it resolves by grant (§6.8).

### 6.1 PatientShell: wraps every `/app/*` page
Data comes from four parallel loads: `getClinic()`, `getFamilyForActor`, `resolveActivePatientId`, `unreadCount(userId)`.

1. **Skip link** "Skip to content" → `#main`. Offscreen until focused.
2. **Sticky header**: `z-30`, bottom border, `bg-bg/90 backdrop-blur` (must render, see §3.4), centred `max-w-patient` (30rem) column, `px-5 py-3`. From left to right:
   - **Patient chip button**, filling the left flex area:
     - sm avatar (32px), the active patient's full name (body-sm semibold, truncated), and the caption "{Relationship} · Switch"
     - Relationship labels: SELF → "You", SPOUSE "Spouse", CHILD "Child", PARENT "Parent", SIBLING "Sibling", GRANDPARENT "Grandparent", GUARDIAN "Guardian", OTHER → "Family"
     - `aria-label="Viewing {name}. Change patient."`. Opens the FamilySwitcher.
   - **Bell** link → `/app/notifications`:
     - `aria-label` "Notifications, {n} unread", or "Notifications" when n is 0
     - accent badge, tabular, "9+" above 9, **ink text** (§2.3)
     - Fix: the target must be ≥44px; the reference used 40px
   - **SOS** pill:
     - `bg-[--emergency]`, white Alert icon (16px) + "SOS", `aria-label="Emergency help"`, opens the EmergencySheet
     - Fix: ≥44px tall
     - It is never behind a menu, chatbot or triage step.
3. **"Viewing someone else's records" band**, shown whenever the active patient is not SELF:
   - full width under the header row, `border-t border-brand/15 bg-brand-wash px-5 py-2`
   - caption in brand-ink: "Viewing **{name}**'s records · {Relationship}"
   - **not dismissible**
4. **Main**: `<main id="main" class="mx-auto max-w-patient px-5 pb-28 pt-5">`.
5. **Bottom nav**:
   - `<nav aria-label="Main">`, fixed bottom, `safe-bottom` padding, `bg-surface/95 backdrop-blur`, top border
   - five equal items, each `h-14` (56px): 22px icon over an 11px semibold label
   - active item: `text-brand` + `aria-current="page"`; inactive: `text-ink-muted` (Fix: the reference's `ink-subtle` fails contrast)
   - matching is `startsWith`, except Home, which is exact

**FamilySwitcher sheet**
- Title "Who are you here for?".
- One full-width button per family member: md avatar, name and relationship label. The active member gets `border-brand bg-brand-wash` and a check icon.
- **Selecting another member:**
  - The selected row shows "…".
  - **Fix:** disable all buttons from the moment the POST starts until the refresh completes. The reference disables them only during the `router.refresh()` transition, not during the request, so a second tap can fire a second switch.
  - It POSTs `/api/family/active {patientId}`.
  - **Fix:** check the response. On failure, show an inline `role="alert"` and keep the current member.
  - On success, run `router.refresh()` inside `startTransition`, then close. The visible reload is intentional.
- Footer: dashed-border card link "Add a family member" with a chevron → `/app/profile/family/add`.

**EmergencySheet** (title "Emergency", `tone="emergency"`, which adds a 4px red top border)
- No AI, triage or form.
- Copy: "If this is a medical emergency, call for help now."
- Four 52px buttons, in order:
  1. Red filled: "Call emergency services ({emergencyPhone})" → `tel:{emergencyPhone}`.
  2. Outline: "Call {clinic.name}" → `tel:{supportPhone}`.
  3. "Directions to the clinic". Shown only if a location exists. It uses the primary `locations[0]`: `mapsUrl`, else `https://maps.google.com/?q={lat},{lng}`, in a new tab.
  4. "Share my location":
     - `navigator.geolocation` gives "My location: https://maps.google.com/?q={lat},{lng}".
     - That text goes to `navigator.share`, falling back to the clipboard.
     - Status messages appear in a `role="status"` line: "Location copied — send it to whoever is helping you." · "Location sharing is not available on this device." · "We could not get your location. Please allow location access."

### 6.2 Onboarding: `/onboarding`
**Data:** `clinic.name`. Themed via the root layout (Fix).

**Layout:**
- Top row: the clinic name (caption, muted) on the left. A "Skip" link → `/login` on the right, hidden on the last slide.
- Centre:
  - a 96px `rounded-2xl bg-brand-wash` tile holding a 44px icon, then the title (title size) and body
  - keyed by slide index, so the icon fades in and the text slides up on each change
- Dots:
  - `role="tablist" aria-label="Onboarding steps"`. Each dot is a `role="tab"` button with `aria-selected` and `aria-label="Step {i}: {title}"`.
  - The active dot is a w-6 brand pill; the others are 8px grey dots.
  - Fix: implement roving tabindex and arrow keys, and give each dot a ≥44px hit area.
- Bottom: "Continue" (lg, full width) advances one slide. On the last slide it becomes the LinkButton "Get started" → `/login`, with the caption "You will sign in with your mobile number."

**Slides:**

| # | Icon | Title | Body |
|---|---|---|---|
| 1 | Shield | "Welcome to {clinic.name}" (Fix: was hard-coded "Welcome to Clinic 360") | "Your appointments, prescriptions, reports and bills — all in one place, always with you." |
| 2 | Calendar | "Book in under a minute" | "See who is available today, pick a time that suits you, and skip the phone call." |
| 3 | Records | "Keep your records together" | "Every consultation, lab report and prescription, saved in order. Nothing to carry, nothing to lose." |
| 4 | Heart | "Stay on top of your care" | "We'll remind you about follow-ups, medicines and reports — for you and for your family." |

- Navigation is by buttons and dots only, with no swipe.
- No completion state is recorded, so every signed-out visit to `/` lands here. This is an open decision (§15).

### 6.3 Sign in: `/login`
A centred column:
1. A 48px `rounded-xl` logo tile showing `Clinic.logoUrl` (the Meriva mark). Fix: the reference showed the text "360".
2. h1 "Sign in".
3. "Enter the mobile number you gave at {clinic.name}."
4. **Phone step:**
   - Field label "Mobile number" with a required "*", hint "We will send a 6-digit code by SMS."
   - A read-only "+91" prefix box beside a `type=tel` input: `inputMode=numeric`, `autoComplete=tel-national`, autofocus, placeholder "98765 43210", tabular. The input keeps only digits and spaces, max 11 characters.
   - "Send code" (lg, full width). Disabled until there are ≥10 digits. Shows a spinner while pending.
   - Errors render inline under the field with a "⚠" glyph:
     - the server message
     - fallback "We could not send the code. Please try again."
     - network failure "We could not reach the clinic. Check your connection and try again."
5. **Code step:**
   - "Enter the code we sent to **{maskedPhone}**" and a link-button "Use a different number". Tapping it returns to the phone step and clears the error.
   - **OtpInput:**
     - One real `<input id="otp">`: `inputMode=numeric`, `autoComplete="one-time-code"`, maxLength 6, autofocus, non-digits stripped.
     - It is invisible (`opacity-0`) and stretched over six painted, `aria-hidden` 56px boxes (`h-14 rounded-md border text-title tabular`). This keeps SMS autofill and paste working.
     - sr-only label "6-digit verification code".
     - The current box gets `border-brand ring-brand/20`. Every box gets a critical border when the code is invalid.
     - It **auto-submits on the 6th digit**.
   - Errors use `role="alert"` with ⚠ and **clear the field**. When the verify response has no message, the fallback is "That code did not work. Please try again."
   - **Dev OTP box**, shown only when the response carries `devCode`: a dashed caution box reading "Development mode — no SMS gateway is configured. Your code is **{devCode}**".
   - "Verify and continue" (lg). Disabled until there are 6 digits.
   - Resend: a countdown "Resend available in {m}:{ss}" from 5:00, then the link "Send a new code".
   - On success: `window.location.href = redirectTo`. A full navigation is used so the new cookie is seen.
6. Footer: "New to {clinic.name}? **Call the clinic to register**" → `tel:{supportPhone}`.

### 6.4 Unlinked account (inside `/app` layout)
Shown when there is no active patient or the family list is empty. Rendered inside the themed root.
- A centred main with h1 "Your profile isn't linked yet".
- Body: "Please contact {clinic.name} so we can link your medical record to this account."
- Button "Call the clinic" → `tel:{supportPhone}`.

### 6.5 Home: `/app` (dynamic)
**Data:** one `getPatientHome` call plus `getClinic`. `getPatientHome` runs a scope check, then 8 parallel queries. In the reference, one of those 8 (`getNextAppointment`) repeats the scope check, so each Home load does two grant lookups. Pass the resolved access in, or make `getNextAppointment` an internal helper that skips the check.

The section order is fixed:

1. **Greeting.** Body-muted "{Good morning|Good afternoon|Good evening}," (clinic-timezone hour), then the first name only, in `text-display` (32px).
2. **"Next appointment"** (overline SectionHeader):
   - **Which appointment:** the earliest one not CANCELLED, COMPLETED or NO_SHOW with `startAt ≥ now − 30 min`, so it stays "next" for 30 minutes after it starts.
   - **Card:**
     - doctor avatar, "Dr. {name}" (subheading), speciality
     - a calendar icon with `relativeDayLabel`, then a clock icon with the time ("10:20 am")
     - a pin icon with the location name
     - a positive "Checked in" badge only when the status is CHECKED_IN
   - **Footer**, split in two 48px halves:
     - "View appointment" → `/app/appointments/{id}`
     - "Get directions" → `location.mapsUrl`, else `maps.google.com/?q={address or clinic name}`, in a new tab
   - **Empty:** calendar icon, "Nothing scheduled yet", "Book your next consultation and it will appear here.", action "Book an appointment" → `/app/book`.
3. **"Your health today"** (hidden when empty). Each item is a CardLink row: a tinted 40px circle icon, label, truncated detail and chevron. Items appear in this order, each only if its condition holds:

   | # | Label | Condition | Detail | Link | Tone / icon |
   |---|---|---|---|---|---|
   | 1 | "Medicines" | ACTIVE prescriptions > 0 | "{n} active prescription(s)" | `/app/records/prescriptions` | brand / pill |
   | 2 | "New lab report" | newest VERIFIED lab order with `patientNotifiedAt` null | test names joined, or the order number | `/app/records/lab-reports/{id}` | positive / flask |
   | 3 | "Follow-up due" | PENDING follow-up with `dueFrom ≤ now + 14 days`, earliest first | "Dr. {name} — {reason}" | `/app/book?followUpId={id}&doctorId={id}` | caution / stethoscope |
   | 4 | "Pending payment" | sum of `amountDue` on ISSUED/PARTIALLY_PAID invoices > 0 | "₹{amount} outstanding" (via `formatMoney`) | `/app/records/bills` | critical / card |

4. **"Quick actions"**: a 2×2 grid of 84px tiles:
   - "Book appointment" (primary, brand-filled) → `/app/book`
   - "View records" → `/app/records`
   - "Lab reports" → `/app/records/lab-reports`
   - "Prescriptions" → `/app/records/prescriptions`
5. **"Your care journey"** (hidden when empty):
   - Up to 3 ACTIVE journeys. Each card shows the journey name and its ordered steps.
   - Each step state has a shape plus a label:

     | State | Marker | Label |
     |---|---|---|
     | COMPLETED | filled brand circle with a check | "Done" |
     | IN_PROGRESS | ring on brand-wash with a brand dot; step name semibold | "In progress" |
     | PENDING | hollow circle, muted text | "Upcoming" |
     | SKIPPED | sunken circle | none |

6. **"Clinic updates"** (hidden when empty): up to 3 published, unexpired announcements, pinned first, then newest. Each shows title and body, with no date.
7. **Footer identity line**, caption, centred: "{fullName} · MRN {mrn}".

**States:**
- Loading skeleton: greeting, appointment card, two 72px rows, four 84px tiles.
- Error (`/app/error.tsx`): "We couldn't load this right now" / "This is a problem on our side, not yours. Please try again in a moment." + "Try again" + "Contact clinic".
- **Fix:** each section's `aria-labelledby` must reference a real heading id. Give SectionHeader an `id` (§10.6) and make sure `next-appt` also resolves in the empty state.

### 6.6 Book: `/app/book`
**Server loader (through a service):**
- clinic, active specialities (by `displayOrder`, then name), active doctors with `nextAvailableAt` within 14 days, and the family
- Each family entry carries `canBook = level === 'FULL'`.
- A `followUpId` must be PENDING and belong to a family patient. It pre-selects the doctor, speciality, patient and reason.
- **Query-parameter edge cases (Fix):**
  - When only `doctorId` is given, derive `specialityId` from the doctor. In the reference the speciality stays null, so Back from Time shows "No doctors available".
  - When `doctorId` or `specialityId` does not match an active record, ignore it and start at the speciality step. In the reference an unknown or inactive `doctorId` leaves the flow on the slot step with nothing rendered.
  - A `followUpId` that is not PENDING, or not in the family, is ignored: no banner and no prefill. Booking proceeds as a normal booking.

**Steps:** `speciality → doctor → slot → confirm → done`. The initial step is `slot` if a doctor is preselected, `doctor` if only a speciality is, otherwise `speciality`.

**Chrome:**
- A back chevron (`aria-label="Back"`, ≥44px hit area) on every step except the first. Back always goes to the previous step.
- h1 "Book an appointment".
- **StepIndicator:** four labelled bars "Speciality", "Doctor", "Time", "Confirm". Bars up to the current step are brand-coloured. The `<ol>` has `aria-label="Step {N} of 4"`.
- For a follow-up booking, a brand-wash banner: "**Follow-up booking.** We've kept your doctor and the reason from your last visit."

**Step 1, "What do you need help with?"**
- One full-width button per speciality: a 44px brand-wash circle containing `DynamicIcon(iconKey)`, the name, and the optional `patientBlurb`.

**Step 2, "Choose a doctor"**
- Subtitle: the speciality name.
- Each doctor is a card button showing:
  - avatar, "Dr. {name}", qualifications (caption)
  - "{n} yrs experience · {languages}" (en/ml/ta/hi/kn/te → English/Malayalam/Tamil/Hindi/Kannada/Telugu)
  - a neutral fee badge ("₹800")
  - a positive clock badge with the next availability: "Today, {time}" / "Tomorrow, {time}" / "Tue, 26 Aug, {time}". Without one, a caution badge "No slots in the next 2 weeks".
- **Empty:** "No doctors available" / "We don't have a {speciality} doctor taking appointments right now. Please call the clinic." with the action "Choose another speciality". **Fix:** make the action a button that sets the step back to `speciality` and clears `specialityId`. Do not make it a link to `/app/book`: the URL is still `/app/book`, so the reference's link keeps the client state on the doctor step and does nothing.

**Step 3, "Pick a time"**
- Subtitle: "Dr. {name} · {speciality}".
- Fetches `GET /api/doctors/{id}/availability?days=14`.
- **Date rail:** a horizontal no-scrollbar row of 14 chips, 64×68px each:
  - weekday, day number (heading size), and "{n} free" or "Full" (Fix: ≥11px)
  - the active chip is brand-filled; full days are dimmed to 45%; chips use `aria-pressed`
  - the first day with availability is auto-selected
- **Slot grid:** 3 columns of 44px buttons, available slots only, labelled "10:20 am". Tapping a slot goes straight to Confirm.
- **Loading:** 5 chip skeletons and 9 slot skeletons.
- **Error:** "We couldn't load available times" / "Please try again in a moment." + Try again.
- **Empty day:** clock icon, "No slots available on this day", "Try another date above, or choose a different doctor."
- **Fix:** after a SLOT_TAKEN response, render "That time was just booked by someone else. Please pick another slot." as a `role="alert"` banner above the slot grid. The reference sets the error but renders it only on the Confirm step, so the patient is dropped back here with no explanation.

**Step 4, "Review and confirm"**
- Summary card rows: Patient · Doctor · Speciality · When ("Tue, 26 Aug, 10:20 am") · Consultation fee. **Fix:** show `followUpFee ?? consultationFee` for a follow-up, matching the detail page.
- If the family has more than one member: "Who is this appointment for?" over member buttons. VIEW_ONLY members are disabled and suffixed "· view only". The selected member gets a check.
- Textarea "What would you like to discuss?":
  - hint "Optional. It helps the doctor prepare for your visit."
  - placeholder "e.g. Chest discomfort when climbing stairs"
  - max 500
- The speciality's `preparationNotes`, if set, in a caution box.
- Submit error (any code other than SLOT_TAKEN): ErrorState "We couldn't confirm that" + the server message + "Contact clinic". When the response has no message, the fallback is "We could not confirm that booking. Please try again."
- "Confirm appointment" (lg).
- Caption: "You can reschedule or cancel any time before your visit. Payment is collected at {clinic.name}."
- **Submit:** `POST /api/appointments {patientId, doctorId, startAt, consultationType:'IN_PERSON', reasonForVisit, followUpId}`.
  - On `SLOT_TAKEN`, clear the slot and return to step 3, where the Fix banner above shows "That time was just booked by someone else. Please pick another slot."
  - On network failure: "We could not reach the clinic. Check your connection and try again."

**Done screen**
- 64px positive circle with a check.
- h1 "Appointment confirmed".
- "{patientName} with Dr. {doctorName}", then the bold date and time.
- Optional caution card "**Before your visit:** {preparationNotes}".
- Buttons "View appointment" (52px brand) → `/app/appointments/{id}` and "Back to home" → `/app`.

### 6.7 Appointments: `/app/appointments`
- Scoped to the active patient (§6 conventions).
- Header: h1 "Appointments" with a small "+ Book" LinkButton → `/app/book`.
- **"Upcoming":** `startAt ≥ now` and not CANCELLED, COMPLETED or NO_SHOW, oldest first.
- **"Past":** started in the past or CANCELLED/COMPLETED/NO_SHOW, newest first, at most 20.
- **Row** (CardLink → detail): avatar, "Dr. {name}", speciality, date and time (relative day for upcoming, "26 Aug 2026" for past, then " · {time}"), StatusBadge, chevron.
- **Empty:**
  - Upcoming: "Nothing scheduled yet" / "Book your next consultation and it will appear here." + "Book an appointment".
  - Past: "No past visits yet" / "Your visit history will appear here."
- **Loading:** list skeleton. **Error:** "We couldn't load your appointments." / "This is a problem on our side. Please try again."

### 6.8 Appointment detail: `/app/appointments/[id]`
**Load:** by appointment id plus a grant check on its patient, not by the active patient. Not found or forbidden → `notFound()`. **Fix:** load the grant level along with the appointment, so the page knows whether the holder has FULL or VIEW_ONLY access.

**Layout, top to bottom:**
1. Back link "Appointments".
2. StatusBadge.
3. h1 long date (en-IN weekday, day, month, year).
4. Time in a brand-ink heading.
5. **Doctor card:** lg avatar, "Dr. {name}", speciality, qualifications.
6. **Patient card** rows:
   - Patient
   - "Age / sex": "{34 yrs | 8 mo} · {Male | Female | Other | Not stated}"
   - "Patient ID" (MRN)
   - "Consultation fee": `followUpFee` for a follow-up, otherwise `consultationFee`
   - Reason, if present
7. **"Where" card:** location name, "{addressLine1}, {city}", buttons "Directions" (maps) and "Call" (`tel:` location phone).
8. "**Before your visit:** …" caution card, only when upcoming.
9. When cancelled: a critical-wash card. With a reason: "This appointment was cancelled — {reason}." Without a reason: "This appointment was cancelled." A rescheduled original carries the reason "Rescheduled".
10. Actions when upcoming (future start and not cancelled, completed or no-show). Otherwise a "Contact the clinic" `tel:` button.

**Actions:** "Reschedule" (secondary, lg) and "Cancel appointment" (ghost).
- **Fix: VIEW_ONLY holders.** For a VIEW_ONLY grant, hide Reschedule and Cancel. Show the "Contact the clinic" `tel:` button with the caption "You have view-only access to this family member." The reference shows both actions, and the server then returns 403.

**Cancel sheet**
- Title "Cancel this appointment?"
- "Your slot with Dr. {doctorName} for {patientName} will be released for another patient. You can book again at any time." (Fix: the reference omits the patient's name; see §10.11.)
- Textarea "Reason (optional)": hint "This helps the clinic plan.", placeholder "e.g. I'm travelling that week", max 300.
- Buttons "Yes, cancel it" (danger, lg) and "Keep my appointment" (ghost).
- Sends `PATCH {action:'cancel', reason}`, then refreshes.
- Server errors (full list in §7.3): "This appointment is already cancelled." · "This appointment has already taken place." · "This appointment can no longer be changed."
- **Error rendering:** PATCH errors render inside the open sheet as a `role="alert"` critical caption "⚠ {message}", under the reason field. When the server sends no message, the fallback is "We could not complete that. Please try again." On network failure: "We could not reach the clinic. Check your connection and try again."

**Reschedule sheet**
- Title "Pick a new time".
- The same 14-day chip rail (no "free" counts) and slot grid as booking.
- **A single tap on a slot commits the reschedule** with `PATCH {action:'reschedule', startAt}`, then `router.replace('/app/appointments/{newId}')`. This is v1 behaviour; adding a confirm step is an open decision.
- While the PATCH is pending, slot buttons are disabled.
- **Loading:** 4 chip skeletons (64×68px) over 6 slot skeletons (`h-11`) in a 3-column grid.
- Empty day: "No slots on this day" / "Try another date above."
- Load error: "We couldn't load available times" + Try again + Contact clinic.
- Server errors: "This appointment can no longer be changed." · "That time has already passed. Please choose another slot." · SLOT_TAKEN copy.
- **Error rendering:** as for the Cancel sheet, a `role="alert"` caption "⚠ {message}", here under the slot grid, with the same fallback and network copy.

### 6.9 Records hub: `/app/records`
- Scoped to the active patient.
- h1 "Records". Sub-line "{fullName} · MRN {mrn}".
- **"Browse"**: four rows. Each has a brand-wash icon circle, a label, a count line ("None yet" or "{n} available") and a chevron:
  - "Lab reports": count of VERIFIED orders
  - "Prescriptions": count of ACTIVE
  - "Imaging & scans": count of REPORTED studies
  - "Bills & payments": count of all invoices, plus a critical badge "{₹X} due" when money is outstanding
- **"Medical timeline"**:
  - The latest 25 `MedicalRecord` rows, newest first, on a vertical `border-l` spine.
  - Each item has a 20px brand-ringed node. Icons appear only for CONSULTATION (stethoscope), LAB_REPORT (flask), PRESCRIPTION (pill) and IMAGING (scan); other kinds get an empty node.
  - Each card shows date, title, optional summary and optional author. Cards are not tappable.
- **Empty timeline:** "Nothing here yet" / "Your consultations, reports and prescriptions will appear here after your first visit." + "Book an appointment".
- **Error:** "We couldn't load your records." / "This is a problem on our side. Please try again."

### 6.10 Lab reports: `/app/records/lab-reports`
- Scoped to the active patient. CANCELLED orders are never listed. The list is capped at 50, ordered by `orderedAt` descending.
- Back link "Records", h1 "Lab reports".
- **Fix:** a "{fullName} · MRN {mrn}" line under the h1 (§10.11).
- **"In progress"** (shown first): non-verified orders as non-tappable cards with a caution clock circle, test names, "Ordered {date}", and a caution badge:

  | Status | Badge |
  |---|---|
  | ORDERED | "Ordered" |
  | SAMPLE_PENDING | "Awaiting sample" |
  | SAMPLE_COLLECTED | "Sample collected" |
  | IN_PROGRESS | "Being processed" |
  | RESULTS_UPLOADED | "Being checked" |

- **"Available"**: VERIFIED orders as CardLinks with a positive flask circle, test names, "{verifiedAt date} · {order number}", and a positive check badge "Report available". When any result flag is not NORMAL, add a caution alert badge "Some values outside range".
- **Empty:** "No reports yet" / "Your reports will appear here as soon as they're ready."

### 6.11 Lab report detail: `/app/records/lab-reports/[id]`
Scoped to the **active** patient.
- An unknown id, or another patient's order → NOT_FOUND "We could not find that report."
- A non-VERIFIED report → NOT_FOUND "That report is not ready yet."
- Both render the not-found screen. Flagging rules are in §7.4.

1. Back link "Lab reports".
2. h1: test names joined.
3. "{date} · {number}".
4. "Ordered by Dr. {name} · Verified by {verifiedByName}".
5. **Fix:** a line identifying the patient, "{fullName} · MRN {mrn}", because the design rules require the name inside clinical content.
6. **Safety banner** (caution card with alert icon) when any flag is not NORMAL: "Some results are outside the displayed reference range. Please discuss them with your healthcare professional. This is not a diagnosis."
7. **Results table:**
   - sr-only caption "Test results with reference ranges". Columns "Test", "Result", "Range", with `scope=col`.
   - **Test cell:** analyte name; then a trend icon with "Previous {value} on {date}"; then an optional comment.
   - **Result cell:** value (numeric or text, "—" if missing) plus unit. When not NORMAL, the value is in the caution colour with the flag word under it.
   - **Range cell:** `refText`, or "{low} – {high}", or "—".
8. CTAs: "Book a consultation about this" (lg) → `/app/book`, and "Ask the clinic a question" → `tel:`.
9. Footer: "Reference ranges vary between laboratories. Always read a result alongside your clinical history."

### 6.12 Prescriptions: `/app/records/prescriptions`
All prescriptions for the active patient, newest first, at most 30.

**Fix:** a "{fullName} · MRN {mrn}" line under the h1 (§10.11). The reference shows no patient name.

**Card header:**
- "Dr. {name}", speciality, "{date} · {number}"
- status badge: "Active" (brand), "Completed" or "Ended" (neutral)
- optional "**For:** {diagnosisSummary}"

**Each item:**
- medicine name with strength in muted text
- an "Only when needed" badge for SOS items
- **Non-SOS items get a dose strip** (the Indian 1-0-1 convention):
  - four cells labelled "Morning / Afternoon / Evening / Night" in small uppercase (Fix: ≥11px)
  - cells with a dose are brand-wash with a brand-ink number (fractions to one decimal); zero cells are greyed
- "Duration: {n} days"
- "Instructions: {Before food | After food | With food | Any time}{ · instructions}"

**Card footer:** optional general instructions, with an alert icon.

**Page footer:** "Never change or stop a medicine without speaking to your doctor."

**Empty:** "No active prescriptions" / "Prescriptions from your consultations will appear here."

### 6.13 Imaging: `/app/records/imaging` (ComingNext placeholder)
- Back link "Records", title "Imaging & scans", overline "Arriving in the next release".
- Body: "Your X-rays, ultrasounds and scan reports will appear here once the clinic's imaging system is connected. Until then, please collect scan films from the imaging desk."
- Button "View your records" → `/app/records`.

### 6.14 Bills & payments: `/app/records/bills`
- Scoped to the active patient. At most 50 invoices, newest first.
- Back link "Records", h1 "Bills & payments".
- **Outstanding card**, with an accent-wash background when the amount is above zero:
  - Overline "Outstanding", amount in display size.
  - When > 0:
    - "Across {n} bill(s)"
    - the note "Online payment is not switched on for this clinic yet. You can settle at the reception desk, or call us to pay over the phone."
    - a brand button "Call {clinic.name}"
  - Otherwise: positive "✓ Everything is settled".
- Sections "Unpaid" (`amountDue > 0`) and "Paid" (`amountDue === 0`).
- **InvoiceCard:**
  - category: Consultation / Laboratory / Pharmacy / Imaging / Procedure / Other
  - "{date} · {invoice number}"
  - total, with a positive "Paid" badge or a caution "{₹X} due" badge
  - line items (description and line total)
  - "Receipt {receiptNumber} · {date}", taken from the first payment
- **Empty:** "No bills yet" / "Bills from your visits will appear here."
- No Pay button.

### 6.15 Messages: `/app/messages`
- h1 "Messages".
- **"Talk to the clinic"** card: "Secure messaging with the clinic is coming soon. For now, the fastest way to reach us is by phone — we're happy to help with appointments, reports and bills." + a brand button "Call {clinic.name}" with a phone icon.
- **"Clinic announcements"**: up to 20, pinned first. Each shows title, body and date.
- **Empty:** "Nothing new right now" / "Clinic announcements will appear here."
- This page does not depend on the active patient.

### 6.16 Notifications: `/app/notifications`
- Back link "Home", h1 "Notifications".
- Up to 40 IN_APP notifications with status SENT or DELIVERED, newest first.
- **Card:**
  - title, body, timestamp "{d MMM, h:mm am}"
  - unread: `border-brand/30 bg-brand-wash/40` plus an 8px brand dot, paired with an sr-only "Unread" text (Fix: not `aria-label` on a span)
  - the whole card is a link when `actionUrl` is set
- **Empty:** "Nothing to catch up on" / "Reminders about appointments, reports and follow-ups will appear here."
- **Fix:** rendering this page marks the listed rows read via `markNotificationRead`, so the bell count goes down.

### 6.17 Profile: `/app/profile` (shows the **active** patient)
1. h1 "Profile".
2. **Identity card:**
   - lg avatar, name, "{age} · MRN {mrn}"
   - rows:
     - "Date of birth"
     - "Blood group" (A+…O−, else "Not recorded")
     - "Mobile": formatted with `formatPhone` ("+91 94000 00001"), or "Not recorded". **Fix:** the reference renders raw E.164.
     - "Address" ("{line1}, {city} {pincode}")
     - "Emergency contact" ("{name} ({phone})")
     - any missing value shows "Not recorded"
   - Note: "To correct any of these details, please speak to the clinic at reception."
3. **"Allergies"**:
   - Each allergy is a critical-wash card with an alert icon, the substance, the reaction and a severity word ("Severe", "Moderate" or "Mild").
   - Empty: "No allergies recorded. If you have any, please tell the clinic so we can add them."
4. **"My family"**:
   - One card per ACTIVE grant: avatar, name, "{Relationship} · {age} · {MRN}", plus a "View only" badge for VIEW_ONLY.
   - Dashed link "+ Add a family member".
5. **"Insurance"**:
   - Each policy shows insurer, policy number and "Valid until {date}".
   - Empty: "No insurance policy on file. Bring your policy card to reception and we'll add it."
6. **"Preferences"**:
   - Row "Language" showing `LOCALE_LABELS[user.locale]` (display only).
   - Shield note: "Malayalam, Tamil, Hindi, Kannada and Telugu are coming soon. The app is already built to support them."
7. **Section titled {clinic.name}:** row "Call the clinic" with the support phone, and row "Emergency" with the emergency phone in bold.
8. **"Sign out"** (secondary, lg, logout icon): POST `/api/auth/logout`, then a full navigation to `/login`.
9. Footer "Signed in as {phone}". **Fix:** format with `formatPhone` ("+91 94000 00001"), not raw E.164.

### 6.18 Add a family member: `/app/profile/family/add`
- Back link "Profile", h1 "Add a family member", sub-line "They get their own records, appointments and reports — kept separate from yours."
- **Fields:**
  - "Full name*": placeholder "As it should appear on their records"
  - "Date of birth*": native date input, max today
  - "Sex*": Female (default) / Male / Other / "Prefer not to say"
  - "Relationship to you*": Child (default) / Spouse / Parent / Sibling / Grandparent / Other. GUARDIAN is not offered (see §9.2).
  - "Their mobile number": the hint is "Required so they can confirm — an adult must approve access to their own records." when the person is an adult (18 or over by the client calculation), otherwise "Optional."
- When the date of birth makes the person an adult, show a brand-wash shield card: "They're an adult, so we'll ask them to confirm on their own number before their records become visible to you."
- **Submit** "Add family member" (lg). Disabled until the name has ≥2 characters and a date of birth is set. POSTs `/api/family`.
- **Errors:**
  - Zod field errors render inline: "Please enter their full name." · "Please enter a valid date of birth."
  - Two service-level checks, "Date of birth cannot be in the future." and "Please check the date of birth.", carry no field details in the reference. They therefore render in the ErrorState "We couldn't add them", not inline. **Fix:** return them as VALIDATION_ERROR with `details: { dateOfBirth: message }` so they render inline under the date field.
  - Errors without `details` render as ErrorState "We couldn't add them" with the message. When there is no message, the fallback is "We could not add this family member."
  - Network failure: "We could not reach the clinic. Check your connection and try again."
- **Success:**
  - SuccessNote (`role=status`): "{name} has been added" / "Their patient ID is {mrn}."
  - For an adult, an extra caution card: "Because {name} is an adult, they need to confirm on their own mobile number before you can see their records. We've asked them to confirm." See §15 B: this copy is not backed by any confirmation flow.
  - Button "Back to profile".

### 6.19 Patient-wide fallbacks
- **`/app` not-found:** search icon, "We couldn't find that", "The page you were looking for may have moved, or you may not have access to it.", "Go to home".
- **Fix:** add root `error.tsx` and `not-found.tsx` covering `/`, `/login` and `/onboarding`, using the same tone.

### 6.20 StaffShell (`/console`, `/ops`)
Rationale, not UI copy: deliberately not the patient shell at a wider breakpoint. It is dense and keyboard-reachable, with a persistent side rail, and 14px body text is allowed.
- Root `min-h-dvh bg-bg` with the "Skip to content" link.
- **lg and up:**
  - Left `aside`, `w-60` (240px), right border, `bg-surface`.
  - Top block: clinic name (`text-body font-bold`) and product label (caption, muted).
  - `nav aria-label="Main"` with text-only links: `h-9 rounded-md text-body-sm font-medium`. Active: `bg-brand-wash text-brand-ink` + `aria-current="page"`. Inactive: `text-ink-muted hover:bg-surface-sunken`. Matching is `exact ? pathname===href : startsWith`.
  - Rail footer: sm avatar, full name, role label, and a "Sign out" button that POSTs logout, then sets `window.location.href='/login'`. Its label reads "Signing out…" while pending.
- **Below lg:**
  - A non-sticky header with clinic name, product label and avatar, plus a horizontally scrolling no-scrollbar nav row.
  - **Fix:** include Sign out here too; the reference had none below lg.
- **Main:** `<main id="main" class="flex-1 p-5 lg:p-8">`, centred `max-w-6xl`.
- No emergency button, no notifications, no nav icons.
- Brand variables come from the root (Fix).
- **Fix:** add `loading.tsx`, `error.tsx` and `not-found.tsx` under `/ops` and `/console`.

### 6.21 Ops overview "Today": `/ops` (dynamic)
**Data:** `getOpsOverview(actor)`, which throws FORBIDDEN unless the role is RECEPTIONIST or ADMIN.

1. h1 "Today" plus the long date (clinic timezone).
2. **Stat cards** in a grid of 2 / sm:3 / lg:4 columns. Each is an overline label over a title-size tabular value.

   | Who sees it | Stats |
   |---|---|
   | Both roles | "Appointments today" (counts every row on the day list, including cancelled and no-show) · "Checked in" (brand-wash when > 0) · "Completed" · "Cancelled / missed" (CANCELLED + NO_SHOW) |
   | **ADMIN only** (rationale, not UI copy: revenue and outstanding balances are administrator-only) | "Collected today" (SUCCEEDED payments; **Fix:** clinic-local day bounds, not UTC) · "Outstanding" (amountDue on ISSUED/PARTIALLY_PAID, sub-text "{n} invoice(s)") · "Registered patients" · "Active doctors" |
   | **RECEPTIONIST only** | "Lab orders pending" (orders not VERIFIED/CANCELLED) |

   **Fix:** the service computes revenue only for ADMIN.
3. **"Day board"** (overline) with an "All appointments" link → `/ops/appointments`.
   - Table (`min-w-[720px]`, horizontal scroll) with columns Time · Patient · Doctor · Status · Action:
     - Patient cell: avatar, name linked to `/ops/patients/{id}`, "{age} · {MRN}"
     - Doctor cell: "Dr. {name}" over the speciality
     - Status: StatusBadge
     - Action: CheckInButton for CONFIRMED or SCHEDULED only
   - Rows come from `listDayAppointments`: clinic-scoped, queried over a ±1 day window, filtered by clinic-local date key, sorted by start time.
   - **Decision (recorded in §15 E):** day lists include CANCELLED and NO_SHOW rows, each shown with its StatusBadge.
   - Empty: calendar icon, "Nothing booked today" / "Appointments booked for today will appear here."

**CheckInButton**
- Button sm "Check in" with an sr-only "Check in {patientName}" *inside* the button (Fix: the reference put it beside the button).
- **No optimistic UI.** Rationale, not UI copy: the receptionist is standing in front of the patient, so a check-in that silently failed would mislead them.
- Shown only when the viewed date is today in the clinic timezone. On `/ops` that is always the case.
- Sends `PATCH /api/appointments/{id} {action:'check-in'}`, then `router.refresh()`.
- Errors appear as `role="alert"` critical caption text: the server message, or "Check-in failed.", or on network failure "Could not reach the server."

### 6.22 Ops appointments: `/ops/appointments?date=YYYY-MM-DD`
- The date is regex-validated; otherwise today in the clinic timezone.
- h1 "Appointments" plus the long date.
- Prev arrow (`aria-label="Previous day"`), a "Today" pill → `/ops/appointments`, and a next arrow (`aria-label="Next day"`). Days step ±1 from a noon-UTC anchor.
- Table (`min-w-[760px]`) with columns Time · Patient (link + "age · MRN") · Doctor ("Dr. X") · Reason (`reasonForVisit`, line-clamp-2, or "—"; subject to the §4.5 decision) · Status · Action (CheckInButton).
- **Fix:** show CheckInButton only when the viewed date is today. The reference shows it on every CONFIRMED/SCHEDULED row for any date, and the server has no date check (§7.3).
- Day lists include CANCELLED and NO_SHOW rows with their StatusBadge (§6.21).
- Empty: "Nothing booked on this day" / "Use the arrows above to look at another day."
- No filters, booking, cancel, reschedule, no-show marking or walk-ins.

### 6.23 Ops patient search: `/ops/patients`
- h1 "Patients".
- Field "Find a patient", hint "Search by name, patient ID or mobile number.", placeholder "e.g. Arun Menon, {mrnPrefix}01001, 9400000001", autofocus.
- 300ms debounce. It searches only when the trimmed query has ≥2 characters, which avoids "a search — and an audit row — on every keystroke".
- Results: avatar, name (semibold), "MRN · phone" → `/ops/patients/{id}`.
- **States:**
  - Loading: one `h-16` skeleton
  - Error: "Search failed" / "Please try again."
  - Empty: "No patients found" / "Check the spelling or try the patient ID."

### 6.24 Ops patient (front-desk view): `/ops/patients/[id]`
Rationale, not UI copy: OPERATIONAL projection only, meaning demographics, appointments and money, with no clinical content.
- **Load:** `getPatientForActor`, which audits `patient.record.viewed` with `{projection, basis}`. FORBIDDEN or NOT_FOUND → `notFound()`.

1. Back link "Patients".
2. **Header:** lg avatar, h1 name, "{age} · {MRN} · {phone}", "Registered {date}", and a neutral shield badge "Front-desk view" (the same for admin).
3. **Brand-wash notice:** "This view shows appointments and billing only. Clinical records — consultations, reports and prescriptions — are available to the treating clinician."
4. **Three cards:**
   - "Contact": phone or "No mobile on file"; address or "No address on file"
   - "Emergency contact": name or "Not recorded", plus phone
   - "Outstanding": accent-tinted when > 0
5. **"Appointments"**: the last 20 by start time, descending, as rows "datetime · Dr. X speciality · StatusBadge". Empty: "No appointments" / "This patient has not booked yet."
6. **"Billing"**: the last 20 invoices as rows "date · number + category (lowercase) · total · badge". The badge is caution "{amount} due" or positive "Paid". Empty: "No invoices" / "Bills raised for this patient will appear here."

### 6.25 Doctors & departments (ADMIN): `/ops/doctors`
- h1 "Doctors & departments", sub-line "{n} doctors across {m} specialities".
- **"Specialities"** grid: name, department name, "{n} doctor(s)".
- **"Doctors"** table (`min-w-[820px]`) with columns:
  - Doctor: avatar or photo, "Dr. Name", qualifications
  - Speciality
  - "Languages"
  - "Fee" (right-aligned)
  - "Next free": the first free slot within 14 days, or a caution badge "No slots"
- Footer card (an inline Card with the overline "Arriving in the next release", not the ComingNext pattern): "Adding and editing doctors, departments, services, pricing and clinic branding ships with the operations release. Every one of these is already stored as configuration rather than code, so nothing here is hardcoded to this clinic."

### 6.26 Audit log (ADMIN): `/ops/audit`
- h1 "Audit log", sub-line "Every sensitive action, recorded append-only. The 100 most recent entries."
- Four count cards, in order critical, high, normal, low. Labels are the lowercased enum names. The counts are clinic-wide, all-time totals per severity (`groupBy severity`), not counts of the 100 rows shown.
- **Table** (`min-w-[860px]`):
  - "When": `formatDateTime`
  - "Who": actorName or "System", plus the lowercase role
  - "Action": the raw key in mono, plus `reason` if present
  - "Patient": name + MRN, or "—"
  - "Severity": LOW and NORMAL → neutral, HIGH → caution, CRITICAL → critical
- **The metadata blob is never rendered.**
- Empty: shield icon, "No entries yet" / "Audited actions will appear here."
- Footer: "Audit rows are append-only by design — no application code path updates or deletes them. Enforcing that at the database level (revoking UPDATE and DELETE from the application role) is a deployment step, documented in the security notes. Until it is applied, append-only is a convention rather than a guarantee."

### 6.27 Console home: `/console` (switches on role, dynamic)

**Doctor: "Today"** (`getDoctorDay`; a missing Doctor row throws "This account is not linked to a doctor profile.")
- h1 "{greeting}, Dr. {name}". Sub-line "{long date} · {speciality}".
- **5 stats** (lg: 5 columns):
  - "Today": every row on the doctor's day list, including cancelled and no-show (§15 E)
  - "Waiting": CHECKED_IN count; caution tint when > 0
  - "Completed"
  - "Reports pending": the doctor's orders in SAMPLE_COLLECTED, IN_PROGRESS or RESULTS_UPLOADED
  - "Follow-ups due": PENDING with `dueFrom ≤ now ≤ dueTo`
- **"Today's appointments"**: each whole row links to `/console/patients/{id}` and shows time, avatar, name, "{age} · {MRN} · {reason}" and StatusBadge. CANCELLED and NO_SHOW rows are included with their StatusBadge.
- Empty: "No appointments today" / "Your list is clear. Anything booked will appear here."

**Nurse: "Today's patients"** (`getNurseDay`: today's appointments that are not CANCELLED, each with `hasVitals`)
- h1 "{greeting}, {fullName}" plus the long date.
- Stats: "Patients today" · "Awaiting vitals" (CHECKED_IN without vitals; caution tint) · "Vitals recorded".
- Rows are not links: time, avatar, name, "{age} · Dr. X", a positive "Vitals recorded" or caution "Vitals needed" badge, and StatusBadge.
- Empty: "No patients on today's list" / "Checked-in patients will appear here."
- Footer card (inline Card, overline "Arriving in the next release"): "Recording vitals (BP, pulse, SpO₂, temperature, weight, height) lands with the operations release, alongside the live queue. The data model and the doctor-side display are already in place."

**Lab: "Laboratory worklist"** (clinic orders not VERIFIED/CANCELLED, take 100, sorted by priority rank STAT > URGENT > ROUTINE, then `orderedAt` ascending. **Fix:** the reference sorted the strings.)
- Sub-heading "Orders awaiting collection, processing or verification".
- **Rows:**
  - name + "age · MRN"
  - tests joined ", " · "Dr. X" · date
  - a critical alert badge showing the priority when it is not ROUTINE
  - a caution badge with the status in lowercase words
  - `clinicalNotes` in a subtle caption (rationale, not UI copy: the lab sees the clinical note attached to the order, not the record)
- Empty: "Nothing outstanding" / "New lab orders will appear here."
- Footer card (inline Card, overline "Arriving in the next release"): "Marking samples collected, uploading results and verifying reports ship with the clinical release. Your access is already restricted to the patients you have an open order for."

**Pharmacy: "Prescriptions to dispense"** (dispenseStatus PENDING or PARTIALLY_DISPENSED, oldest first, take 100)
- Sub-heading "Awaiting dispensing".
- **Card:**
  - patient name; "MRN · Dr. X · date"; caution status badge
  - **allergy banner**: a critical-wash pill "Allergies: {substances}" with an alert icon (rationale, not UI copy: allergies are the one clinical fact this role genuinely needs)
  - item lines "{medicineName} {strength}" with "× {qty}"
- Empty: "Nothing to dispense" / "New prescriptions will appear here."

### 6.28 Console patient search: `/console/patients`
- The same API, debounce and field copy as §6.23. Rows link to `/console/patients/{id}`.
- Loading: 2 skeletons. Error: "Search failed" / "Please try again." Empty: "No patients found" / "Check the spelling, or try the patient ID or mobile number."

### 6.29 Console schedule (DOCTOR): `/console/schedule`
- Sub-heading "{slotDurationMins}-minute slots · booking open {bookingHorizonDays} days ahead".
- One row per weekday, Mon → Sun (`[1,2,3,4,5,6,0]`): the day name (w-28), then "No clinic" or lines "HH:mm – HH:mm {location}".
- Empty: "No clinics set up" / "Ask the clinic administrator to add your consulting hours."
- Footer card (inline Card, overline "Arriving in the next release"): "Editing your own hours and marking leave ships with the operations release. Leave already affects patient booking — the availability engine honours schedule exceptions today."

### 6.30 Console patient chart: `/console/patients/[id]`
Rationale, not UI copy: safety facts sit above the fold and above the timeline, because a doctor reading this has about four seconds.

- **Access:**
  - `getPatientForActor` (audited). NOT_FOUND → `notFound()`.
  - FORBIDDEN → an inline caution card with a shield icon: "You don't have access to this patient", then the policy message, then "Emergency access is available for clinically necessary situations. It requires a reason, is logged, and is reviewed by the clinic administrator. It ships with the clinical release."
- **Header:** back link "Patients", lg avatar, h1 name, "{age} · {Male|Female|Other|Not stated} · {MRN} · {phone}", and a caution badge "Limited view" when the projection is not FULL.
- **Safety row** (rationale, not UI copy: allergies first; 3 columns on lg):
  1. "Allergies": critical-tinted when any exist. Lines read alert icon + **substance** — reaction (severity lowercased). Empty "None recorded".
  2. "Current medications": items from the 5 most recent ACTIVE prescriptions as "{medicineName} {strength}". Empty "None active".
  3. "Ongoing conditions": diagnoses with `isChronic` true and no `resolvedDate`, as "{label} · since {date}". Empty "None recorded".
- **Latest vitals** (only if a record exists):
  - overline "Latest vitals · {datetime} · {recordedByName}"
  - values, "—" when null: BP {sys}/{dia} mmHg · Pulse bpm · SpO₂ % · Temp °C (from tenths) · Weight kg (from grams) · Height cm (from mm)
- **"Patient timeline"**: the 30 most recent MedicalRecord rows, each with a kind icon, title, summary, "authorName · specialityName" and the date. Not clickable. Empty: "No records yet" / "This patient has no recorded history at the clinic."
- **Footer card** (inline Card, overline "Arriving in the next release"): "Start consultation, prescribe, order labs and imaging, refer, and schedule follow-up ship with the clinical release. The data model, the timeline and the access rules that back them are already live."
- **Fix:** each section renders only if the projection allows it (§4.5). For lab and pharmacy, the server never queries what they may not see.

---

## 7. Core flows

### 7.1 Sign-in (OTP)
1. **Client** POSTs `/api/auth/request-otp {phone}`.
2. **Server `requestOtp`:**
   1. `normalisePhone` accepts:
      - 10 digits starting 6–9 → `+91…`
      - a leading 0 on 11 digits
      - 12 digits starting `91`
      - any `+` number of 10–15 digits
      - anything else → VALIDATION "Enter a valid 10-digit mobile number."
   2. Rate limits: per phone 3 per 600s ("Too many code requests. Try again in {n} minute(s).") and per IP 20 per 3600s. **Fix:** when no client IP can be resolved, rate-limit under the key `ip:unknown` (or the socket address). The reference skips the per-IP bucket entirely when `x-forwarded-for` is absent.
   3. Look up the user by `(clinicId, phone)`. **Always** create an `OtpChallenge` (`codeHash`, `salt`, `purpose:"LOGIN"`, `attempts 0`, `maxAttempts 5`, `expiresAt = now+300s`, `ipAddress`). Set `userId` only if the user is active and not deleted.
   4. The code is 6 digits from `crypto.randomInt`, zero-padded. The salt is 16 random bytes in hex. The hash is `scrypt(code, salt, 32)` in hex.
   5. SMS is sent **only to a real account**: "{code} is your {clinic.name} verification code. It expires in 5 minutes. Do not share it with anyone."
   6. Response: `{challengeId, maskedPhone:"+91 •••• 210", expiresInSeconds:300, devCode?}`. `devCode` is present **only** when `NODE_ENV !== 'production'` and the user exists. In production, known and unknown numbers get the same HTTP status and the same JSON shape `{challengeId, maskedPhone, expiresInSeconds}`, with no `devCode` and comparable latency. `challengeId` and `maskedPhone` naturally differ between requests. An SMS delivery failure must not change the response. The reference awaits the SMS send only for known numbers, and with the console provider in production that send throws a 500 for known numbers only (§15 #35).
3. **Client** shows the code step, plus the dev box if `devCode` is present.
4. **Client** POSTs `/api/auth/verify-otp {challengeId, code}`. `code` must match `/^\d{6}$/`, else "Enter the 6-digit code."
5. **Server `verifyOtpAndSignIn`:**
   1. Per-IP limit 20 per 600s (same `ip:unknown` fallback).
   2. Missing challenge → "This code request is no longer valid. Please start again."
   3. Consumed challenge → "This code has already been used. Please request a new one."
   4. Expired → OTP_EXPIRED (410) "That code has expired. Please request a new one."
   5. Attempts already at max → OTP_ATTEMPTS_EXCEEDED "Too many incorrect attempts. Please request a new code."
   6. Wrong code → increment `attempts` and return OTP_INVALID "That code isn't right. {n} attempt(s) left." On the last failure, burn the challenge (`consumedAt`) and audit `auth.otp.attempts_exceeded` (HIGH, masked phone).
   7. Compare with `timingSafeEqual`.
   8. Valid code but no user → consume the challenge, then NOT_FOUND "We could not find an account for this number. Please contact the clinic to register." This is revealed only after a correct code.
   9. Success:
      - consume the challenge and set `phoneVerifiedAt` if null
      - `createSession`: 32 random bytes in base64url; store only the SHA-256 in `Session.tokenHash`; 30-day absolute TTL; set `lastLoginAt`
      - cookie `c360_session`: httpOnly, `sameSite:'lax'`, `secure` in production, `path:'/'`, explicit `expires`
      - audit `auth.signed_in`
      - return `{userId, role, redirectTo: surfaceForRole(role)}`
6. **Client** does a full navigation to `redirectTo`.
7. **Session reads:** `getActor()` returns null for a missing, revoked or expired session, or an inactive or deleted user. It touches `lastSeenAt` at most once a minute.

   `SessionActor = {sessionId, userId, clinicId, role, fullName, phone, locale, avatarUrl, activePatientId}`.
8. **Sign-out:** POST `/api/auth/logout` audits `auth.signed_out` (if signed in), sets `revokedAt` on the current session only, deletes the cookie and returns `{ok:true}`.

### 7.2 Onboarding
`/` (signed out) → `/onboarding`. The visitor moves through slides 1–4 with Continue or the dots, or uses "Skip". "Get started" goes to `/login`.

### 7.3 Booking, slot computation, reschedule, cancel, check-in

**Slot computation** (`getDoctorAvailability(doctorId, fromDateKey, days)`). Slots are **derived, never stored**.
1. Load the doctor (`slotDurationMins`, `bookingHorizonDays`, `isActive`, `acceptsNewPatients`).
   - Missing or inactive → `[]`.
   - **Fix:** a doctor outside the actor's clinic → `[]` as well.
2. Build `dateKeys` from `from` (default: today in the clinic) for `days` (default 14, clamped 1..60).
3. Run three queries in parallel:
   - all active `DoctorScheduleRule`s for the doctor, with no date filter (effective dates are filtered in memory in step 4)
   - `ScheduleException`s with `date` in range
   - Appointments in range that are not CANCELLED or NO_SHOW
4. For each day:
   - The day of week comes from `clinicDayOfWeek` (noon-UTC trick).
   - **Full-day leave** (`isAvailable=false`, no `startTime`) → zero slots.
   - **Applicable rules:** `dayOfWeek` matches, `effectiveFrom ≤ day+1`, and `effectiveTo` is null or ≥ the day.
   - **Extra windows** (`isAvailable=true` with times) borrow the first applicable rule's location. If no rule applies that day, skip the window.
   - **Partial blocks** (`isAvailable=false` with times) drop slots whose start minute is in `[from, to)`.
   - Step by `slotDurationMins` while `m + duration ≤ end`.
   - `startAt = wallTimeToInstant(dateKey, 'HH:mm')`. `label` is en-IN "10:20 am" in the clinic timezone.
   - `available = !inPast && !beyondHorizon && !taken && acceptsNewPatients`. `taken` means a live appointment for this doctor starts at that instant.
   - Keep unavailable slots in the payload "so the day's shape stays legible". Sort them and count `availableCount`.
5. Return `[{dateKey, availableCount, slots:[{startAt, label, available}]}]`.
6. `getNextAvailableByDoctor(ids, 14)` runs this per doctor in parallel and returns the first free slot. It powers the doctor cards and `/ops/doctors`.

**`bookAppointment`** (POST `/api/appointments`)
1. `assertCanAccessPatient(BOOK)`.
2. A past `startAt` → UNPROCESSABLE "That time has already passed. Please choose another slot."
3. The doctor must be in the clinic, active and not deleted, else NOT_FOUND "We could not find that doctor." `!acceptsNewPatients` → UNPROCESSABLE "This doctor is not accepting new appointments at the moment."
4. **Fix:** `startAt` must equal an `available` slot from the computed availability, which also enforces working days and the horizon. The reference accepted any future instant.
5. If the same patient already has a live appointment at that `startAt` → CONFLICT "This patient already has an appointment at that time."
6. **Fix:** if `followUpId` is supplied, it must be PENDING and belong to this patient.
7. Create the appointment in one transaction:
   - `status CONFIRMED`, `endAt = startAt + slotDurationMins`
   - `locationId` from the rule that produced the slot (Fix: the reference used the doctor's first rule)
   - `slotLock = "${doctorId}|${startAt.toISOString()}"`
   - `bookedById` and `bookedByRole`
   - `isFollowUp` and `followUpId`, with the FollowUp set to SCHEDULED
8. Prisma P2002 on `slotLock` → SLOT_TAKEN. Map other unique violations distinctly (Fix).
9. Audit `appointment.booked`.
10. Notify `APPOINTMENT_CONFIRMED`: title "Appointment confirmed", body "{patient} with Dr. {doctor} — Tue, 26 Aug, 10:20 am". **Fix:** the recipients are every user holding an ACTIVE grant to the patient, not the acting user. Set `Notification.patientId`.

**`cancelAppointment`** (PATCH `{action:'cancel', reason?≤300}`)
- Capability gate per §4.6, then BOOK scope.
- Missing → NOT_FOUND "We could not find that appointment."
- **Which states may be cancelled (Fix):** the reference rejects only CANCELLED and COMPLETED, and accepts NO_SHOW, CHECKED_IN, IN_CONSULTATION and past appointments. Reject with CONFLICT (409):
  - CANCELLED → "This appointment is already cancelled."
  - COMPLETED or NO_SHOW → "This appointment has already taken place."
  - CHECKED_IN or IN_CONSULTATION → "This appointment can no longer be changed."
  - a past `startAt` for PATIENT actors → "This appointment has already taken place."
- Set CANCELLED, `cancelledAt`, `cancellationReason`, and `slotLock = null`.
- `cancelledBy`: PATIENT for patients, DOCTOR for doctors, CLINIC for reception and admin. **Fix:** the reference maps every non-patient to CLINIC, so the enum's DOCTOR value is never used.
- Audit `appointment.cancelled` with the reason.
- Notify "Appointment cancelled" / "Your appointment on {26 Aug, 10:20 am} has been cancelled." (recipients as above).

**`rescheduleAppointment`** (PATCH `{action:'reschedule', startAt}`)
- Gate and scope as for cancel. Missing → NOT_FOUND "We could not find that appointment."
- CANCELLED, COMPLETED, NO_SHOW, CHECKED_IN or IN_CONSULTATION → CONFLICT "This appointment can no longer be changed." (Fix: the reference rejects only CANCELLED and COMPLETED.)
- A past new `startAt` → UNPROCESSABLE "That time has already passed. Please choose another slot."
- **Fix:** validate the new slot as in booking.
- In one `$transaction`:
  - The old row becomes CANCELLED with reason "Rescheduled", its lock released, and `cancelledBy` mapped as for cancel.
  - A new CONFIRMED row is created with `rescheduledFromId`.
  - **What the new row carries (Fix):** it copies `patientId`, `doctorId`, `specialityId`, `consultationType`, `reasonForVisit` and `isFollowUp`. `locationId` comes from the new slot's rule; the reference copies the old row's. `followUpId` moves from the old row to the new one. It is `@unique`, so null it on the old row first, in the same transaction; the reference drops it, so the new row loses its follow-up link. `bookedById` and `bookedByRole` are the rescheduling actor.
- P2002 → SLOT_TAKEN.
- Audit `appointment.rescheduled` with `{from, to, previousId}`.
- Notify "Appointment moved" / "Your appointment is now on {Tue, 26 Aug, 10:20 am}."

**`checkInAppointment`** (PATCH `{action:'check-in'}`)
- RECEPTIONIST and ADMIN only, clinic-scoped.
- "This appointment was cancelled." or "This patient is already checked in." when `checkedInAt` is set.
- **Fix:** also reject COMPLETED, NO_SHOW and IN_CONSULTATION on the server.
- **Fix:** check-in is allowed only when `clinicDateKey(appointment.startAt)` equals today in the clinic timezone. Otherwise return UNPROCESSABLE "Only today's appointments can be checked in." The reference has no date check, so reception can check in a patient for next week.
- Set CHECKED_IN and `checkedInAt`, and audit `appointment.checked_in`. No QueueEntry is created ("Phase 1 records the state; Phase 3 hangs the live queue off it.").

**Follow-up rebook**
- The Home "Follow-up due" card links to `/app/book?followUpId&doctorId`.
- The flow opens at the slot step with the doctor, speciality, patient and reason pre-filled and the follow-up banner shown.
- Booking marks the follow-up SCHEDULED.

### 7.4 Lab report reading and flagging rules
- Patients see **only VERIFIED** orders. Any other status is NOT_FOUND "That report is not ready yet." An unknown id or another patient's order is NOT_FOUND "We could not find that report."
- Non-verified orders appear only under "In progress", with the status words from §6.10. CANCELLED orders never appear.
- **Flag words:**

  | Flag | Word |
  |---|---|
  | NORMAL | none |
  | LOW | "Below range" |
  | HIGH | "Above range" |
  | CRITICAL_LOW | "Well below range" |
  | CRITICAL_HIGH | "Well above range" |
  | ABNORMAL | "Outside range" |
  | INCONCLUSIVE | "Inconclusive" |

- Any flag other than NORMAL, INCONCLUSIVE included, triggers:
  - the "Some values outside range" badge on the list
  - the safety banner on the detail page
  - a caution-coloured value with the flag word under it
- v1 gives critical flags the same caution treatment as high and low. A stronger treatment is an open decision (§15).
- Range: `refText`, else "{refLow} – {refHigh}", else "—". Result rows store a snapshot of the analyte's name, unit and reference values at measurement time.
- Previous value: the most recent earlier VERIFIED result for the same analyte, shown as "Previous {value} on {date}".
- Never interpret, never use colour alone, and always end with the variance footer.
- **Fix:** set `LabOrder.patientNotifiedAt` the first time a patient opens a VERIFIED report, so the Home "New lab report" card clears.
- `lab.report.viewed`: `getLabReport` writes this audit only for non-patient actors, and its only caller is the patient route. No staff route calls it in v1, so it is never emitted. It becomes live when a staff report viewer ships (Phase 2).

### 7.5 Family switching and the tinted band
1. Tap the header chip → "Who are you here for?" sheet.
2. Pick a member → POST `/api/family/active {patientId}`. The server runs `assertCanAccessPatient(READ)`, then `setActivePatient`.
3. On success, `router.refresh()` and close the sheet.
4. Every page resolves the active patient server-side (§4.7). A stale or tampered id silently falls back to SELF.
5. When the active patient is not SELF, the non-dismissible band "Viewing **{name}**'s records · {Relationship}" appears under the header on every screen.
6. The header chip always shows the active patient's name and avatar, and Home ends with "{fullName} · MRN {mrn}".
7. Appointment detail resolves by grant, not by the active patient. Lab report detail resolves by the active patient, so a link to a non-active member's report returns 404.
8. A VIEW_ONLY member can be viewed, but booking, cancelling and rescheduling for them return 403 "You have view-only access to this family member." The appointment detail page hides Reschedule and Cancel for them (Fix, §6.8).

### 7.6 SOS / emergency
- The SOS pill sits in the header on every `/app` screen. One tap opens the EmergencySheet (§6.1).
- The first action dials `{emergencyPhone}` (108).
- There is no triage, form or AI.
- `Permissions-Policy: geolocation=(self)` enables "Share my location".

### 7.7 Payments (v1 = honest, at the counter)
- Patients see invoices, line items, receipts and the outstanding total, with "Online payment is not switched on for this clinic yet. You can settle at the reception desk, or call us to pay over the phone." and a call button. There is no Pay button.
- `ManualPaymentProvider` is the only adapter and has no callers.
- `Payment.idempotencyKey @unique` exists "so a double-tap cannot double-charge".
- Admin "Collected today" sums SUCCEEDED payments. Seeded payments are UPI SUCCEEDED.
- Invoice writes and payment recording are not in v1. The invoice service is designated the sole future writer of `amountDue`.

### 7.8 Notifications
- **`notify()`:**
  - **Always** writes the IN_APP row first: `SENT` if `prefs.inApp` (default true), else `SUPPRESSED`.
  - Then fans out per channel, using the stored `NotificationPreference(userId, kind)` or these defaults:

    | Kind | Default channels |
    |---|---|
    | APPOINTMENT_CONFIRMED / _REMINDER / _CANCELLED / _RESCHEDULED | push + SMS |
    | LAB_REPORT_READY | push + SMS |
    | QUEUE_APPROACHING, PAYMENT_DUE, FOLLOW_UP_DUE | push |
    | ANNOUNCEMENT | none |
    | any other kind | push |

- **`deliver()`** writes one Notification row per external channel: `SENT` with `providerRef`, `SUPPRESSED` if the provider skipped (the noop push always does), `FAILED` on error. It **never throws**.
- **Bodies:**
  - Push body = `externalBody ?? title`. Push is not signed with the clinic name.
  - SMS = `${title}${detail} — ${clinic.name ?? 'Your clinic'}`, where `detail` is `. ${externalBody}` only when it differs from the title.
  - Email subject = title; body = `externalBody ?? title`.
  - Push and SMS stay non-clinical (R-16). No v1 caller passes `externalBody`, so the push body is the title alone, and the SMS is the title signed with the clinic name, e.g. "Appointment confirmed — Meriva Medical Centre".
- **Reads:**
  - `listNotifications(userId, 40)` returns IN_APP SENT and DELIVERED rows.
  - `unreadCount(userId)` drives the bell. It counts per user, not per family member.
  - Mark-read is wired per §6.16 (Fix).
- **Recipients:** patient account holders (Fix, §7.3).

---

## 8. Data model (Postgres via Prisma; 49 models, 31 enums)

**Conventions:**
- `cuid()` ids.
- `clinicId` on every clinically scoped table, "even though there is only one clinic today".
- `createdAt` everywhere; `updatedAt` on every mutable table. Omit `updatedAt` on append-only tables (AuditLog, Notification, Message, LabOrderItem, MedicationDoseLog). Adding it to AuditLog would contradict the append-only rule.
- `deletedAt` **only** where deletion is a legitimate business action. Clinical rows are superseded, amended or cancelled, never deleted: "A medical record that can vanish is not a medical record."
- Money is `Int` paise.
- An `@@index` for every filtered FK.
- Every table is `@@map`ped to a snake_case plural.
- Create the **whole** schema in v1, including later-phase tables, because v1 read views run over seeded data.

### 8.1 Enums

| Enum | Values |
|---|---|
| Role | PATIENT, DOCTOR, NURSE, LAB_TECH, PHARMACIST, RECEPTIONIST, ADMIN |
| Gender | MALE, FEMALE, OTHER, UNDISCLOSED |
| BloodGroup | A_POS … O_NEG, UNKNOWN |
| Relationship | SELF, SPOUSE, CHILD, PARENT, SIBLING, GRANDPARENT, GUARDIAN, OTHER |
| AccessLevel | FULL, VIEW_ONLY |
| GrantStatus | ACTIVE, PENDING_CONFIRMATION (adult must confirm on own number), PENDING_REVIEW (minor reached 18), REVOKED |
| ConsultationType | IN_PERSON, VIDEO, PHONE |
| AppointmentStatus | SCHEDULED, CONFIRMED, CHECKED_IN, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW |
| CancelledBy | PATIENT, CLINIC, DOCTOR, SYSTEM |
| QueueStatus | WAITING, VITALS, READY, IN_CONSULTATION, DONE, SKIPPED |
| ConsultationStatus | DRAFT, SIGNED, AMENDED |
| PrescriptionStatus | ACTIVE, COMPLETED, CANCELLED, SUPERSEDED |
| DispenseStatus | PENDING, PARTIALLY_DISPENSED, DISPENSED, NOT_AVAILABLE, CANCELLED |
| LabOrderStatus | ORDERED, SAMPLE_PENDING, SAMPLE_COLLECTED, IN_PROGRESS, RESULTS_UPLOADED, VERIFIED, CANCELLED |
| ResultFlag | NORMAL, LOW, HIGH, CRITICAL_LOW, CRITICAL_HIGH, ABNORMAL, INCONCLUSIVE |
| ImagingStatus | REQUESTED, SCHEDULED, ACQUIRED, REPORTED, CANCELLED |
| RecordKind | CONSULTATION, PRESCRIPTION, LAB_REPORT, IMAGING, PROCEDURE, VITALS, DOCUMENT, VACCINATION, ADMISSION, NOTE |
| DocumentKind | LAB_REPORT, IMAGING_REPORT, PRESCRIPTION, DISCHARGE_SUMMARY, INSURANCE, IDENTITY, CONSENT, REFERRAL, INVOICE, OTHER |
| JourneyStatus | ACTIVE, COMPLETED, PAUSED, ABANDONED |
| StepStatus | PENDING, IN_PROGRESS, COMPLETED, SKIPPED |
| FollowUpStatus | PENDING, SCHEDULED, COMPLETED, MISSED, CANCELLED |
| InvoiceStatus | DRAFT, ISSUED, PARTIALLY_PAID, PAID, REFUNDED, CANCELLED, WRITTEN_OFF |
| InvoiceCategory | CONSULTATION, LABORATORY, PHARMACY, IMAGING, PROCEDURE, OTHER |
| PaymentMethod | UPI, CARD, NETBANKING, CASH, INSURANCE, WALLET, OTHER |
| PaymentStatus | PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED |
| NotificationKind | APPOINTMENT_CONFIRMED, APPOINTMENT_REMINDER, APPOINTMENT_RESCHEDULED, APPOINTMENT_CANCELLED, DOCTOR_DELAYED, QUEUE_APPROACHING, QUEUE_YOUR_TURN, LAB_REPORT_READY, PRESCRIPTION_READY, PAYMENT_DUE, PAYMENT_RECEIVED, FOLLOW_UP_DUE, MEDICATION_REMINDER, ANNOUNCEMENT, MESSAGE_RECEIVED |
| NotificationChannel | IN_APP, PUSH, SMS, EMAIL |
| DeliveryStatus | QUEUED, SENT, DELIVERED, FAILED, SUPPRESSED (blocked by user preference or quiet hours) |
| ThreadCategory | GENERAL, APPOINTMENT, PRESCRIPTION_CLARIFICATION, REPORT_QUERY, BILLING |
| SenderType | PATIENT, STAFF, SYSTEM, AI_ASSISTANT |
| AuditSeverity | LOW, NORMAL, HIGH, CRITICAL |

### 8.2 Models by domain

**Clinic configuration**
- **Clinic** (the white-label record):
  - `slug @unique`, `name`, `tagline?`, `logoUrl?`
  - `brandPrimary @default("#0E7C6B")`, `brandAccent @default("#C2703D")`
  - `supportPhone`, `supportEmail?`, `emergencyPhone`, `websiteUrl?`, `registrationNo?`, `gstin?`
  - `defaultLocale "en"`, `timezone "Asia/Kolkata"`, `currency "INR"`
  - `settings Json "{}"`: "Clinic-wide policy switches (e.g. two-person lab release, overbooking)". The Fix keys `theme` and `mrnPrefix` also live here.
- **Location**: `name`, `addressLine1`, `addressLine2?`, `city`, `state`, `pincode` (all required except line 2), `phone?`, `latitude`/`longitude Float?`, `mapsUrl?` (for "Get directions"), `openingHours Json "[]"` shaped `[{day, opensAt, closesAt}]`, `isPrimary`, `isActive`, `deletedAt`. Index `[clinicId, isActive]`.
- **Department**: `name`, `slug` (unique per clinic), `description?`, `iconKey "stethoscope"` (an icon key, not an image URL), `displayOrder`, `isActive`, `deletedAt`.
- **Speciality**: `departmentId`, `name`, `slug` (unique per clinic), `patientBlurb?` ("Heart and blood vessels" rather than "Cardiology"), `iconKey`, `preparationNotes?` (shown before booking), `displayOrder`, `isActive`, `deletedAt`.

**Identity and auth**
- **User** ("A LOGIN identity. Deliberately NOT the same thing as a Patient."):
  - `phone` E.164, `@@unique([clinicId, phone])`
  - `email?`, `fullName`, `role @default(PATIENT)`, `locale`, `avatarUrl?`, `isActive`, `phoneVerifiedAt?`, `lastLoginAt?`, `deletedAt`
  - relations: sessions, OTP challenges, grants held (`GrantHolder`) and issued (`GrantIssuer`), optional `doctor` and `staffProfile` (1:1), audit logs, notifications, preferences, messages
- **Session**: `tokenHash @unique` (SHA-256), `activePatientId?` ("A UI convenience ONLY — it is never trusted for authorization"), `ipAddress?`, `userAgent?`, `expiresAt`, `lastSeenAt`, `revokedAt?`. Cascades on user delete.
- **OtpChallenge**: `clinicId`, `phone`, `userId?` (SetNull), `codeHash`, `salt`, `purpose @default("LOGIN")` (`LOGIN | GRANT_CONFIRM | PHONE_CHANGE`; only LOGIN is used in v1), `attempts 0`, `maxAttempts 5`, `expiresAt`, `consumedAt?`, `ipAddress?`. Index `[clinicId, phone, createdAt]`.

**Patients and family**
- **Patient** ("A clinical subject… whether or not they can log in"):
  - `mrn` with `@@unique([clinicId, mrn])`
  - `fullName`, `dateOfBirth`, `gender`, `phone?`, `email?`, `bloodGroup UNKNOWN`, `avatarUrl?`
  - address fields; emergency contact name, phone and relation
  - `abhaAddress?` and `abhaNumber?` (reserved for ABDM/ABHA)
  - `notableHistory?` (clinician free text), `isDependent`, `isActive`, `registeredAt`, `deletedAt`
  - indexes `[clinicId, isActive]`, `[clinicId, phone]`, `[clinicId, fullName]`
  - **No FK to User.**
- **PatientAccessGrant** ("THE privacy-critical table"): fields in §4.7. Indexes `[userId, status]`, `[patientId, status]`, `[reviewDueAt]`.
- **Allergy**: `substance`, `reaction?`, `severity "MODERATE"` (MILD/MODERATE/SEVERE), `notedAt`, `notedById?`, `isActive`.
- **InsurancePolicy**: `insurerName`, `policyNumber`, `holderName?`, `validFrom/To?`, `documentId?` (a plain string), `isActive`.

**Clinical staff**
- **Doctor**:
  - `userId @unique`, `specialityId`
  - `qualifications` (e.g. "MBBS, MD (General Medicine), DM (Cardiology)"), `registrationNo?`, `yearsExperience`
  - `languages String[]` (ISO-639-1), `bio?`, `photoUrl?`
  - `consultationFee Int` and `followUpFee Int?` in paise; null means the same as `consultationFee`
  - `slotDurationMins 20`, `bookingHorizonDays 30`, `acceptsNewPatients`, `isActive`, `displayOrder`, `deletedAt`
- **StaffProfile**: `userId @unique`, `employeeCode` (unique per clinic), `designation`, `departmentName?`, `permissions Json`, `deletedAt`.

**Scheduling**
- **DoctorScheduleRule** ("Slots are DERIVED from these, never stored"): `doctorId`, `locationId`, `dayOfWeek` (0 = Sun … 6 = Sat), `startTime`/`endTime` as "HH:mm" clinic-local, `consultationType`, `maxAppointments?`, `effectiveFrom`, `effectiveTo?`, `isActive`.
- **ScheduleException**: `date @db.Date`, `isAvailable false` (false = leave, true = extra availability), `startTime?`/`endTime?`, `reason?`, `createdById?`, `@@unique([doctorId, date, startTime])`.
- **Appointment**:
  - `clinicId`, `patientId`, `doctorId`, `specialityId`, `locationId?`, `startAt`, `endAt`, `consultationType`, `status SCHEDULED`
  - `reasonForVisit?`, `isFollowUp`, `followUpId? @unique`
  - **`slotLock String? @unique`**: `"<doctorId>|<startAt ISO>"` while live, NULL once cancelled or no-show
  - `bookedById?`, `bookedByRole?`, `checkedInAt?`, `cancelledAt?`, `cancelledBy?`, `cancellationReason?`
  - `rescheduledFromId?` (self-relation `"Reschedule"`), `joinUrl?` (future telehealth)
  - indexes `[clinicId, startAt]`, `[doctorId, startAt, status]`, `[patientId, startAt]`, `[clinicId, status, startAt]`
- **QueueEntry** (Phase 3, schema only): `appointmentId @unique`, `queueDate @db.Date`, `position`, `status WAITING`, `estimatedWaitMins?`, `calledAt`, `startedAt`, `completedAt`, `approachNotifiedAt`, `@@unique([doctorId, queueDate, position])`.

**Clinical records**
- **MedicalRecord** (the timeline spine): `kind`, `occurredAt`, `title`, `summary?`, polymorphic `sourceType` + `sourceId` with `@@unique([sourceType, sourceId])`, denormalised `authorName?` and `specialityName?`, `isProvisional`. Indexes `[patientId, occurredAt desc]` and `[patientId, kind, occurredAt desc]`.
- **Consultation**:
  - `appointmentId? @unique`, `status DRAFT`, `startedAt`, `endedAt?`
  - notes: `chiefComplaint`, `historyOfPresentIllness`, `pastHistory`, `examination Json`, `assessment`, `plan`, `advice`, `patientInstructions` ("surfaced verbatim in the patient app")
  - `signedAt?`, `signedById?`, `amendsId?` (self-relation `"Amendment"`), `amendmentReason?`
- **Diagnosis**: `code?`, `codeSystem "ICD10"`, `label`, `certainty "PROVISIONAL"` (PROVISIONAL/CONFIRMED/RULED_OUT), `isChronic`, `onsetDate?`, `resolvedDate?`, `notes?`.
- **VitalsRecord** (integers only): `systolicBp`, `diastolicBp`, `pulse`, `spo2`, `temperatureC10` (37.0 °C → 370), `weightGrams`, `heightMm`, `respiratoryRate`, `bloodSugarMgDl`, `recordedByName?`, `appointmentId?`.

**Medications**
- **Medication** (formulary): `name`, `genericName?`, `form "TABLET"`, `strength?`, `manufacturer?`.
- **Prescription**: `number` (unique per clinic), `issuedAt`, `status ACTIVE`, `diagnosisSummary?`, `generalInstructions?`, `validUntil?`, `dispenseStatus PENDING`, `dispensedAt?`, `dispensedById?`, `supersededById?` (a plain string).
- **PrescriptionItem**: snapshots `medicineName`, `strength` and `form`; `morning`/`afternoon`/`evening`/`night Float` ("1-0-1 is the Indian convention"); `timing "AFTER_FOOD"` (BEFORE_FOOD/AFTER_FOOD/WITH_FOOD/ANYTIME); `durationDays?`, `quantity?`, `instructions?`, `isSos`, `displayOrder`.
- **MedicationReminder** ("Patient-created … Never auto-created"; `times String[]`, `startDate`/`endDate @db.Date`) and **MedicationDoseLog** (`outcome` TAKEN/SKIPPED/MISSED, "never surfaced judgementally", `@@unique([reminderId, scheduledAt])`). Both are schema only.

**Laboratory**
- **LabTest**: `code` (unique per clinic), `name`, `category "HAEMATOLOGY"`, `preparationNotes?`, `sampleType?`, `turnaroundHours 24`, `price` (paise), `isPanel`.
- **LabAnalyte**: `labTestId`, `code`, `name`, `unit?`, `refLow`/`refHigh Float?`, `refText?`, `refVariants Json` (sex- or age-specific ranges), `displayOrder`. `@@unique([labTestId, code])`.
- **LabOrder**: `number`, `status ORDERED`, `priority "ROUTINE"` (ROUTINE/URGENT/STAT), `clinicalNotes?`, lifecycle timestamps with actor ids for collection, upload and verification, `verifiedByName?`, `patientNotifiedAt?`, `cancelledAt?`.
- **LabOrderItem**: `labTestId`, a `testName` snapshot, plus `price`.
- **LabResult**: snapshots `analyteName`, `unit` and reference fields; `valueNumeric?`/`valueText?`, `flag NORMAL`, `comment?`, `measuredAt`, `displayOrder` (orders the results on the report). Indexes `[labOrderId, displayOrder]`, and `[labAnalyteId, measuredAt]` for trends.

**Imaging, documents, journeys, follow-ups**
- **ImagingStudy**: `patientId`, `doctorId`, `consultationId?`, `number` (unique per clinic), `modality` (XRAY/USG/CT/MRI/ECHO/ECG), `bodyPart?`, `clinicalNotes?`, `status REQUESTED` (ImagingStatus), `requestedAt`, `performedAt?`, `reportedAt?`, `reportedByName?`, `findings?`, `impression?`, `studyInstanceUid?`, `pacsAccessionNo?` ("We never proxy pixel data"). The Records hub counts REPORTED studies.
- **Document**: metadata only. `storageKey` is "NEVER sent to the client". Also `mimeType`, `sizeBytes`, `checksum?` (SHA-256), `releasedToPatientAt?`, `deletedAt`.
- **DocumentShare**: `tokenHash @unique`, `expiresAt`, `maxViews 5`, `viewCount`, `revokedAt?`.
- **CareJourneyTemplate**: `slug` (unique per clinic), `name`, `specialityId?`, `description?`, `iconKey "route"`, `durationLabel?`, `isActive`.
- **CareJourneyStepTemplate**: `offsetDays?`, `patientGuidance?`, `isOptional`.
- **CareJourney**: `patientId`, `templateId?`, `doctorId?` (drives doctor scope, §4.4), `name`, `status ACTIVE`, `startedAt`, `completedAt?`, `notes?`.
- **CareJourneyStep**: `journeyId`, `name`, `description?`, `patientGuidance?`, `displayOrder` (`@@unique` with `journeyId`; orders the steps on Home), `status PENDING`, `dueAt?`, `completedAt?`, `sourceType?`/`sourceId?`.
- Steps are **copied** at instantiation, so "a patient's journey must not silently mutate when an admin edits the template".
- **FollowUp**: `patientId`, `doctorId`, `specialityId` (these two pre-select booking), `consultationId?`, `dueFrom`/`dueTo @db.Date` ("A WINDOW, not a date"), `reason`, `instructions?`, `status PENDING`, `remindedAt?`, `completedAt?`. It is fulfilled through `Appointment.followUpId`.

**Billing (all Int paise)**
- **Service**: `code`, `category`, `price`, `taxPercent Int`.
- **Invoice**: `number` (unique per clinic), `appointmentId?`, `category CONSULTATION`, `status ISSUED`, `issuedAt`, `subtotal`, `discount`, `tax`, `total`, `amountPaid`, **`amountDue`** (stored so it can be indexed), `dueAt`, `paidAt`, `notes?`, `createdById?`.
- **InvoiceLine**: `invoiceId`, `serviceId?`, `description`, `quantity 1`, `unitPrice`, `discount`, `taxPercent`, `lineTotal` (paise).
- **Payment**: `amount`, `method`, `status PENDING`, `providerName`/`providerRef`, `idempotencyKey String? @unique`, `receiptNumber`, refund fields.

**Communication and audit**
- **Notification**: `userId`, `patientId?` ("which family member this concerns"), `kind`, `title`, `body`, `actionUrl?`, `channel IN_APP`, `status QUEUED`, `providerRef?`, `scheduledFor?`, `sentAt?`, `readAt?`, `metadata Json`.
- **NotificationPreference**: `@@unique([userId, kind])`, defaults `inApp true`, `push true`, `sms false`, `email false`.
- **MessageThread** (schema only): `patientId`, `category GENERAL`, `subject`, `assignedToId?`, `isResolved`, `lastMessageAt`.
- **Message** (schema only): `threadId`, `senderType`, `senderId?`, `senderName`, `body`, `citations Json`, `readAt?`.
- **Announcement**: `title`, `body`, `specialityId?`, `publishedAt?`, `expiresAt?`, `isPinned`.
- **AuditLog** (append-only):
  - `clinicId`, `actorId?`, `actorRole?`, `actorName?`
  - `action` (verb-noun, e.g. "patient.record.viewed"), `targetType/Id?`, `patientId?` (denormalised)
  - `severity NORMAL`, `reason?` ("Why, for break-glass and overrides"), `ipAddress`, `userAgent`, `metadata jsonb`, `createdAt`
  - indexes on clinic, patient, actor, action and severity, each paired with `createdAt desc`

### 8.3 Why it is shaped this way
- **User ≠ Patient.** This covers an infant with no phone, a son managing his grandmother, a couple sharing one phone, revoking a daughter who moves abroad, and phone-number changes. The grant is "a join table with meaning" and the sole gateway.
- **Three anti-exposure layers:**
  1. Schema: no Patient → User FK.
  2. Policy: `assertCanAccessPatient` returns a projection.
  3. Query shape: `patientId: { in: allowedIds }`.
- **Timeline spine.** One index scan serves both the patient and doctor timelines at different densities. The unique `(sourceType, sourceId)` pair makes backfill idempotent. Author and speciality are denormalised as historical fact.
- **MRN.** It is the durable, clinic-issued identifier; the phone is only a login credential.
  - It comes from the Postgres sequence `CREATE SEQUENCE IF NOT EXISTS mrn_seq START WITH 1001 INCREMENT BY 1;`, which is safe under concurrent front-desk registration, with `(clinicId, mrn)` unique as a backstop.
  - Format `{mrnPrefix}%05d` (e.g. `…01001`). **Fix:** take the prefix from `Clinic.settings.mrnPrefix`, not the hard-coded `C360-`.
  - It is allocated inside the creating transaction.
- **Money as integer paise.** No float rounding. `formatMoney` sits only at the display boundary.
- **Soft delete** applies only where deletion is a business action. Clinical events are amended or superseded.
- **Concurrency.** The nullable unique `slotLock` (NULLs are distinct) makes a double booking impossible at the DB level. P2002 maps to "that slot was just taken".
- **Time.** Instants are UTC. **Fix:** use `@db.Timestamptz(3)`; the reference migration used `TIMESTAMP(3)` against the docs. Calendar days are `@db.Date`.
- **Audit.** Rows are append-only. The DB grant is applied at deploy (§11).
- **FK delete rules:**
  - CASCADE from patient on grants, allergies, insurance policies, medical records, documents, diagnoses, vitals, follow-ups, care journeys, message threads and medication reminders
  - RESTRICT from patient on appointments, consultations, prescriptions, lab orders, imaging studies and invoices
  - SET NULL on optional links
- **Migrations:** `…_init` (all enums, tables, indexes, FKs, including `CREATE UNIQUE INDEX "appointments_slotLock_key"`) and `…_mrn_sequence`.

---

## 9. API contract

### 9.1 Conventions
- **Auth:** the `c360_session` httpOnly cookie. There are no bearer tokens in v1. `/api/*` responds with `Cache-Control: no-store`.
- **`withApi(handler, {roles?, write?, auditAction?, body?})`.** **Every** route uses it (Fix: support dynamic route params). Its order:
  1. Correlation id from `x-request-id`, else `randomUUID()`.
  2. `getActor()`.
  3. If `roles` is set:
     - no actor → UNAUTHENTICATED
     - role not listed → audit `<auditAction>.denied` (or `api.forbidden`), severity HIGH, `metadata.path`, `ipAddress` and `userAgent`, then FORBIDDEN
  4. If `write` and there is an actor: per-session rate limit `write:<sessionId>`.
  5. Parse the JSON body with Zod:
     - unreadable JSON → VALIDATION "We could not read that request."
     - Zod issues → `details` keyed by field path, with message "Please check the details you entered."
  6. Run the handler.
  7. Respond `{ data }` with an `x-request-id` header.
  8. On any error, `toSafeError` → `{ error: { code, message, details } }` with the mapped status. Unknown errors are logged as `[<correlationId>] unhandled error:` and returned as an opaque INTERNAL.
- `auditAction` is used for denials only. Services write their own success audits.

### 9.2 Endpoints (v1)

| Method & path | Auth / roles | Request | `data` response | Limits / audit |
|---|---|---|---|---|
| POST `/api/auth/request-otp` | public | `{phone: string 6..20}` | `{challengeId, maskedPhone, expiresInSeconds:300, devCode?}` | 3/10min per phone, 20/h per IP |
| POST `/api/auth/verify-otp` | public | `{challengeId, code: /^\d{6}$/}` | `{userId, role, redirectTo}` and sets the cookie | 20/10min per IP; `auth.signed_in`; `auth.otp.attempts_exceeded` |
| POST `/api/auth/logout` | any | — | `{ok:true}` | `auth.signed_out` |
| GET `/api/auth/session` | any | — | `{user:null}` or `{user:{id,fullName,role,phone,locale}, activePatientId, family}` (family for PATIENT only) | for future native clients |
| GET `/api/family` | PATIENT | — | `[{grantId, relationship, level, isSelf, patient:{id,fullName,dateOfBirth,gender,avatarUrl,mrn,bloodGroup}}]` (ACTIVE, SELF first) | — |
| POST `/api/family` | PATIENT, write | `{fullName 2..120, dateOfBirth YYYY-MM-DD, gender, relationship ∈ SPOUSE, CHILD, PARENT, SIBLING, GRANDPARENT, OTHER, phone? ≤20}`. GUARDIAN and SELF → VALIDATION_ERROR (Fix: the reference accepts GUARDIAN although the UI does not offer it) | `{patientId, fullName, mrn, requiresConfirmation}` | write limit; `family.member.added` HIGH; denial `family.member.add.denied` |
| POST `/api/family/active` | PATIENT, write | `{patientId}` | `{activePatientId}` | write limit; READ policy check |
| GET `/api/patients/search?q=` | non-patient staff (**Fix:** DOCTOR, NURSE, RECEPTIONIST, ADMIN) | `q` ≥2 chars, else `[]` | up to 25 `{id, fullName, mrn, dateOfBirth, gender, phone}`, clinic-scoped, not deleted, name/MRN case-insensitive contains or phone contains, ordered by name | 30/min per session; `patient.searched` LOW with `{queryLength, resultCount}` only, never the query text |
| POST `/api/appointments` | PATIENT, RECEPTIONIST, ADMIN, write | `{patientId, doctorId, startAt ISO, consultationType IN_PERSON/VIDEO/PHONE (default IN_PERSON), reasonForVisit? ≤500, followUpId?}` | `{id, startAt, doctorName, specialityName, patientName, locationName}` | write limit; `appointment.booked` |
| PATCH `/api/appointments/:id` | signed in + per-action gate (§4.6), write | `{action:'cancel', reason? ≤300}` / `{action:'reschedule', startAt ISO}` / `{action:'check-in'}`; bad body → "That action is not valid." | `{id,status}` (cancel, check-in) / `{id,startAt}` (reschedule) | write limit; `appointment.cancelled`, `.rescheduled`, `.checked_in` |
| GET `/api/doctors/:id/availability?from=YYYY-MM-DD&days=N` | PATIENT, DOCTOR, NURSE, RECEPTIONIST, ADMIN (Fix) | `days` default 14, clamp 1..60; bad date → "Invalid date." | `[{dateKey, availableCount, slots:[{startAt, label, available}]}]` | `[]` for an unknown, inactive or other-clinic doctor |

### 9.3 Errors

| Code | HTTP | Default message |
|---|---|---|
| VALIDATION_ERROR | 400 | "Please check the details you entered." |
| UNAUTHENTICATED | 401 | "Please sign in to continue." |
| FORBIDDEN | 403 | "You don't have access to this." |
| NOT_FOUND | 404 | "We couldn't find what you were looking for." |
| CONFLICT | 409 | caller-supplied |
| SLOT_TAKEN | 409 | "That time was just booked by someone else. Please pick another slot." |
| UNPROCESSABLE | 422 | caller-supplied |
| RATE_LIMITED | 429 | "Too many attempts. Please wait a moment and try again." (**Fix:** add a `Retry-After` header) |
| OTP_INVALID | 400 | set at the call site |
| OTP_EXPIRED | 410 | set at the call site |
| OTP_ATTEMPTS_EXCEEDED | 429 | set at the call site |
| INTERNAL | 500 | "Something went wrong on our side. Please try again." |

### 9.4 Rate limits

| Bucket | Limit |
|---|---|
| OTP request per phone | 3 per 10 min |
| OTP request per IP | 20 per hour |
| OTP verify per IP | 20 per 10 min |
| Writes per session (`write:true` routes) | 60 per min |
| Search per session | 30 per min |

- The limiter is an in-process fixed window. The IP is the first `x-forwarded-for` entry. Dead keys are swept once the map exceeds 5000 entries.
- **Fix:** when no client IP can be resolved, use the key `ip:unknown` (or the socket address) rather than skipping the per-IP bucket.
- Mark it "KNOWN LIMITATION (R-15)": replace it with Redis before horizontal scaling.

### 9.5 Pagination
There is none in v1; no `meta` is emitted. Every list is capped server-side:

| List | Cap |
|---|---|
| search | 25 |
| past appointments | 20 |
| patient appointment list | 50 |
| patient lab reports | 50 |
| patient invoices (bills) | 50 |
| notifications | 40 |
| patient timeline | 25 |
| doctor timeline | 30 |
| prescriptions | 30 |
| announcements | 20 (Home 3) |
| journeys on Home | 3 |
| ops patient appointments / invoices | 20 each |
| worklists | 100 |
| audit | 100 |

Cursor pagination (`meta.nextCursor`) is Not in v1.

---

## 10. Design system

### 10.1 Token rules
- Components use **semantic tokens only**, never literal palette classes such as `teal-600` or `bg-red-500`.
- Tokens are CSS variables in RGB-channel form (§3.4), exposed as Tailwind colours.
- `* { border-color: var(--border) }` is the default.
- The only permitted literal colours are the six Avatar tints, the sheet scrim `#16211F` at 40%, and `theme-color`.

### 10.2 Colour tokens

| Token | Light | Dark (dormant) | Meaning |
|---|---|---|---|
| `--bg` | `#FAF9F7` | `#101614` | App background, warm bone ("Warm neutral reads as paper") |
| `--surface` | `#FFFFFF` | `#171E1C` | Cards, sheets |
| `--surface-sunken` | `#F2F0EC` | `#1E2624` | Insets, skeletons, hover |
| `--surface-raised` | `#FFFFFF` | `#1C2422` | Raised surfaces |
| `--border` | `#E7E3DC` | `#2A3331` | Hairlines, default border |
| `--border-strong` | `#D3CEC5` | `#3A4441` | Input borders, secondary buttons |
| `--ink` | `#16211F` | `#EEF2F0` | Primary text |
| `--ink-muted` | `#5C6B68` | `#A3B0AD` | Secondary text (≈5.3:1 on bg) |
| `--ink-subtle` | `#8A9793` | `#77837F` | Tertiary text, never essential (≈2.9:1 on bg) |
| `--ink-inverse` | `#FFFFFF` | `#101614` | Text on brand/critical/emergency fills (use this, not `text-white`) |
| `--brand` | **Meriva `#0E56A0`** (default `#0E7C6B`) | default `#3AA08C` | Primary actions, active nav, focus ring |
| `--brand-hover` | **`#0B4787`** (`#0B6759`) | `#47B09B` | Primary hover/active |
| `--brand-ink` | **`#0B3A6E`** (`#0A5F52`) | `#7FD0BF` | Text on brand-wash, ghost buttons |
| `--brand-wash` | **`#E7EFF8`** (`#E8F3F0`) | `#16302B` | Selected/tinted backgrounds, the family band |
| `--accent` | **`#F07F1A`** (`#C2703D`) | `#D9895A` | "The rare moment that must be noticed" |
| `--accent-wash` | **`#FEF1E3`** (`#FBF0E8`) | `#2E2019` | Accent tint (outstanding cards) |
| `--positive` / `-wash` | `#2F7D5B` / `#E9F4EE` | `#4DA97F` / `#162B21` | Normal, paid, completed |
| `--caution` / `-wash` | `#B07A16` / `#FDF3E0` | `#D3A03C` / `#2D2513` | Pending, awaiting action, out-of-range values |
| `--critical` / `-wash` | `#B3261E` / `#FDECEA` | `#E2685F` / `#2F1917` | Allergies, overdue, destructive |
| `--emergency` | `#C0271F` | `#E2685F` | The emergency affordance only |
| `--font-sans` | `'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif` | | |

- The bold Meriva values are the proposed launch mapping from §2.3, pending clinic approval.
- Dark mode (`darkMode: ['class', '[data-theme="dark"]']`) is configured but **Not in v1**. Nothing sets `data-theme`.
- Meriva dark brand values are undefined. Before enabling dark mode, design them and make sure the inline clinic vars do not override the dark set.

### 10.3 Type scale (Inter)

| Token | Size / line-height | Weight | Tracking |
|---|---|---|---|
| overline | 11 / 14 | 600 | +0.08em (callers add `uppercase`) |
| caption | 13 / 18 | 500 | |
| body-sm | 14 / 20 | 400 | |
| body | 16 / 24 | 400 | |
| subheading | 16 / 22 | 600 | |
| heading | 19 / 26 | 600 | |
| title | 24 / 30 | 600 | −0.01em |
| display | 32 / 38 | 600 | −0.02em |

- Body defaults: 1rem / 1.5, antialiased, `text-rendering: optimizeLegibility`.
- `.tabular` sets `font-variant-numeric: tabular-nums` and `'tnum' 1`. Use it on every number, time, MRN, money value and OTP digit.

### 10.4 Space, layout, radius, elevation, motion
- **Spacing:** the Tailwind default 4px scale.
- **Patient layout:** gutter `px-5` (20px), column `max-w-patient` = 30rem (480px), main `pb-28` to clear the nav.
- **Cards:** `p-5`.
- **Staff layout:** main `p-5 lg:p-8`, `max-w-6xl`, rail `w-60`.
- **Radius:** sm 8 · md 12 (buttons, inputs) · lg 16 (cards) · xl 20 · 2xl 24 (sheets) · full (badges, pills).
- **Shadows:**
  - `raised`: `0 1px 2px rgba(22,33,31,.05), 0 1px 3px rgba(22,33,31,.04)`
  - `overlay`: `0 8px 24px rgba(22,33,31,.10), 0 2px 6px rgba(22,33,31,.05)`
  - `focus`: `0 0 0 2px var(--bg), 0 0 0 4px var(--brand)`
- **Motion:**
  - durations fast 120ms, base 180ms, slow 260ms; easing `ease-smooth` = `cubic-bezier(.2,.7,.3,1)`
  - `fade-in` 180ms; `slide-up` 180ms (translateY 8px → 0 with opacity); `sheet-in` 260ms (translateY 100% → 0); `spin`
  - **Fix:** register an `animation.shimmer` entry so `@keyframes shimmer` actually compiles, and use a token-based sweep colour, not hard-coded white.
  - `prefers-reduced-motion: reduce` sets all animation and transition durations to 0.01ms and `scroll-behavior: auto`.

### 10.5 Global utilities
- **Focus ring:** `:where(a, button, input, select, textarea, [tabindex]):focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; border-radius: 4px }`.
- `.skip-link`: offscreen, top-left on focus.
- `.safe-bottom`: `padding-bottom: env(safe-area-inset-bottom)`.
- `.no-scrollbar`.
- `@media print .no-print`.
- **Viewport:** no `maximum-scale`, so pinch-zoom always works.

### 10.6 Components & variants

| Component | Spec |
|---|---|
| **Button** | **Variants:** primary `bg-brand text-ink-inverse hover:bg-brand-hover` (disabled `bg-brand/50`) · secondary `bg-surface text-ink border border-border-strong hover:bg-surface-sunken` · ghost `text-brand-ink hover:bg-brand-wash` · danger `bg-critical text-ink-inverse hover:opacity-90` · emergency `bg-[--emergency] text-ink-inverse`. **Fix:** the reference uses `text-white` on primary, danger and emergency. **Sizes:** sm `h-9` (36px, staff/dense only) · md `h-11` (44px) · lg `h-[52px]`. **Base:** `inline-flex rounded-md font-semibold transition-colors duration-fast ease-smooth select-none disabled:opacity-60 disabled:cursor-not-allowed`. **Props:** `variant`, `size`, `loading`, `fullWidth`. **Loading** sets `disabled` + `aria-busy`. **Fix:** keep the label for screen readers (sr-only) and keep the width stable |
| **LinkButton** | `next/link` with Button styles |
| **Spinner** | 16px SVG, `animate-spin`, 25%-opacity track + arc, `aria-hidden` |
| **Card / CardLink** | `rounded-lg border bg-surface shadow-raised p-5`. CardLink is a real anchor with `hover:border-border-strong` |
| **SectionHeader** | Takes an `id` prop and renders `<h2 id={id} class="text-overline uppercase text-ink-muted">` + an optional action, in `mb-3 flex items-baseline justify-between`. **Fix:** the reference's h2 has no id, so `aria-labelledby` targets dangle (§15 #51) |
| **Badge** | Tones: neutral (`bg-surface-sunken text-ink-muted`), brand (`bg-brand-wash text-brand-ink`), positive, caution, critical (wash bg + tone text), accent (accent-wash bg + **ink** text + icon; **Fix:** the reference uses `text-accent`, which is ≈3.3:1 on the teal set and ≈2.4:1 on the proposed Meriva set). Shape: `inline-flex gap-1 rounded-full border px-2.5 py-1 text-caption font-semibold`. **Fix:** `icon` is required |
| **Dot** | 8px tone dot, `aria-hidden`; always paired with text |
| **StatusBadge** | SCHEDULED/CONFIRMED → brand + clock "Confirmed" · CHECKED_IN → positive + check "Checked in" · IN_CONSULTATION → positive + stethoscope "With the doctor" · COMPLETED → neutral + check "Completed" · CANCELLED → critical + close "Cancelled" · NO_SHOW → caution + alert "Missed" (12px icons) |
| **Avatar** | **Initials:** first letter of the first word + first letter of the last word, uppercased, "?" if empty. **Tint:** deterministic `hash = (hash*31 + charCode) >>> 0` mod 6 over the pairs `#E8F3F0/#0A5F52`, `#FBF0E8/#8F4E22`, `#EDEFF7/#3B4785`, `#F3EEF7/#6A4585`, `#E9F4EE/#245F44`, `#FDF3E0/#7E560F`. **Sizes:** sm 32 (caption) · md 44 (body-sm) · lg 64 (heading). An image renders `alt=""`; initials render `aria-hidden`. The name must appear nearby |
| **Field / Input / Textarea / Select** | **Field:** visible `<label>` (body-sm semibold), required `*` (**Fix:** plus `aria-required`), hint `#{id}-hint` shown only without an error, error `#{id}-error` with an aria-hidden ⚠ + critical text. **Control:** `w-full rounded-md border bg-surface px-3.5 text-body text-ink placeholder:text-ink-subtle disabled:bg-surface-sunken`. **Input:** `h-11`, `aria-invalid`, critical border when invalid. **Textarea:** `min-h-[88px] py-2.5`. **Select:** `h-11 pr-9`, native chevron. **Fix:** `aria-describedby` points only at elements that exist; Textarea and Select support the invalid and error states |
| **Sheet** | Props `open`, `onClose`, `title`, `tone` (default/emergency). Bottom sheet on mobile, centred dialog from `sm`. `role="dialog" aria-modal="true"`, labelled by its h2 via `aria-labelledby` (**Fix:** the reference duplicates the title in `aria-label`). Behaviour: saves the opener, locks body scroll, focuses the first focusable element (Close), Escape closes, Tab and Shift-Tab wrap, cleanup restores focus. Scrim `#16211F`/40% `animate-fade-in`, closes on click. Panel `max-h-[85dvh] max-w-patient overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-surface p-5 pb-8 shadow-overlay animate-sheet-in`. Emergency tone adds `border-t-4 border-[--emergency]`. Close button `aria-label="Close"` (**Fix:** ≥44px). **Fix:** the effect must not re-run when callers pass an inline `onClose` |
| **EmptyState** | Icon, title, body, optional link action. `rounded-lg border border-dashed px-6 py-10 text-center bg-surface/60`. Title subheading, body body-sm muted `max-w-xs`, action LinkButton md `mt-5` |
| **ErrorState** | Default title "Something went wrong", `role="alert"`, critical-wash with a `border-[--critical]/25` border, "Try again" (secondary) when `onRetry`, "Contact clinic" `tel:` when `clinicPhone` (always pass it) |
| **Skeleton** | `rounded-md bg-surface-sunken shimmer`, `aria-hidden`. **Fix:** the container gets `aria-busy` + sr-only "Loading". Also **SkeletonCard** |
| **SuccessNote** | `role="status"`, positive-wash, subheading title in the positive colour, body-sm muted |
| **Icons** | Hand-drawn, 24px grid, `stroke=currentColor` 1.75, round caps and joins, `aria-hidden`, default 20px. Home, Calendar, Records, Message, User, Stethoscope, Pill, Flask, Card, Clock, Pin, ChevronRight, ChevronLeft, Check, Close, Plus, Phone, Alert, Route, Search, Bell, Heart, Scan, Users, Trend, Logout, Shield, Building. `ICONS` map for DB keys: stethoscope, heart, pill, flask, scan, users, route, building, user, calendar. `DynamicIcon` falls back to Stethoscope |
| **Patterns** | PatientShell, FamilySwitcher, EmergencySheet (§6.1) · StaffShell (§6.20) · ComingNext: back link pill, h1 title, Card with the phase overline ("Arriving in the next release"), description and an optional primary alternative link. Use it only for the `/app/records/imaging` page. Staff screens use an inline footer Card with the same overline instead, because ComingNext would add a stray back link and h1 to the dashboards · OtpInput (§6.3) |

### 10.7 The four states (every screen)
- **Loading:** a skeleton shaped like the real content, never a centred spinner.
- **Empty:** an EmptyState with an icon, a plain title, a helpful body and, where useful, an action.
- **Error:** plain language, "Try again" and "Contact clinic", with no status codes.
- **Success:** explicit and specific, e.g. "Appointment confirmed", "{name} has been added", "Their patient ID is {mrn}."

### 10.8 Accessibility rules
- Contrast ≥4.5:1 for body text and ≥3:1 for large text, **verified per token pair with tooling**.
- Touch targets ≥44px. Patient primaries are 52px. Dense staff rows may be 36px.
- 2px `--brand` focus ring with a 2px offset. Full keyboard support. Skip links in both shells. `aria-current` on nav.
- Semantic HTML: real headings, `<nav>`, `<main>`, tables with `scope=col` and captions.
- Live regions: `role="alert"` for errors, `role="status"` for success and location status.
- Labels always visible.
- **Patient body copy is never below 16px.** Secondary metadata may use 14 and 13px. **Fix:** nothing below 11px (the reference used 10px).
- Pinch-zoom is allowed and reduced motion is honoured. Icons and initials avatars are `aria-hidden`.
- Plain language throughout.

### 10.9 Status is never shown by colour alone
- Every badge pairs an icon with a word. Appointment states use word + icon + tone. Lab flags are words. Journey steps use shape + label. Field errors carry ⚠ + text.
- Colour-only dots must be `aria-hidden` and accompanied by text, sr-only or visible.

### 10.10 Safety-copy rules
1. Never state or imply a diagnosis. Out-of-range results always use the safety banner sentence ending "This is not a diagnosis."
2. Adherence is counts, never percentages (when built).
3. No interstitial before emergency care.
4. An AI assistant must always be labelled as an assistant (when built).
5. Push, SMS and lock-screen text is non-clinical.
6. Medicines: "Never change or stop a medicine without speaking to your doctor."
7. Results: "Reference ranges vary between laboratories. Always read a result alongside your clinical history."

### 10.11 Patient-selection safety
- The name and avatar of the active patient appear in every patient header.
- The tinted band is non-dismissible.
- Switching triggers a visible reload.
- The patient's name is repeated inside clinical content. Every screen with clinical detail shows "{fullName} · MRN {mrn}" in the content: the Home footer, the Records sub-line, and (with the Fix) Prescriptions, the Lab reports list and the lab report detail. The reference shows no name on Prescriptions, the lab list or the lab detail.
- Sensitive-action confirmations name the patient. For example, the Cancel sheet body reads "Your slot with Dr. {doctorName} for {patientName} will be released…" (Fix, §6.8).

---

## 11. Security, privacy & compliance

- **Threat model, in order of real-world frequency:**
  1. Curious insider ("most common real breach")
  2. Family member with stale access
  3. Shared or lost phone ("extremely common in the Indian market")
  4. Credential stuffing or OTP brute force
  5. Object-storage URL leakage ("a report URL forwarded on WhatsApp")
  6. XSS, CSRF, IDOR
- **Authentication:** §7.1. CSPRNG 6-digit code, scrypt with a 16-byte salt, constant-time compare, 5-minute TTL, 5 attempts then burned, enumeration-resistant responses, a dev code only outside production.
- **Sessions:** server-side, SHA-256 token hash, 30-day absolute TTL, httpOnly + SameSite=Lax + Secure (prod) cookie, revoked on logout. "Sign out on all devices" and a device list are Not in v1 (R-5).
- **Authorisation:** server-side policy only (§4). Patients get 404 on scope denial and staff get 403. Projections are enforced in queries.
- **Audit:**
  - `audit()` is the only writer. Failures are logged and swallowed: "Auditing must never break the request it is auditing."
  - Metadata is allow-listed primitives only; never spread an entity (R-6).
  - **Fix:** every `audit()` caller passes `ipAddress` and `userAgent` from `requestMeta()` on every row, including `withApi` denials, `patient.record.viewed` and the `appointment.*` actions. In the reference only the auth flows fill them.
  - Actions emitted in v1:

    | Action | Severity / notes |
    |---|---|
    | `auth.signed_in`, `auth.signed_out` | NORMAL |
    | `auth.otp.attempts_exceeded` | HIGH, masked phone |
    | `appointment.booked`, `appointment.cancelled` (with reason), `appointment.rescheduled`, `appointment.checked_in` | audited for patients too |
    | `patient.record.viewed` | non-patient actors only; metadata `{projection, basis}` |
    | `family.member.added` | HIGH |
    | `patient.searched` | LOW; `{queryLength, resultCount}` only |
    | `<action>.denied` / `api.forbidden` | HIGH |
    | **Fix:** scope denials from `assertCanAccessPatient` | HIGH |

  - `lab.report.viewed` is **not** emitted in v1. The code path exists (non-patient actors only), but no staff route calls it. It becomes live when a staff report viewer ships (Phase 2).
  - "Failed authorisation attempts … are the interesting ones."
- **Append-only at the DB level** (deploy step, R-7): `REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM <app role>;`. The reference names the role `clinic360_app`; use your deployment's app role. Until this is applied, append-only is a convention.
- **Headers (`next.config.ts`):**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
  - `Cache-Control: no-store` on `/api/*`
  - `poweredByHeader: false`
  - `serverExternalPackages` for prisma/pg
  - TLS + HSTS are deployment items. CSP is not in v1.
- **PHI handling:**
  - No PHI in logs, errors or analytics (R-6). `toSafeError` hides internals.
  - The search audit never stores the query.
  - Push and SMS are non-clinical (R-16).
  - `robots: noindex, nofollow`.
- **Data protection:**
  - TLS, HSTS, secure cookies, volume and object-storage encryption.
  - **No application-level column encryption**: "it would break search and indexing while adding little".
- **Retention:**
  - medical records: a 3-year minimum is the common standard; clinic policy is configurable
  - sessions: 30 days
  - OTP challenges: purge after 24h (job Not in v1)
  - audit logs: long-term
- **File storage (design; download and share are Not in v1):**
  - Metadata and bytes are separate, and `storageKey` never reaches the browser.
  - Download path: session → `assertCanAccessPatient(...,'READ_DOCUMENT')` → `releasedToPatientAt` check for patients → audit `document.downloaded` → stream with no-store.
  - Shares: SHA-256 token, expiry, `maxViews` 5, revocable.
  - DICOM: store `studyInstanceUid` and `pacsAccessionNo` only. "The PACS remains the system of record for images."
- **Regulatory posture:** "Written to be adaptable rather than claiming certification."
  - **DPDP Act 2023**: health data is sensitive personal data. The design supports purpose limitation (projections), consent records, access rights and audit. A formal DPIA is outstanding.
  - **Telemedicine Practice Guidelines 2020** apply when video ships.
  - **ABDM/ABHA** is deferred (R-11; fields reserved only).
  - "This product is not claimed to be HIPAA-compliant; HIPAA is US law and does not apply to an Indian clinic."
  - "DLT registration is mandatory for transactional SMS in India." Register the exact OTP template text (with "Meriva Medical Centre" interpolated) and pass `templateId` (`SMS_DLT_TEMPLATE_OTP`) on every OTP send when a real provider lands.
- **Risk register (target state for v1):**

  | ID | Risk | Severity | Expected state |
  |---|---|---|---|
  | R-1 | Family member reads another patient's records | Critical | Holds |
  | R-2 | Staff browse without a care relationship | Critical | Policy holds, **projection enforced (Fix)**; break-glass is Phase 2 |
  | R-3 / R-13 | Report URL leaks / document IDOR | Critical / High | No document routes in v1 |
  | R-4 | OTP interception or brute force | High | Holds |
  | R-5 | Session theft on a shared device | High | Cookie + revocation; device list Phase 3 |
  | R-6 | PHI in logs, errors or analytics | High | Holds |
  | R-7 | Audit trail tampered | High | Partial until the REVOKE |
  | R-8 | Payment data mishandled | High | By design |
  | R-9 | Secrets in the repo | High | `.env` ignored |
  | R-10 | Backup exfiltration | High | Deploy work |
  | R-11 | ABDM/ABHA divergence | Medium | Open, needs legal review |
  | R-12 | Consent not recorded | Medium | Not in v1 |
  | R-14 | AI leaks records across patients | Critical | Phase 4 |
  | R-15 | Per-process rate limiter | Medium | Known limitation |
  | R-16 | Lock-screen PHI | Medium | Holds |

- **Pre-production checklist ("Not optional", from the README):**
  - [ ] Real SMS provider with DLT templates
  - [ ] Private S3 bucket with encryption at rest
  - [ ] Revoke UPDATE/DELETE on `audit_logs` (R-7)
  - [ ] Redis rate limiter (R-15)
  - [ ] TLS with HSTS, and secure cookies
  - [ ] Encrypted backups (R-10)
  - [ ] DPIA against DPDP 2023, plus legal advice on ABDM/ABHA (R-11) and digital prescriptions
  - [ ] Answer the 12 open product questions (§13)
  - [ ] (added, not in the README) Never run the demo seed in production

---

## 12. Seed / demo data (fictional), re-branded for Meriva

- **Determinism:** a deterministic LCG with seed 42, and `ist(dayOffset, hh, mm)` (+330 min) for date-relative data.
- The seed wipes every table (all 49 models) child-to-parent in one `$transaction`, then runs `ALTER SEQUENCE mrn_seq RESTART WITH 1001`. So `db:seed` alone resets and reseeds an already-seeded database.
- The console prints: "Demo accounts — sign in at /login with any of these numbers. In development the OTP is shown on screen; no SMS gateway is needed."
- **Never seed Meridian or Kochi strings.** Interpolate `clinic.name` wherever the reference hard-coded the brand: doctor bios, the lab author name, the notification location.

### 12.1 Clinic row

| Field | Value |
|---|---|
| slug | `meriva-medical-centre` |
| name | Meriva Medical Centre |
| tagline | A place where care meets life. |
| logoUrl | served URL of `assets/logo/mark.png` |
| brandPrimary / brandAccent | `#0E56A0` / `#F07F1A` (proposed, §2.3; confirm with Meriva before seeding) |
| settings | `{ twoPersonLabRelease: false, allowOverbooking: true, theme: { brandHover: "#0B4787", brandInk: "#0B3A6E", brandWash: "#E7EFF8", accentWash: "#FEF1E3" }, mrnPrefix: "<confirm with clinic>" }` (theme values proposed) |
| supportPhone | the clinic's real number (required; **do not** reuse the Meridian `+914842890100`) |
| supportEmail | `care@meriva.example` (demo) |
| emergencyPhone | `108` |
| websiteUrl | `null` (no public site found) |
| registrationNo / gstin | `null` until the clinic supplies them |
| defaultLocale / timezone / currency | `en` / `Asia/Kolkata` / `INR` |

### 12.2 Locations
- **Primary:** "Meriva Medical Centre, Coimbatore", city Coimbatore, state Tamil Nadu, `isPrimary=true`, opening hours Mon–Fri 08:00–20:00 and Sat 08:00–14:00 (as in the reference).
  - Address, pincode, phone, lat/lng and `mapsUrl` must come from the clinic. Use clearly marked placeholders until then. Make sure `mapsUrl` or lat/lng is set so "Directions" works.
- **Optional second site:** the reference seeded a second, annexe location (Mon/Wed/Fri 09:00–17:00) to exercise multi-location paths. If you keep it, label it demo-only and remove it before launch.

### 12.3 Departments and specialities
| Department | Specialities |
|---|---|
| Medicine | General Medicine · Cardiology · Endocrinology |
| Women's Health | Obstetrics & Gynaecology · Fertility |
| Child Health | Paediatrics |
| Surgery & Bones | Orthopaedics · Dermatology |

- **Patient blurbs:** reuse the reference blurbs, which are already plain-language:
  - General Medicine: "Fevers, infections, blood pressure, diabetes and general health concerns"
  - Cardiology: "Heart, blood pressure and circulation"
  - Endocrinology: "Diabetes, thyroid and hormone-related concerns"
  - Obstetrics & Gynaecology: "Pregnancy, women's health and reproductive care"
  - Fertility: "Support and treatment for couples trying to conceive"
  - Paediatrics: "Care for infants, children and teenagers"
  - Orthopaedics: "Bones, joints, back pain and sports injuries"
  - Dermatology: "Skin, hair and nail concerns"
- **Preparation notes:**
  - Cardiology: "Bring any previous ECG or echo reports. Avoid a heavy meal in the two hours before your visit."
  - Endocrinology: "If a blood sugar test is likely, come fasting for 8 hours. Water is fine."
  - Fertility: "Please bring reports from any previous fertility investigations, for both partners."
  - Paediatrics: "Bring your child's immunisation card if you have it."
  - Orthopaedics: "Bring any existing X-rays or scan films."

### 12.4 Doctors (fees in paise; `followUpFee = round(fee × 0.6)`; `displayOrder` = index)
- Registration numbers are obviously fictional (the reference used `TCMC/${52000+i*137}`; use a `DEMO-` prefix). Emails are `<first.last>@meriva.example`.
- Bio: "Dr. {name} has {n} years of experience in {speciality, lowercased} and consults at {clinic.name}." For example, "…18 years of experience in cardiology and consults at Meriva Medical Centre."

| # | Name | Speciality | Qualifications | Yrs | Languages | Phone | Fee | Slot |
|---|---|---|---|---|---|---|---|---|
| 0 | Anil Kumar | Cardiology | MBBS, MD (General Medicine), DM (Cardiology) | 18 | en, ml, hi | +919400100001 | 90000 | 20 min |
| 1 | Meera Raghavan | Obstetrics & Gynaecology | MBBS, MS (Obstetrics & Gynaecology) | 14 | en, ml, ta | +919400100002 | 80000 | 20 |
| 2 | Sanjay Pillai | General Medicine | MBBS, MD (General Medicine) | 11 | en, ml | +919400100003 | 60000 | 15 |
| 3 | Fathima Rasheed | Paediatrics | MBBS, MD (Paediatrics) | 9 | en, ml, hi | +919400100004 | 65000 | 15 |
| 4 | Rajesh Menon | Orthopaedics | MBBS, MS (Orthopaedics) | 16 | en, ml | +919400100005 | 85000 | 20 |
| 5 | Divya Krishnan | Endocrinology | MBBS, MD (General Medicine), DM (Endocrinology) | 12 | en, ml, ta | +919400100006 | 95000 | 25 |
| 6 | Thomas Varghese | General Medicine | MBBS, MD (General Medicine) | 22 | en, ml | +919400100007 | 70000 | 20 |
| 7 | Priya Nambiar | Dermatology | MBBS, MD (Dermatology, Venereology & Leprosy) | 8 | en, ml, hi | +919400100008 | 75000 | 15 |
| 8 | Vikram Shetty | Fertility | MBBS, MS (Obstetrics & Gynaecology), Fellowship in Reproductive Medicine | 15 | en, kn, hi | +919400100009 | 120000 | 30 |
| 9 | Lakshmi Iyer | Cardiology | MBBS, MD (General Medicine), DNB (Cardiology) | 10 | en, ta, ml | +919400100010 | 88000 | 20 |

- Consider Tamil-first language lists for a Coimbatore clinic.
- **Schedules:**
  - Even-index doctors work Mon–Fri; odd-index doctors work Mon/Wed/Fri/Sat. Mornings are 09:00–13:00 at the primary location.
  - Doctors 0, 3, 6 and 9 also run 16:00–19:00 evenings on non-Saturdays, at the **primary** location. The reference put doctors 0 and 6 at an annexe outside its hours.
- **Leave:** doctor 4 (Rajesh Menon), full day, "Conference leave", on the next working weekday (Mon–Fri) at least 3 days ahead. **Fix:** the reference uses today + 3, which can fall on a weekend, when he has no slots anyway, so the exception is never exercised.

### 12.5 Staff

| Name | Role | Phone | Code | Designation |
|---|---|---|---|---|
| Reception Desk | RECEPTIONIST | +919400200001 | REC-001 | Front Office Executive |
| Sreeja Nair | NURSE | +919400200002 | NUR-001 | Staff Nurse |
| Arun Dev | LAB_TECH | +919400200003 | LAB-001 | Laboratory Technician (`{canVerifyResults:true}`) |
| Nisha Joseph | PHARMACIST | +919400200004 | PHA-001 | Pharmacist |
| Clinic Administrator | ADMIN | +919400200005 | ADM-001 | Clinic Manager |

### 12.6 Catalogue
- **Services:** CONS-NEW 70000 · CONS-FU 40000 · DRESS 30000 · ECG 45000 · USG-ABD 130000.
- **Medications:** 8 formulary entries, including Amlodipine 5 mg and Atorvastatin 10 mg.
- **Lab tests:**
  - CBC panel (HB, WBC, PLT, RBC)
  - HBA1C ("No fasting required.")
  - LIPID panel (CHOL, LDL, HDL, TG; "Fasting for 9–12 hours is required. Water is fine.")
  - TSH
  - FBS ("Fasting for 8 hours is required.")
- **Journey templates:** Pregnancy Care ("About 9 months", 6 steps) · Fertility Care ("3–6 months", 7 steps) · Diabetes Care ("Ongoing", 6 steps), with day offsets. Journeys "need real pathways from real clinicians", so mark the step text demo-only for a Meriva clinician to replace.

### 12.7 Demo family (login `9400000001`)

| Member | MRN | DOB | Notes |
|---|---|---|---|
| Arun Menon (SELF) | {prefix}01001 | 1986-04-12 | MALE, O+, address "12/A, Sea View Apartments" (city Coimbatore, state Tamil Nadu) |
| Divya Menon (SPOUSE) | {prefix}01002 | 1989-09-03 | dependent, no login |
| Ishaan Menon (CHILD) | {prefix}01003 | 2019-02-18 | minor, `isGuardian=true`, **`reviewDueAt` 2037-02-18 (Fix)** |
| Lakshmi Menon (PARENT) | {prefix}01004 | 1958-07-22 | dependent |

- Dependents get city Coimbatore, state Tamil Nadu (the reference used Kochi, Kerala).
- Seed grants for the adult dependents are ACTIVE (a demo shortcut; at runtime, adults are added as PENDING_CONFIRMATION).
- **Allergies:** Arun has Penicillin ("Rash and itching", MODERATE). Lakshmi has Sulfa drugs ("Swelling", SEVERE).
- **Insurance:** "Coastal General Insurance", policy `CGI-FAM-8841207`, holder Arun Menon, valid 2026-01-01 to 2026-12-31.
- **Other patients:** 26 more account holders, giving 30 patients and 27 patient logins in total. Phones `+919400110000`…`+919400110025` (`+9194001${String(10000 + i).slice(-5)}`).
  - **Names:** `firstNames[i % 28]` (Arjun, Kavya, Rahul, Anjali, Vishnu, Deepa, …) plus an LCG pick from the last-name pool.
  - **DOB:** year 1950–2004 via the LCG; month and day via the LCG.
  - **Gender:** LCG pick of MALE/FEMALE. **Blood group:** LCG pick of O_POS/A_POS/B_POS/AB_POS/O_NEG/UNKNOWN.
  - Each gets a User, a Patient and a SELF FULL ACTIVE grant.
  - **Address:** give each a varied fictional Coimbatore address (city Coimbatore, state Tamil Nadu, placeholder pincode). The reference reuses Arun's "12/A, Sea View Apartments" for all of them.
- **VIEW_ONLY grant:** seed one VIEW_ONLY ACTIVE grant so the VIEW_ONLY path is testable. Account holder `9400110000` holds VIEW_ONLY on Lakshmi Menon, relationship OTHER. The reference seeds only FULL grants.

### 12.8 Appointments
- About 31 in total: 1 hero, 9 on today's board, up to 18 in a random spread, plus Lakshmi +4d, Arun +9d and Arun's −14d past visit. Every one uses the primary location. `slotLock` is null for CANCELLED and NO_SHOW.
- **Hero:** Arun with Anil Kumar, tomorrow 10:20, CONFIRMED, "Chest discomfort while walking uphill".
- **Today's board:**
  - Anil Kumar 09:00 and 09:20 COMPLETED, 09:40 CHECKED_IN, 10:00 and 10:20 CONFIRMED
  - Divya with Meera Raghavan 11:00 CHECKED_IN, "Antenatal check-up"
  - Sanjay Pillai 09:15 COMPLETED and 09:30
  - Ishaan with Fathima Rasheed 10:00, "Not eating well for three days"
- **Random spread** across ±12 days. Past days get COMPLETED, with an occasional CANCELLED or NO_SHOW; future days get CONFIRMED. **Fix:** pick a real computed slot (a rule day plus the doctor's `slotDurationMins` grid) for each appointment. The reference picks minute 0/20/40 and hours 9–12 for any doctor on any day. That creates off-grid appointments for the 15-, 25- and 30-minute doctors (Sanjay, Fathima, Priya, Divya Krishnan, Vikram) and appointments on days the doctor does not work (weekends, and Tue/Thu for odd-index doctors), including CONFIRMED rows on today's board outside anyone's schedule.
- **Family:** Lakshmi with Divya Krishnan at +4d ("Diabetes review and repeat HbA1c"). Arun with Sanjay Pillai at +9d ("General health check"). **Fix:** put both on the doctor's slot grid; the reference used off-grid 09:40 and 11:20.

### 12.9 Arun's clinical history
- **Visit at −14d:** a SIGNED Cardiology consultation. `patientInstructions`: "Take the new tablet at night after food. Avoid heavy exertion until we review. If you get chest pain at rest, or pain lasting more than a few minutes, come to the clinic or call 108 straight away."
- **Diagnosis:** I10 "Essential hypertension", chronic.
- **Timeline:** CONSULTATION "Cardiology consultation" · PRESCRIPTION "Prescription — 2 medicines" · LAB_REPORT "Lipid Profile, Complete Blood Count", authorName "{clinic.name} Laboratory".
- **Vitals:** 148/92, pulse 84, SpO₂ 98, `temperatureC10` 367, 78400 g, 1721 mm.
- **Prescription `RX-2026-000418`:** Amlodipine 5 mg (1-0-0) and Atorvastatin 10 mg (0-0-1), DISPENSED.
- **Lab orders:**
  - `LAB-2026-001902`: CHOL 232 HIGH, LDL 158 HIGH, HDL 38 LOW, TG 186 HIGH; CBC all normal.
  - `LAB-2025-004471`: an older lipid profile, for "Previous" values.
  - `LAB-2026-002140`: HbA1c 5.9 % HIGH (range 4–5.6, "Above range"), `patientNotifiedAt` null.
- **Follow-up:** window −2d to +12d, "Review lipid profile and blood pressure".
- **Journeys:** Lakshmi has Diabetes Care with steps 0–1 COMPLETED and step 2 IN_PROGRESS. Arun has "Heart Health" with 4 steps.

### 12.10 In-flight work, money, content
- **Lab orders for the console:** `LAB-2026-003010`…`003013` in ORDERED, SAMPLE_COLLECTED (URGENT), IN_PROGRESS and RESULTS_UPLOADED.
- **Pending prescriptions:** `RX-2026-000502` and `RX-2026-000503`.
- **Invoices:** Arun owes **₹1,850** across three bills: `INV-2026-004410` ₹800 · `INV-2026-004411` ₹400 + ₹250 · `INV-2026-004412` ₹180 + ₹220.
- **Paid invoices:** `INV-2025-009120` ₹600 and Lakshmi's `INV-2026-004390` ₹950. Payments are UPI SUCCEEDED with receipt `RCP-<last 6>`.
- **Announcements:**
  - "Extended evening clinic hours" — "General Medicine and Paediatrics now run evening clinics until 7 PM on Mondays, Wednesdays and Fridays."
  - "Laboratory reports now in the app" — "Your lab reports appear under Records as soon as they are verified. You no longer need to collect a printout."
  - The reference's third announcement (free parking at its annexe) applies only if you keep a second site. Otherwise drop it.
- **Notifications for Arun:**
  - "Your report is ready" — "Your HbA1c report is now available under Records → Lab Reports."
  - "Appointment tomorrow" — "Dr. Anil Kumar, Cardiology — tomorrow at 10:20 AM at {primary location name}."
  - "Payment pending" — "You have ₹1,850 outstanding across three bills."

### 12.11 Demo logins (OTP shown on screen in development)

| Role | Type at /login | Who | Lands on |
|---|---|---|---|
| Patient | 9400000001 | Arun Menon (Divya, Ishaan, Lakshmi) | `/app` |
| Doctor | 9400100001 | Dr. Anil Kumar, Cardiology (others 9400100002–9400100010) | `/console` |
| Reception | 9400200001 | Reception Desk | `/ops` ("Front desk") |
| Nurse | 9400200002 | Sreeja Nair | `/console` |
| Lab | 9400200003 | Arun Dev | `/console` |
| Pharmacy | 9400200004 | Nisha Joseph | `/console` |
| Admin | 9400200005 | Clinic Administrator | `/ops` ("Administration") |
| Other patients | 9400110000–9400110025 | generated (9400110000 also holds VIEW_ONLY on Lakshmi) | `/app` |

---

## 13. Not in v1 / roadmap

**Phase 2: Clinical**
- Consultation composer, diagnoses, prescribing, and the patient viewer fed by real writes.
- Lab catalogue, orders, sample collection, results upload and verification (`canVerifyResults`, `twoPersonLabRelease`), and trends.
- A staff lab report viewer, which makes `lab.report.viewed` live.
- Imaging, which replaces the placeholder.
- Document upload, authorised download (`GET /api/documents/:id/download`, 30/min) and secure share links.
- Timeline API.
- Follow-up engine: doctors create follow-ups.
- **Break-glass**: typed reason, FULL access for 60 min on that patient only, HIGH audit, admin notification, review list.
- Amendment workflow (24h, linked revision).
- Clinical write APIs: `/api/consultations`, `/api/prescriptions`, `/api/lab-orders` (`collect | upload | verify`), `/api/imaging`, `/api/follow-ups`.
- Doctor scope via care team or referral.
- Local draft persistence for the composer.
- Branch selection in booking, if Meriva launches multi-site.
- Exit: a consultation produces a prescription and a lab order; the lab uploads and verifies; both appear in the timeline "with correct reference ranges and non-diagnostic language".

**Phase 3: Operations**
- Live queue (`QueueEntry`, `GET /api/queue`, `/api/queue/position`, "you are 3rd, ~25 minutes"), walk-ins, nurse vitals.
- Reception console: staff booking, cancel and reschedule UI; overbooking with an audited reason; register patient; edit demographics; link family with consent; duplicate merge.
- Invoicing, payment recording, refunds; a real UPI provider with a signature-verified webhook; `Idempotency-Key`.
- Push, SMS and email delivery; notification preferences UI; quiet hours; reminder schedulers.
- Pharmacy dispensing. Device list and "sign out on all devices". Shift model (nurse scope). Doctors edit hours and leave.
- Ops Queue, Billing, Lab, Pharmacy and Manage sections. Doctor Inbox (reports to sign, follow-ups due, clarifications).

**Phase 4: Advanced**
- Care-journey templates and instantiation.
- **AI assistant** (named for the clinic, not "Clinic360"). Pipeline: question → session auth → patient scope → typed retrievers from a fixed allow-list → redaction → prompt → model → safety post-check → answer + citations. With no retrieval results the answer is "I don't have enough information to answer that". Symptom questions get routing, never diagnosis.
- Analytics, admin overview and analytics APIs.
- Localisation (ml, ta, hi, kn, te) and a language switcher.
- Granular consent, device management, medication reminders and adherence, advanced permissions.
- 18th-birthday `PENDING_REVIEW` job, grant revocation (`DELETE /api/family/:grantId`), VIEW_ONLY grant creation, patient data export.

**Unphased / designed elsewhere**
- Adult family-grant OTP confirmation (`GRANT_CONFIRM`) and phone change (`PHONE_CHANGE`).
- Secure messaging threads.
- Video teleconsult (`VIDEO` is accepted by the API, but there is no provider or `joinUrl`) and a consultation-type picker.
- ABDM/ABHA linkage. Dark mode. Registration consent capture. Re-authentication for sensitive actions.
- Retention jobs (OTP purge after 24h, session cleanup). Redis limiter.
- Notifications API (`GET /api/notifications`, `PATCH /api/notifications/:id`).
- Patient sub-resource APIs; `GET /api/specialities`, `/api/doctors`, `/api/doctors/:id`, `/api/appointments/:id`.
- Admin audit API with filters (`?patientId=&actorId=&action=`), cursor pagination and export.
- Admin management of doctors, departments, services, pricing, branding, staff and permissions.
- Components StatCard, Tabs, Toast, SegmentedControl and a shared Timeline.
- Not an EMR or HIS: no IPD, OT, wards or inventory. No insurance adjudication. No DICOM viewer.

**Open product questions (answer before the relevant phase)**
1. Walk-ins in the queue (Phase 3).
2. Doctor running late or session cancelled (`DOCTOR_DELAYED` flow).
3. Refund and cancellation policy.
4. Prescription regulatory format: registration no., signature, schedule-H, digital signature.
5. Single or two-person lab verification.
6. Duplicate patient merge design.
7. Offline: composer drafts only.
8. DPDP data export flow.
9. Staff handover and shift model.
10. Patient death: retention, reminders, family access.
11. Multi-location booking.
12. Notification quiet hours: "A 6 AM medication reminder is a feature; a 2 AM one is a complaint."

---

## 14. Acceptance criteria / definition of done

**Build & quality**
- [ ] `npm run typecheck`, `npm run lint` (ESLint via `eslint.config.mjs`, with `eslint` and `eslint-config-next` installed) and `npm run build` are clean. `npm run db:reset && npm run db:seed` is deterministic, and a second `npm run db:seed` on a seeded database succeeds.
- [ ] `npm test` exists and passes. It includes a **concurrency test**: N parallel `POST /api/appointments` from N different patient sessions for the same doctor and `startAt` give exactly one 200 and N−1 `409` with code `SLOT_TAKEN`. Different patients are required: with one patient, a request that runs after the first commit gets CONFLICT "This patient already has an appointment at that time." instead, and the test is flaky.
- [ ] No page or route imports `db`. Grep `src/app` for `server/db`: zero matches. `src/server/db.ts` imports `'server-only'`.
- [ ] `grep -rn "INTEGRATION POINT" src/` lists SMS, email, push, storage and payments (plus the header comment, unless it is reworded).
- [ ] Production boot with `SMS_PROVIDER` unset fails with the exact refusal message.

**Phase 1 exit**
- [ ] A seeded patient books a computed slot for today, sees it on Home, and reschedules it to another slot today.
- [ ] Reception sees it on the day board and checks the patient in. The doctor sees it on "Today".
- [ ] Separately, a second booking is cancelled.
- [ ] Each of those actions writes its audit row, with `ipAddress` and `userAgent`.

**White-label (Meriva)**
- [ ] Rendered HTML and SMS text contain no "Clinic 360", "Clinic360", "360" tile, "C360-", "Meridian", "Kochi", "Panampilly", "Kakkanad" or `#0E7C6B`.
- [ ] The tab title is "Meriva Medical Centre". Onboarding reads "Welcome to Meriva Medical Centre". The login tile shows the Meriva mark.
- [ ] Changing `brandPrimary` and the theme keys in the DB re-skins `/login`, `/onboarding`, `/app`, `/console`, `/ops` and the unlinked screen **without a rebuild**.
- [ ] The opacity classes (`bg-bg/90`, `bg-surface/95`, `border-brand/15`) produce CSS. The header and nav have visible backgrounds.
- [ ] Every brand token pair meets ≥4.5:1 (verified with tooling). Text on accent fills uses ink. The brand values used have been approved by the clinic.

**Auth**
- [ ] OTP: 6 digits, 5-minute expiry (410 afterwards), 5 wrong codes burn the challenge with the exact copy, the 4th request per phone within 10 min is rate-limited.
- [ ] In production, responses for unknown and known numbers have the same HTTP status, the same keys (`{challengeId, maskedPhone, expiresInSeconds}`), no `devCode`, and comparable latency. An SMS delivery failure does not change the response. In development the dev box appears for known numbers.
- [ ] The cookie is httpOnly, SameSite=Lax and Secure in production. Logout revokes the session row.
- [ ] A request with no `x-forwarded-for` is still rate-limited per IP (`ip:unknown`).

**Authorisation & privacy**
- [ ] A patient requesting a non-family patient's appointment or report gets 404, not 403.
- [ ] Booking for a VIEW_ONLY member gives 403 "You have view-only access to this family member." (seeded: `9400110000` holds VIEW_ONLY on Lakshmi). Her appointment detail page shows no Reschedule or Cancel for that holder.
- [ ] Nurse, lab and pharmacy PATCH cancel/reschedule gives 403. A doctor cannot cancel another doctor's appointment. A doctor's cancel records `cancelledBy: DOCTOR`.
- [ ] The ops patient-view payload has no `notableHistory`, and `allergies` is empty or absent.
- [ ] The reception overview response contains no revenue fields.
- [ ] Lab and pharmacy chart responses contain only their projection.
- [ ] A tampered `Session.activePatientId` falls back to SELF.
- [ ] Scope denials and role denials are audited at HIGH. `patient.searched` rows contain no query text.

**Booking & availability**
- [ ] Availability equals rules + exceptions − booked, in the clinic timezone. Past and beyond-horizon slots are present but `available:false`.
- [ ] Doctor 4's leave is seeded on the next working weekday at least 3 days ahead. That day returns `slots: []`, while the same weekday a week later has slots.
- [ ] Posting an off-grid or out-of-horizon `startAt` is rejected. A past `startAt` gets the exact copy. A same-patient clash gets CONFLICT copy.
- [ ] SLOT_TAKEN returns the client to the slot step, and the exact copy is visible there in a `role="alert"` banner above the slot grid.
- [ ] "Choose another speciality" on an empty doctor step returns to step 1.
- [ ] Reschedule leaves the old row CANCELLED ("Rescheduled", lock null) and a new row with `rescheduledFromId`, atomically. The new row carries the `followUpId` and the new slot's location.
- [ ] Cancelling a NO_SHOW, CHECKED_IN or IN_CONSULTATION appointment is rejected with the §7.3 copy.
- [ ] Checking in an appointment that is not today returns "Only today's appointments can be checked in."
- [ ] A follow-up booking pre-fills the doctor, reason and patient, shows the banner and marks the follow-up SCHEDULED. A foreign `followUpId` is rejected by the server and ignored by the booking page.

**Records & safety**
- [ ] A non-VERIFIED report is 404 for patients. Flags render as words. The banner appears for any non-NORMAL flag. "Previous {value} on {date}" is shown. The patient's name is on the page.
- [ ] Opening a new report clears the Home "New lab report" card.
- [ ] No patient screen uses colour alone for status. Every badge has an icon and a word.

**Family, emergency, notifications**
- [ ] Switching shows the band on every screen. The band cannot be dismissed. Switcher buttons are disabled from the start of the request.
- [ ] Adding a minor creates an ACTIVE grant with `reviewDueAt` on the 18th birthday. Adding an adult creates PENDING_CONFIRMATION, and the adult is not listed.
- [ ] A future date of birth on the add-family form shows "Date of birth cannot be in the future." inline under the date field.
- [ ] SOS is one tap from every `/app` screen. The first action is `tel:108`. "Share my location" works or shows the exact fallback copy.
- [ ] A reception booking notifies the patient's account holder(s), not the receptionist.
- [ ] Viewing notifications lowers the bell count.
- [ ] SMS text is "{title} — Meriva Medical Centre"; the push body equals the title; neither contains clinical content.

**States & accessibility**
- [ ] Every route under `/app`, `/console` and `/ops` has a loading skeleton, an empty state and an error state. Errors offer "Try again" and "Contact clinic".
- [ ] Keyboard-only: skip link, sheets trap and restore focus, Escape closes, onboarding dots use arrow keys. Sheets are labelled via `aria-labelledby`.
- [ ] Patient touch targets are ≥44px (bell, SOS, sheet close, back links). Primary actions are 52px. No text is below 11px.
- [ ] `prefers-reduced-motion` stops animation. Pinch-zoom works. Security headers and `/api` no-store are present.

---

## 15. Known gaps to fix (reference-implementation defects; do not copy them)

### A. White-label & theming (Meriva launch blockers)
1. **Per-clinic theming gap (confirmed by the design notes).**
   - The reference injects only `--brand` and `--accent`, and only inside PatientShell.
   - `--brand-hover`, `--brand-ink`, `--brand-wash` and `--accent-wash` stayed at their teal defaults. The Meriva capture script overrode `--brand-ink`, `--brand-wash` and `--brand-hover` by hand. `--accent-wash` was left at the default `#FBF0E8`.
   - Login, onboarding, `/`, the unlinked screen and both staff consoles got no clinic colours at all.
   - → Store or derive all six tokens and inject them at the root (§3.4).
2. **Opacity modifiers on `var()` colours compile to nothing** under Tailwind 3. This leaves the header and nav transparent, drops tinted borders, and makes the disabled primary look enabled. → Use RGB-channel tokens with `<alpha-value>`.
3. **Hard-coded product name:**
   - `<title>` "Clinic 360"
   - "Welcome to Clinic 360"
   - the "360" login tile
   - `common.appName`
   - the docs' "Ask Clinic360"
   - → Use `clinic.name` and `Clinic.logoUrl`.
4. **MRN prefix `C360-`** is hard-coded in MRN generation, the seed and both search placeholders. → Use `Clinic.settings.mrnPrefix`; the Meriva value must be confirmed by the clinic.
5. `Clinic.tagline`, `logoUrl`, `supportEmail`, `websiteUrl` and `Location.openingHours` are never read. Use at least `logoUrl` (login) and `name` (title, onboarding).
6. Seed and data strings hard-code the brand: doctor bios, "Meridian Laboratory", Kochi locations and patient addresses, the annexe announcement, the "Panampilly Nagar" notification, `@meridianhealth.example` emails, Kerala registration numbers. → Interpolate or re-brand (§12).
7. **Meriva orange contrast (proposed values):** white on `#F07F1A` ≈ 2.7:1 and `#F07F1A` on `#FEF1E3` ≈ 2.4:1. → Use ink text on accent fills and badges.

### B. Authorisation & privacy
8. `PATCH /api/appointments/:id` has no role gate and bypasses `withApi`, so there is no write limit, no denial audit and no `x-request-id`. Nurse, lab and pharmacy can cancel or reschedule in scope. A doctor with any past appointment can cancel another doctor's booking. → §4.6.
9. **The RESTRICTED projection is not enforced on data.** The console chart renders the full timeline, medicines, conditions and vitals for any in-scope role, adding only a "Limited view" badge. → §4.5. (OPERATIONAL is already enforced.)
10. LAB_TECH and PHARMACIST can open `/console/patients` by URL and search the whole clinic, including phone numbers. → Restrict the search roles and the route. Decide whether clinical roles see phone numbers.
11. Scope denials inside `assertCanAccessPatient`, and denials on routes outside `withApi`, are not audited. → Audit them at HIGH.
12. `followUpId` ownership is not checked. The FollowUp update runs outside the transaction. A duplicate `followUpId` P2002 is mis-reported as SLOT_TAKEN.
13. The availability route never checks that the doctor is in the actor's clinic, and any role may call it.
14. Ops revenue is computed for reception and hidden only in the UI. → Compute it for ADMIN only.
15. Lab scope counts VERIFIED orders, which is broader than the documented "open order". Decide with the lab.
16. Nurse scope uses server-local midnight and any doctor. → Use the clinic timezone. The assigned-doctor rule waits for the shift model.
17. **Adult family grants cannot be confirmed.** There is no `GRANT_CONFIRM` flow and no SMS, so grants stay PENDING_CONFIRMATION forever and the member vanishes from the family list. Yet the UI says "We've asked them to confirm." and labels the phone "Required", which neither client nor server enforces. → Either build confirmation (Not in v1) or change this copy and enforce the phone rule. Do not ship a claim the system doesn't keep (TD-5: "never fake internals").
18. Cross-surface access redirects, while the docs say 403. Pick one.
19. The appointment detail page does not know the grant level, so it shows Reschedule and Cancel to VIEW_ONLY holders, and the server then returns 403. → §6.8.
20. The per-IP OTP limits are skipped entirely when `x-forwarded-for` is absent. → Use `ip:unknown` (§9.4).
21. Only the auth flows record `ipAddress` and `userAgent` on audit rows. → Pass them on every row (§11).

### C. Correctness
22. Book, cancel and reschedule notify the **acting user**. A reception action notifies the receptionist, not the patient. → Notify the patient's grant holders.
23. Booking accepts any future instant. → Validate against computed slots, working days and the horizon.
24. `markNotificationRead` has no caller, so the bell badge never decreases.
25. `patientNotifiedAt` is never set, so the "New lab report" card never clears.
26. Timezone has three sources: the `Clinic.timezone` column (unused), `CLINIC_TIMEZONE`, and hard-coded `'Asia/Kolkata'` in client components and notification bodies. Ops revenue uses UTC day bounds. → One helper and one source (§3.5).
27. The lab worklist sorts priority as a string. → Rank STAT > URGENT > ROUTINE.
28. Booking takes `locationId` from the doctor's first schedule rule, not from the slot's rule. `maxAppointments` and rule `consultationType` are selected but unused, and `openingHours` is ignored. The seed gives evening clinics at an annexe outside its hours.
29. Check-in does not reject COMPLETED, NO_SHOW or IN_CONSULTATION on the server, and it has no date check: CheckInButton renders on any day's rows, so reception can check in a patient for next week. → §7.3, §6.22.
30. The FamilySwitcher ignores fetch errors, and it disables its buttons only during the refresh transition, not during the POST.
31. The Confirm step always shows `consultationFee`; the detail page uses `followUpFee` for follow-ups.
32. The nurse dashboard lists all non-cancelled appointments while its empty copy says "Checked-in patients".
33. `withApi` sends no `Retry-After` on 429. Every P2002 maps to SLOT_TAKEN.
34. Six server components import `db` directly.
35. The SMS production guard throws lazily on the first send, not at boot. An OTP request for a known number then returns 500, while unknown numbers succeed.
36. There are no tests, although the README claims a concurrency test.
37. Schema and docs drift:
    - `TIMESTAMP(3)` vs the documented `timestamptz`
    - the docs list `Service` as soft-deletable, but it has no `deletedAt`
    - `InsurancePolicy.documentId` and `Prescription.supersededById` are plain strings with no relation
38. **SLOT_TAKEN message is never seen.** The booking flow sets the error and returns to step 3, but renders the message only on the Confirm step. → Render it as a `role="alert"` banner above the slot grid (§6.6).
39. **"Choose another speciality" is a no-op.** It links to `/app/book`, the URL the flow is already on, so client state stays on the doctor step. → Make it a button that resets the step (§6.6).
40. **Cancel and reschedule state handling.** Cancel accepts NO_SHOW, CHECKED_IN, IN_CONSULTATION and past appointments. Every non-patient cancellation is recorded as `cancelledBy: CLINIC`, so DOCTOR is never used. Reschedule drops `followUpId` and copies the old row's `locationId`. → §7.3.
41. **Booking loader edge cases.** `?doctorId=` without a speciality leaves the speciality null, so Back shows "No doctors available". An unknown or inactive `doctorId` leaves the flow on a blank slot step. A foreign or non-PENDING `followUpId` is silently ignored with no defined behaviour. → §6.6.
42. **Add-family date errors render in the wrong place.** "Date of birth cannot be in the future." and "Please check the date of birth." are thrown without `details`, so they appear in the ErrorState rather than inline. → Return `details.dateOfBirth` (§6.18).
43. **Tooling drift.** `lint` is `next lint`, but there is no ESLint config and no `eslint` or `eslint-config-next` dependency. `date-fns` is declared but never imported. `src/server/db.ts` lacks the `server-only` guard. → §3.1.
44. **Seed defects:**
    - Ishaan lacks `reviewDueAt`.
    - Lakshmi's and Arun's family appointments sit off the slot grid.
    - The random spread uses minute 0/20/40 on any day, which creates off-grid and off-schedule appointments for the 15-, 25- and 30-minute doctors and on non-working days.
    - All generated account holders reuse Arun's address.
    - There is no VIEW_ONLY grant, so that path cannot be tested on seed data.
    - Doctor 4's leave at today + 3 can fall on a weekend, which does not exercise the exception.
    - → §12.

### D. Design system & accessibility
45. No root `error.tsx`/`not-found.tsx`. No boundaries under `/ops` or `/console`. Several `/app` routes inherit the Home-shaped skeleton. ErrorState boundaries never pass `clinicPhone`, so "Contact clinic" never appears.
46. StaffShell has no Sign out below lg.
47. Touch targets below 44px: bell and SOS (40px), the sheet close, back links and the booking back button (36px), ErrorState "Contact clinic" (36px), onboarding dots (8px).
48. Text below the rule: 10px in the unread badge, slot "free" counts and dose labels; 11px in nav and step labels. The docs say patient body text is never below 16px. → Body copy ≥16px; nothing below 11px; test the nav at 390px.
49. Contrast failures (teal set): `ink-subtle` on bg ≈2.9:1 (used for inactive nav labels), caution on caution-wash ≈3.4:1, positive on positive-wash ≈4.4:1, accent on accent-wash ≈3.3:1 (the Badge accent tone uses `text-accent`; ≈2.4:1 with the proposed Meriva values), white on accent ≈3.7:1. → Darken the tone text tokens until each pair reaches ≥4.5:1, use ink on accent, and verify with tooling.
50. A loading Button loses its accessible name and shrinks. `aria-describedby` dangles. Textarea and Select lack invalid and describedby states. `required` lacks `aria-required`. Buttons use `text-white` instead of `text-ink-inverse`.
51. Four of the five Home sections (`health-today`, `quick-actions`, `care-journey`, `updates`) reference `aria-labelledby` ids that do not exist, because SectionHeader renders its h2 without an id. `next-appt` points at the doctor-name h3 and is missing in the empty state. The notification dot puts `aria-label` on a span. Skeletons lack `aria-busy` and "Loading" text.
52. The shimmer keyframes never compile, and the sweep is hard-coded white.
53. The Sheet's effect depends on an inline `onClose`, so a parent re-render re-runs it and focus jumps. The Sheet is labelled by a duplicated `aria-label` rather than `aria-labelledby` on its h2.
54. The Badge icon is optional although the rule is "always icon + text". The onboarding dots are `role="tab"` without roving tabindex.
55. Lab critical flags get no stronger treatment than high or low, and the documented chevron glyph is absent. Decide with the clinic, keeping the non-alarming tone.
56. Lab report detail shows no patient name in the body. Neither do Prescriptions, the Lab reports list or the Cancel sheet. → §10.11.
57. Profile "Signed in as" and the "Mobile" row show raw E.164. The Home payment line bypasses `formatMoney`.
58. The i18n catalogue is unused, and its strings have drifted from the rendered copy.

### E. Decisions to record (not defects)
- Onboarding is shown on every signed-out visit, and there is no completion record.
- Reschedule commits on a single tap with no review step.
- The nurse's RESTRICTED content.
- The cross-surface 403 vs redirect choice (#18).
- Whether clinical roles see patient phone numbers in search.
- **`reasonForVisit` under OPERATIONAL:** v1 default treats it as operational, so reception sees the Reason column. Alternatively, strip it from OPERATIONAL responses and drop the column (§4.5).
- **Cancelled and no-show rows on day lists:** the ops day board, `/ops/appointments` and the doctor's Today list include CANCELLED and NO_SHOW rows with their StatusBadge. "Appointments today" and the doctor's "Today" stat count every row, including cancelled. The ops overview also shows "Cancelled / missed" separately.
