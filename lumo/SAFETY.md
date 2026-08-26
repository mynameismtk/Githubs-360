# SAFETY.md — Lumo

Every safety pathway in the app, the crisis-line dataset, and the escalation
logic. This document is part of the product, not an afterthought: if a change
touches anything described here, this file is updated in the same commit.

---

## 1. Principles

1. **Safety is a first-class feature.** The Anchr is reachable in one tap from
   every screen, including from inside the Liftr and from inside a comfort
   session. It is never behind a paywall, never behind onboarding, and never
   behind a network request.
2. **Never surveil, never punish.** Answering honestly must never make the app
   behave in a way that feels like being reported on. Nothing is locked, nothing
   is escalated to a third party, and there is no third party to escalate to.
3. **Never diagnose.** The app tracks, reflects and supports. It never tells a
   user they have depression, never scores them against a clinical instrument,
   and never presents itself as treatment or as crisis care.
4. **Offline is a safety requirement.** Crisis numbers ship inside the app
   bundle. They are readable and dialable with no signal, on first launch,
   before any account (there are no accounts) and before any download.

---

## 2. Pathways

### 2.1 The Anchr — always one tap away

| Where | Affordance | Taps to the Anchr |
|---|---|---|
| Home, Reflectr, Reframr, Groundr, Progress, Lessons, Paywall, Settings | Floating **Safety** pill (`AnchrFab`) | 1 |
| Inside the Liftr (choose / energy / offer / timer / done) | Floating **Safety** pill | 1 |
| Inside a Path B comfort session | **"I'm not safe right now"** link, always visible | 1 |
| Home quick row and Settings | Direct links | 1 |

Verified automatically by `npm run acceptance` ("Anchr within 2 taps from every
screen"), which walks every route and asserts the affordance is present.

The Anchr contains, in this order:

1. **Your person** — one-tap `tel:` and `sms:` to the first contact in the plan.
2. **Crisis lines** for the selected region, with one-tap dial or text.
3. **Emergency services** for the region.
4. **The plan itself** — six sections: my warning signs · things that have
   helped before · people I can message · people I can call · professionals ·
   reasons to stay.

The plan is written by the user, stored in `localStorage` on the device, and
never transmitted. There is no server component in this build.

### 2.2 Escalation logic

There is exactly one automatic trigger, and one manual one.

**Automatic — two lowest-possible moods in a row.**

```
inHeavyRun(state)  ==  checkIns[0].mood === 1 && checkIns[1].mood === 1
```

Evaluated only immediately after a check-in is saved (`Home.tsx`), and only if
the last safety card was shown more than **12 hours** ago
(`state.safetyCardShown`). When it fires, a calm bottom sheet appears offering,
in order:

- call the region's first crisis line,
- open the safety plan,
- sit with Mo (Path B),
- **Not now** — always present, always the easiest button to reach.

The sheet is dismissible by tapping outside it, by pressing Escape, and by the
Not-now button. It does not lock the app, does not block any feature, does not
repeat within twelve hours, and produces no record beyond a local timestamp.

**Manual — "I'm not safe right now."**

Present at all times during a Path B comfort session. Opens the same sheet with
different copy (`NOT_SAFE_CARD`), leading with the crisis line. Nothing is
logged when it is tapped.

### 2.3 Paywall suppression

A paywall in someone's worst moment is a safety issue, so suppression is
implemented in the store rather than left to each screen:

- `quietPaywall(minutes)` sets `paywallQuietUntil`.
- It is called with **120 minutes** when a check-in is saved with mood ≤ 2, and
  when a Path B comfort session starts.
- It is called with **60 minutes** when a lift completes.
- `paywallAllowed(state)` is false while that window is open. During it, the
  Lessons hub hides its promotional call to action entirely, and `/paywall`
  itself renders "Nothing is for sale right now" instead of any pricing.

Verified by `npm run acceptance` ("No pricing after a low-mood check-in").

Never paywalled, in any state: the Liftr (both paths), the Anchr, the check-in,
the Reframr, breathing, the 5/10/20-minute body scan, three soundscapes, the
five Understanding lessons, and check-in CSV export.

### 2.4 Disclaimers

Said twice, plainly, and never repeated as a nag:

- once during onboarding (screen 2, "What this is not"),
- once in Settings → About.

Wording lives in `src/content/copy.ts` under `DISCLAIMER`.

---

## 3. Crisis line dataset

Source of truth: `src/content/crisis.ts`. Region is chosen in onboarding
(pre-filled from the browser locale) and changeable in Settings.

**Last compiled: 2026-08-26**, from the product brief. **These numbers must be
re-verified against each provider before any public release, and re-checked
every six months after that.** A wrong number in this file is the most harmful
defect this app can ship. Re-verification means loading the provider's own site
and confirming the number, the hours and the name.

| Region | Service | Number | Hours |
|---|---|---|---|
| India | Tele-MANAS | 14416 | 24/7 |
| India | KIRAN | 1800-599-0019 | 24/7 |
| India | AASRA | +91 98204 66726 | 24/7 |
| India | Emergency | 112 | — |
| United States | Suicide & Crisis Lifeline | 988 | 24/7 |
| United States | Crisis Text Line | text HOME to 741741 | 24/7 |
| United States | Emergency | 911 | — |
| United Kingdom | Samaritans | 116 123 | 24/7 |
| United Kingdom | Shout | text SHOUT to 85258 | 24/7 |
| United Kingdom | NHS urgent mental health | 111, option 2 | 24/7 |
| United Kingdom | Emergency | 999 | — |
| Ireland | Samaritans | 116 123 | 24/7 |
| Ireland | Text About It | text HELLO to 50808 | 24/7 |
| Ireland | Emergency | 112 | — |
| Canada | Suicide Crisis Helpline | 988 | 24/7 |
| Canada | Emergency | 911 | — |
| Australia | Lifeline | 13 11 14 | 24/7 |
| Australia | Beyond Blue | 1300 22 4636 | 24/7 |
| Australia | Emergency | 000 | — |
| New Zealand | Need to talk? | 1737 | 24/7 |
| New Zealand | Lifeline Aotearoa | 0800 543 354 | 24/7 |
| New Zealand | Emergency | 111 | — |
| South Africa | SADAG Suicide Crisis Line | 0800 567 567 | 24/7 |
| South Africa | Emergency | 10111 | — |
| Anywhere else | Find A Helpline | findahelpline.com | directory |

`findahelpline.com` is also offered as a fallback on every non-international
region, for travellers.

`tel:` values are stored separately from display values so that spacing and
punctuation never break dialling. The India numbers are asserted by the
acceptance script.

---

## 4. Data handling

- No account, no server, no sync, no analytics of any kind in this build.
- All health data — check-ins, notes, lifts, reframes, the safety plan — is in
  `localStorage` under a single key, `lumo.v1`.
- Export is user-initiated and local: a CSV generated in the page, or a print
  view the browser can save as a PDF. Nothing is uploaded to produce either.
- **Delete everything** wipes the key and resets state in place. Region and
  theme are preserved because they are not health data and losing the region
  would silently change which crisis numbers are shown.
- The optional four-digit lock protects against someone picking up an unlocked
  phone. It is not encryption and the UI says so, along with the fact that there
  is no recovery, because there is no account to recover from.

---

## 5. Copy rules with a safety dimension

- No streaks, anywhere. Nothing in the app can be broken or lost. The
  "you showed up" counter is monotonic by construction.
- Notifications are invitations, capped at one a day, and never reference a
  missed day or a lapsed streak. Full library in
  `src/content/notifications.ts`.
- No toxic positivity: nothing tells the user to cheer up, be grateful, or look
  on the bright side. The Understanding lesson on what helps says plainly that
  gratitude practices often backfire mid-episode.
- Medication and therapy are described neutrally, with no advocacy and no
  stigma, and every mention routes decisions back to a prescriber or clinician.
- Correlations are always phrased as "that's a pattern, not a rule", are never
  causal, and never appear before ten check-ins exist.
