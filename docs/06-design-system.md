# Clinic 360 — Design System

## 1. Identity

The brief rejects "generic hospital blue" and asks for premium, medical, calm, modern.
The identity is built on three deliberate choices:

**Deep teal, not blue.** `#0E7C6B`. Blue is the default of every hospital template and
every insurance portal. Teal reads as clinical and clean without the institutional
association, and it is distinguishable from the blue of system UI, links and iOS chrome —
which matters because our primary colour must not be confused with "tappable by default".

**Warm neutrals, not grey.** Surfaces sit on a bone-white with a faint warm cast
(`#FAF9F7`) rather than pure white or cool grey. Cool grey reads as "software". Warm
neutral reads as paper, and paper is what a medical record has always been. This single
choice does more for the "premium, human" feel than any amount of shadow work.

**One accent, used sparingly.** Terracotta `#C2703D` for the rare moment that must be
noticed — an overdue payment, an abnormal flag. Because it appears infrequently, it is
believed when it does.

Colour is configurable per clinic (§42): `Clinic.brandPrimary` / `brandAccent` are
injected as CSS custom properties at runtime, so the whole system re-skins from the
database without a rebuild.

## 2. Tokens

### Colour — semantic, never literal

Components reference `--surface`, `--ink`, `--brand`; never `teal-600`. This is what makes
dark mode and per-clinic theming a token swap rather than a refactor.

| Token | Light | Meaning |
|---|---|---|
| `--bg` | `#FAF9F7` | app background (warm bone) |
| `--surface` | `#FFFFFF` | cards, sheets |
| `--surface-sunken` | `#F2F0EC` | inset areas, skeletons |
| `--border` | `#E7E3DC` | hairlines |
| `--ink` | `#16211F` | primary text |
| `--ink-muted` | `#5C6B68` | secondary text (4.6:1 on bg) |
| `--ink-subtle` | `#8A9793` | tertiary — never for essential text |
| `--brand` | `#0E7C6B` | primary actions, active nav |
| `--brand-ink` | `#0A5F52` | text on tinted brand surfaces |
| `--brand-wash` | `#E8F3F0` | selected/tinted backgrounds |
| `--accent` | `#C2703D` | attention, rare |
| `--positive` | `#2F7D5B` | normal results, paid, completed |
| `--caution` | `#B07A16` | pending, awaiting action |
| `--critical` | `#B3261E` | abnormal, overdue, destructive |
| `--emergency` | `#C0271F` | the emergency affordance only |

Every status colour is paired with an icon and a text label. **Status is never
communicated by colour alone** (§24) — an abnormal lab value carries a chevron glyph, the
word "High", and the colour, so it survives both colour-blindness and greyscale printing.

### Type

`Inter` for UI, with `ui-sans-serif` fallbacks; tabular numerals (`font-variant-numeric:
tabular-nums`) on every number in a clinical or financial context so digits align in
columns and don't jitter when a countdown updates.

| Role | Size / line-height | Weight |
|---|---|---|
| Display | 32 / 38 | 600 |
| Title | 24 / 30 | 600 |
| Heading | 19 / 26 | 600 |
| Subheading | 16 / 22 | 600 |
| Body | 16 / 24 | 400 |
| Body-sm | 14 / 20 | 400 |
| Caption | 13 / 18 | 500 |
| Overline | 11 / 14 | 600, +0.08em, uppercase |

**Patient body text is never below 16px.** The brief calls out older patients (§24), and
14px is where reading glasses start to matter. Staff consoles may use 14px in dense tables
because staff are at a desk, looking at a large screen, all day — a different context with
a different correct answer.

### Space

4px base: `1=4 2=8 3=12 4=16 5=20 6=24 8=32 10=40 12=48 16=64`.
Screen gutter is 20px on mobile, 32px on desktop. Cards use 20px internal padding;
sections are separated by 24px. Generosity is the point — a crowded medical UI reads as
untrustworthy.

### Radius & elevation

`sm 8 · md 12 · lg 16 · xl 20 · full 9999`. Cards are `lg`.

Three elevations only:
- `raised` — `0 1px 2px rgba(22,33,31,.05), 0 1px 3px rgba(22,33,31,.04)` (cards)
- `overlay` — `0 8px 24px rgba(22,33,31,.10)` (sheets, popovers)
- `sticky` — `0 -1px 0 var(--border)` (bottom nav; a hairline, not a shadow)

Shadows are almost imperceptible. Depth comes from the surface/background contrast, not
from drop shadows. This is the difference between "premium" and "2014 material design".

### Motion

`fast 120ms · base 180ms · slow 260ms`, `cubic-bezier(.2,.7,.3,1)`.
Motion exists to explain a change in state — a sheet's origin, a queue position
advancing — never for decoration. Everything respects `prefers-reduced-motion`.

## 3. Components

Built first-party (docs/02 TD-6). The set is deliberately small; a large component library
is how design systems become inconsistent.

| Component | Notes |
|---|---|
| `Button` | variants `primary · secondary · ghost · danger · emergency`; sizes `sm(36) · md(44) · lg(52)`; `loading` renders a spinner and sets `aria-busy` while keeping width stable so layout doesn't jump |
| `Card` | the workhorse; optional `interactive` for tappable cards, which then render as a real `<a>`/`<button>` |
| `StatCard` | label + value + delta, tabular numerals |
| `Input` / `Select` / `Textarea` | label always visible (placeholders are not labels), `aria-describedby` wired to hint and error, error text never colour-only |
| `OtpInput` | 6 boxes, one hidden input, paste-aware, `inputmode="numeric"`, `autocomplete="one-time-code"` |
| `Badge` | tones mapped to semantic tokens; always icon + text |
| `Tabs` | roving tabindex, arrow-key navigation, `aria-selected` |
| `Sheet` | mobile bottom sheet / desktop dialog; focus trap, `Esc`, scroll lock, restores focus on close |
| `Toast` | `role="status"` polite; `role="alert"` for errors |
| `Skeleton` | matches the final layout's dimensions so nothing reflows on load |
| `EmptyState` | icon + headline + one sentence + one primary action (§31) |
| `ErrorState` | plain-language message + "Try again" + "Contact clinic" (§32) |
| `Avatar` | initials fallback, deterministic tint from the name |
| `Timeline` | the clinical spine renderer, shared by patient and doctor at two densities |
| `SegmentedControl` | 2–4 options, larger touch targets than tabs |
| `FamilySwitcher` | persistent, prominent — see §5 below |
| `BottomNav` | 5 items max, 56px, safe-area inset aware |

## 4. States — every screen, all four

Non-negotiable per the brief. Enforced by convention: each patient route exports
`loading.tsx`, renders an `<EmptyState>` for the zero case, and is wrapped by an
`error.tsx` boundary.

- **Loading** — skeletons shaped like the real content, never a centred spinner on a full
  page. A spinner says "something is happening"; a skeleton says "your appointment card is
  arriving", which is a materially calmer experience.
- **Empty** — never a blank screen. "Nothing scheduled yet. Book your next consultation."
- **Error** — "We couldn't load your appointments." + Try again + Contact clinic. No
  status codes, no stack traces, no "Error: fetch failed".
- **Success** — confirmation is explicit and specific: not "Success" but "Appointment
  confirmed — Dr. Anil Kumar, Tue 26 Aug, 10:20 AM".

## 5. Patient-selection safety

§11's hard requirement: a family account must never let a user believe they are looking at
one person's records while seeing another's.

- The active patient's name and avatar are in the header of **every** patient screen, not
  only on Home.
- Switching patients is an explicit, obvious action that visibly reloads the view.
- When the active patient is not the account holder, the header carries a persistent
  tinted band: "Viewing **Lakshmi Nair**'s records (Mother)". Tinted, always visible, not
  dismissible.
- Any screen showing clinical detail repeats the patient's name in the content, not only
  in the chrome — so a screenshot, or a glance at a scrolled page, is never ambiguous.
- Sensitive actions (booking, paying, sharing a document) name the patient in the
  confirmation copy.

## 6. Accessibility commitments (§24)

- Minimum 4.5:1 for body text and 3:1 for large text and meaningful graphics, verified per
  token pair, not assumed.
- Touch targets ≥ 44×44 CSS px on patient surfaces; primary actions are 52px.
- Visible focus ring on every interactive element: 2px `--brand` + 2px offset. Never
  `outline: none` without a replacement.
- Full keyboard operability on web consoles, including sheets and menus.
- Semantic HTML first — real `<button>`, `<nav>`, `<main>`, `<table>`. ARIA only where the
  platform has no equivalent.
- Live regions for anything that updates without user action (queue position, toasts).
- Language is plain. "Your report is ready" beats "Investigation results have been
  released". Reading level matters more than terminology precision on patient surfaces.

## 7. Clinical-safety copy rules

These are design rules with clinical consequences and are not negotiable in review:

- Never state or imply a diagnosis from data. An out-of-range lab value reads: *"This
  result is outside the displayed reference range. Please discuss it with your healthcare
  professional."* (§8)
- Never render adherence statistics judgementally. "12 of 14 doses logged" — not "86%
  adherence" and never a red warning face (§10).
- Never place an interstitial between a patient and emergency care. The emergency sheet
  offers phone numbers and directions, with no chatbot and no triage questionnaire (§15).
- The AI assistant is labelled as an assistant everywhere it appears, and answers about
  clinical meaning route to a human (§14).
