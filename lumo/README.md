# Lumo

**For the days that are heavy.** A depression relief and daily-lift app, built
as an offline-first web app (installable PWA).

Lumo is the depression counterpart to a panic-attack app, and deliberately not a
reskin of one. Anxiety tools calm an over-activated system; depression tools
have to activate an under-activated one. So the core loop here is **behavioural
activation** — one small action, sized to the day — and breathing is a
supporting tool, never the headline.

Everything runs on the device. No account, no server, no analytics, no network
call at any point in normal use.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # typecheck + production build into dist/
npm run preview    # serve the build on http://localhost:4177
npm run typecheck
```

`dist/` is a static folder — any static host works, and the app is built with a
relative base so it also works from a subfolder.

### Acceptance checks

The checklist from the product brief is automated against a real browser:

```bash
npm run preview                 # in one terminal
npm run acceptance              # in another
```

It verifies, among other things: the Liftr is one tap from a cold start, the
Anchr is within two taps of every screen, a check-in takes exactly four taps
with no typing, every free feature works with the network switched off, no
pricing appears after a low-mood check-in, no screen overflows at XXL text, and
the India crisis numbers dial correctly.

If Playwright has no browser installed locally, point it at one:

```bash
CHROME_PATH=/path/to/chrome npm run acceptance
```

---

## What is in it

### Free, and genuinely useful alone

- **The Liftr** — the big amber button. Two paths:
  - *Help me move*: one question (energy, five dots), then **one** offered
    action from a 126-entry library — never a list. `Give me another` reshuffles
    within the tier; `Too much right now` drops a whole difficulty tier and can
    always drop again, down to a floor of things that can be done in bed. The
    timer screen has a `Done` button from the first second, and stopping early
    still counts and still logs.
  - *Just sit with me*: no tasks, no questions, no upsell. Mo gets bigger, the
    screen dims, generated ambience plays, and grounding cards advance
    themselves every 12 seconds so there is nothing to tap. An
    "I'm not safe right now" link is always visible.
- **The Reflectr** — a check-in that takes four taps and no typing (mood,
  energy, sleep, save), optional context chips and an optional note, plus full
  searchable history, entry detail, and CSV export.
- **The Reframr** — a CBT thought record cut down to four steps, with
  voice-to-text where the browser supports it, eight plain-English distortions,
  the friend question that actually unlocks self-compassion, and ten template
  starters for the kinder version.
- **The Groundr** — body scan (5/10/20 min), behavioural-activation-friendly
  visualisations, three breathing patterns with a visual orb, and soundscapes.
  The hub says out loud that breathing helps agitation and rumination and is not
  the main treatment for low mood.
- **The Anchr** — safety plan, emergency contact, region-aware crisis lines. One
  tap from everywhere. Never paywalled. See [SAFETY.md](./SAFETY.md).
- **Progress** — cumulative counts only, a 90-day mood/energy chart, gentle
  correlations. No streaks, no XP, no badges, nothing that can be broken.
- **Understanding** — five free lessons: what depression does to motivation, why
  "wait until you feel like it" fails, rest versus avoidance, anhedonia, and
  what actually helps ranked honestly.

### Full Access (demo unlock in this build)

Two written courses — *Getting moving* (12 lessons) and *Staying well* (18
lessons) — the extended soundscape and visualisation library, full data export,
and a one-page clinician summary. Monthly, yearly with a trial, and a one-time
lifetime purchase.

No payment is taken in this build: unlocking is local and reversible from
Settings. Wiring it to real billing means replacing `unlock()`/`relock()` in
`src/store/useStore.ts` with a RevenueCat (or Stripe) entitlement check — the
rest of the app only ever reads `entitlement.fullAccess`.

**Never paywalled, ever:** the Liftr, the Anchr, check-ins, reframes, breathing,
the body scan, and every crisis feature.

---

## Editing the content layer

No component contains user-facing prose. Everything a writer might want to
change lives in `src/content/`, typed, and can be edited without touching a
component.

| File | What is in it |
|---|---|
| `actions.ts` | 126 behavioural-activation actions across 5 tiers, tagged by category and time cost |
| `copy.ts` | Every string that is not a lesson, an action or a grounding card |
| `crisis.ts` | Crisis lines by region, with separate display and dial values |
| `distortions.ts` | The eight cognitive distortions, in plain English |
| `grounding.ts` | 46 grounding cards for the comfort session |
| `bodyscan.ts` | The body scan script |
| `visualisations.ts` | Four guided visualisations |
| `soundscapes.ts` | Soundscape definitions |
| `notifications.ts` | 20 rotating invitation notifications |
| `reframeStarters.ts` | Template starters for the kinder version |
| `lessons.free.ts` · `lessons.short.ts` · `lessons.long.ts` | 35 lessons, full text |

**Adding an action:** append a row to `rows` in `actions.ts`:

```ts
['slug-id', 'One imperative sentence.', 2 /* tier */, 'home', 5 /* minutes */],
```

Keep the `id` stable once it has shipped — past lifts are logged against it.
Tier 1 must be doable in bed on the worst possible day; tier 5 is a good day.

**Adding a lesson:** add a `Lesson` to the relevant course file. Blocks are
`p`, `h`, `pull`, `list` and `try`. Add its id to a course in
`src/content/index.ts` if you are creating a new course.

**Design tokens** are in `src/styles/tokens.css` — palette, type scale, radii,
motion, touch target. Nothing is hard-coded in a component.

---

## Copy and tone rules

Short sentences. Second person. Warm, plain, slightly dry. Never chirpy.

- Banned words: *just*, *simply*, *easy*, *positive vibes*, *your journey*.
- No exclamation marks except in genuine celebration, at most one.
- Acknowledge difficulty before offering an action.
- Never tell the user to cheer up, be grateful, or look on the bright side.
- Never diagnose, and never claim to treat.

```
YES  "That was hard and you did it."
NO   "Amazing job! You're crushing it!"

YES  "Nothing today? That's allowed. Mo's still here."
NO   "You missed your check-in! Don't break your streak!"
```

---

## How it is built

| | |
|---|---|
| Framework | React 19 + TypeScript, built with Vite |
| State | Zustand, persisted to `localStorage` under one key (`lumo.v1`) |
| Routing | A ~50-line hash router, so the build works from any static path |
| Audio | Web Audio API — soundscapes are **generated**, not shipped as files, so they work offline with nothing downloaded and never loop audibly |
| Voice | Web Speech API for optional narration and optional dictation; both degrade to text silently |
| Charts | Hand-drawn SVG, no chart library |
| Offline | A service worker whose precache list is generated from the real build output (`sw.template.js` + the Vite plugin in `vite.config.ts`) |
| Animation | CSS transitions and keyframes, 280–400ms, all respecting `prefers-reduced-motion` |

Total production bundle: about 114 kB gzipped, with no runtime dependencies
beyond React and Zustand.

### Data model

```
settings      onboarding, name, region, theme, reminder time, lock code
entitlement   fullAccess + plan
checkIns[]    mood 1–5, energy 1–5, sleep, chips, optional note
lifts[]       action id, tier, category, seconds, ended early
reframes[]    thought, distortions, friend reply, kinder version
grounds[]     tool, label, seconds
opens[]       day keys — opening the app counts, and the app says so
safetyPlan    six sections, contacts with optional phone numbers
lessonsDone[] lesson ids
```

Persistence merges saved data over defaults on load, so adding a field never
breaks an existing install.

---

## Accessibility

- Every control has an accessible name; the mascot, the chart and the meters
  have `role` and `aria-label`.
- All touch targets are at least 48px (asserted at 44px in the acceptance run).
- No horizontal overflow at 24px root font size (roughly XXL dynamic type),
  asserted across twelve routes.
- `prefers-reduced-motion` collapses every transition and stops Mo's breathing
  pulse.
- Dark is the default and is the better-looking of the two themes, because a
  large share of these sessions happen at night.
- Sheets trap Escape, restore scroll, and are portalled so they are never
  covered by the tab bar.

---

## Known limits of the web build

Stated plainly rather than hidden:

- **Screen-locked audio.** A web page cannot guarantee playback once the phone
  is locked. The soundscapes keep playing while the tab is visible or
  backgrounded, but a locked screen may suspend them. A native build would use
  `expo-av` with background audio.
- **Scheduled notifications.** The daily invitation is scheduled while the app
  is open. True local scheduling needs `expo-notifications` or a push service —
  deliberately not added here, because it would mean a server.
- **Fonts.** Fraunces and Inter load from Google Fonts with a full local
  fallback stack. Offline, the app renders in the fallback serif and sans and
  everything still lays out correctly. Self-host the two families to remove the
  request entirely.
- **Dictation** in the Reframr uses the Web Speech API, which is not in every
  browser. Where it is missing, the mic button is replaced by a line saying so,
  and typing works as it always does.

---

## Files

```
lumo/
├─ src/
│  ├─ content/        the whole content layer — prose lives only here
│  ├─ components/     Mo, UI primitives, tab bar, safety card, chart
│  ├─ screens/        one file per surface
│  ├─ store/          zustand store + types
│  ├─ lib/            router, storage, audio, speech, insights, export, haptics
│  └─ styles/         tokens.css + global.css
├─ scripts/acceptance.mjs
├─ public/            manifest, icon
├─ sw.template.js     service worker template (precache list injected at build)
├─ SAFETY.md
└─ README.md
```

---

Lumo is not therapy, not a diagnosis and not a crisis service. If you are in
danger, the crisis lines are built into the app and they work offline.
