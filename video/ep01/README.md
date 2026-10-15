# Before It Becomes Big — Ep. 01 "The Ignored Headache"

25 s paid ad for Meriva Medical Centre (Coimbatore) for Instagram/Facebook Reels and Meta ads.
1080×1920, 24 fps, H.264 CRF 17 + AAC 256 kbps, −14.9 LUFS integrated, −1.0 dBTP.

**Finished film:** the Ootto library on the `@meriva_medicalcenter` account
(job `job_5f0fbc65a6d2`, saved, not posted). This session's network couldn't download the
MP4 into the repo, so only the source and subtitles are here.
**Subtitles:** [`final/meriva_ep01_ignored_headache.en.srt`](final/meriva_ep01_ignored_headache.en.srt)

## All-code edition — [`final/meriva_ep01_code.mp4`](final/meriva_ep01_code.mp4)

Same script, voice, timing, score and end card, with every picture drawn in code (`src/AdCode.tsx`,
`src/code/Scenes.tsx`) and every sound synthesized (`audio/music.py`). No footage or photos are used.
It's rendered in this repo. 1080×1920, 24 fps, 600 frames, 25.0 s, −15.1 LUFS, −1.0 dBTP.
Contact sheet: [`final/contact_sheet_code.jpg`](final/contact_sheet_code.jpg).

Its visual idea is **the dot**: the ignored symptom is a small magenta point. It stays at the same spot on screen through every
office cut while the work behind it changes, and it gets bigger each time ("before it becomes big").

| Time | Picture |
|---|---|
| 0–3 s | A white single-line profile on night purple; work notifications drift in; the dot appears at the temple |
| 3–7 s | Match cuts — a document typing itself (WORK.), a week filling up (DEADLINES.), a clock racing (ROUTINE.) — then the work falls away and only the grown dot is left |
| 7–11 s | The phone search (the same component as the footage cut), the dot blurred far behind it |
| 11–17 s | A warm neighbourhood map: a short route draws from Home to Meriva Medical Centre, then Reception · Consultation · Diagnostics |
| 17–25 s | The brand reveal and CTA, shared with the footage cut |

## Cut

| Time | Shot | Picture | On screen | Sound |
|---|---|---|---|---|
| 0–3 s | Hook | ECU of the professional, slow push-in, handheld; she lifts her hand to her temple | BUSY WITH EVERYTHING. → EXCEPT YOUR **HEALTH?** (standing on frame 0) | room tone, keys, 55 Hz pulse |
| 3–7 s | Pattern | Same take, three tightening match cuts (typing 0.8 s → papers 0.7 s → ECU 0.6 s), then a slowed hold | WORK. DEADLINES. **ROUTINE.** (split apart) → YOUR HEALTH CAN'T WAIT **FOREVER.** | typing on the cuts, riser, a breath of silence at 6.85 |
| 7–11 s | Decision | A phone over her blurred desk: types "general physician near me", one Meriva result (name, "Multispeciality clinic · Coimbatore", General medicine / Diagnostics chips — no ratings, reviews or claims), taps **Book consultation**; the white screen fills the frame | START WITH THE RIGHT **MEDICAL ADVICE.** | warm pad, first piano notes |
| 11–17 s | Meriva experience | Bright cut: receptionist greeting the viewer; the doctor reviewing a clipboard, then handing it across — all from the patient's point of view | EVERYDAY HEALTHCARE. → CLOSER **TO HOME.** | felt-piano arpeggio C–G/B–Am–F |
| 17–22 s | Brand reveal | Purple→magenta wave, white opens through it; organic purple/magenta corner shapes, orange/yellow accents; the official logo lands at 17.9 s; three services | GENERAL MEDICINE · MULTISPECIALITY CONSULTATIONS · DIAGNOSTIC SERVICES | C major resolution, three-bell logo signature |
| 22–25 s | CTA | Logo moves up; end card | YOUR FIRST STEP **TO BETTER HEALTH.** · BOOK YOUR CONSULTATION · merivamedicalcenter.com | sustain, final bell |

Voice-over (Indian English, "Neerja", warm and measured) is the exact brief script. The sentences are
re-spaced from one take at their measured word boundaries (`audio/vo.py`), so it fits 25 s without
being sped up. The score is synthesized from scratch (`audio/music.py`) and ducked 7 dB under the voice.

## Sources and rights

* **Logo:** the clinic's own uploaded logo (1254 px), keyed to transparency, not redrawn.
* **Services and website:** from Meriva's brand record — general medicine; diabetes, women's health and
  fertility consultations; lab tests, ultrasound and diagnostics; merivamedicalcenter.com.
* **Footage:** royalty-free stock from Pexels (free for commercial use, no attribution required):
  `office.mp4` (one continuous take of the professional, used for every office shot), `reception.mp4`,
  `doctor_close.mp4`. These aren't Meriva staff or premises.
* **Music and SFX:** an original score and foley, all synthesized in `audio/music.py` (the footage cut on Ootto used the house typing/whoosh samples).

## Open items

* **Phone number and address weren't supplied.** The `AdClean` composition ends on the verified website only.
  `AdPlaceholder` adds a dashed `[ CLINIC PHONE · ADDRESS ]` slot (`src/Brand.tsx`) to fill and re-render.
* **Palette:** the campaign palette (purple / magenta / orange / yellow) runs the type and shapes; the logo keeps
  its official navy / blue / orange. Their published posts use navy + orange, so the purple world is a deliberate
  departure for this campaign. All colours are in `src/theme.ts`.
* **Brief deviations forced by stock:** shot 2's "glances at phone" became "flips through papers" (the take has no
  phone), and the decision beat is a phone graphic over her blurred desk rather than a live shot of her holding it.

## Rebuild

`public/` already holds the logo and the bundled Oswald/Inter fonts. Renders need no network.

```bash
cd audio && python3 vo.py && python3 music.py && cp mix.wav ../public/ && cd ..   # voice take is audio/vo_take.ogg
npm install
export REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell   # optional: local Chromium
npm run render:code -- --browser-executable=$REMOTION_CHROME   # all-code edition, no other media needed
npm run render                             # footage cut: also needs office.mp4, reception.mp4, doctor_close.mp4 in public/
npm run render:placeholder                 # footage cut with the phone/address slot
```
