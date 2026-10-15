# Before It Becomes Big — Ep. 01 "The Ignored Headache"

25 s paid ad for Meriva Medical Centre (Coimbatore) for Instagram/Facebook Reels and Meta ads.
1080×1920, 24 fps, H.264 CRF 17 + AAC 256 kbps, −14.9 LUFS integrated, −1.0 dBTP.

**Finished film:** the Ootto library on the `@meriva_medicalcenter` account
(job `job_5f0fbc65a6d2`, saved, not posted). This session's network couldn't download the
MP4 into the repo, so only the source and subtitles are here.
**Subtitles:** [`final/meriva_ep01_ignored_headache.en.srt`](final/meriva_ep01_ignored_headache.en.srt)

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
* **Music and SFX:** an original synthesized score plus Ootto's house SFX library (typing, whoosh, soft swoosh).

## Open items

* **Phone number and address weren't supplied.** The `AdClean` composition ends on the verified website only.
  `AdPlaceholder` adds a dashed `[ CLINIC PHONE · ADDRESS ]` slot (`src/Brand.tsx`) to fill and re-render.
* **Palette:** the campaign palette (purple / magenta / orange / yellow) runs the type and shapes; the logo keeps
  its official navy / blue / orange. Their published posts use navy + orange, so the purple world is a deliberate
  departure for this campaign. All colours are in `src/theme.ts`.
* **Brief deviations forced by stock:** shot 2's "glances at phone" became "flips through papers" (the take has no
  phone), and the decision beat is a phone graphic over her blurred desk rather than a live shot of her holding it.

## Rebuild

Media goes in `public/`: `office.mp4`, `reception.mp4`, `doctor_close.mp4`, `logo.png`, `mix.wav`.

```bash
cd audio && python3 vo.py && python3 music.py && cp mix.wav ../public/   # needs vo_take.mp3 + sfx/
npm install && npm run render              # out/meriva_ep01_clean.mp4
npm run render:placeholder                 # end card with the phone/address slot
```
