# Meriva Medical Centre — 15 s launch video

1080×1920 (9:16), 60 fps, 120 BPM. All source material is in [`../assets`](../assets/README.md).

## Story (every cut and hit sits on the 120 BPM grid, beat = 0.5 s)

| Time | Beat | Picture | Sound |
|---|---|---|---|
| 0.0–3.0 | **Hook** | "HEALTHCARE SHOULDN'T FEEL THIS HARD." One word per beat; earlier words flip to outlines; "HARD." slams in orange | Dark B-minor drone, an impact + stab on every word, snare-roll build, iris whoosh |
| 3.0–6.0 | **Product** | Phone rises; the real home screen assembles from ten crops on 16th/8th notes; real scroll; cursor taps *Book appointment* | Drop: four-on-the-floor groove, ascending UI pops per piece, click on 5.5 |
| 6.0–8.0 | **Book** | Speciality → doctor → time screens stutter in; cursor taps 12:00 pm, then *Confirm appointment*; "Appointment confirmed" + logo-petal confetti | Clicks on 6.5 and 7.0, push whooshes, two-note confirm chime |
| 8.0–10.0 | **Reports** | Cursor opens *New lab report*; the HbA1c row is outlined and lifts out as a 2.7× callout (5.9 %, Above range, 4–5.6) | Click on 8.5, zoom whoosh, highlight bell |
| 10.0–12.0 | **Family** | Cursor taps the patient name; the real "Who are you here for?" sheet slides up; taps Ishaan; the "Viewing Ishaan Menon's records" band lifts out | Clicks on 10.5 and 11.0, sheet whooshes, fill into the logo |
| 12.0–15.0 | **Logo** | The real logo's 8 petals spiral in on 16ths; the cross lands on 13.0; wordmark, swoosh, descriptor, tagline; CTA "Visit Meriva Medical Centre · Coimbatore" | Breakdown, one pluck per petal, a big hit and D-major chord bloom on 13.0, CTA hit on 14.0 |

Progression: Bm drone → D | A | Bm | G | A | D (I–V–vi–IV–V–I in D major).

## Build

```bash
npm install                      # playwright (uses the preinstalled Chromium)
python3 music.py out/music.wav   # original score, synthesized with numpy/scipy
node render.mjs sheet 2.25 4.6   # stills at given times -> out/sheet/
node render.mjs video 60 2       # 60 fps, 2 sub-frames blended for motion blur -> out/video_silent.mp4
ffmpeg -i out/video_silent.mp4 -i out/music.wav -c:v copy -c:a aac -b:a 256k -shortest final/meriva_launch.mp4
```

`final/` holds the deliverables: `meriva_launch.mp4`, the score (`music.wav`) and the review
contact sheets (`contact_v1.png` before fixes, `contact_v2.png` after). `out/` is scratch and is
git-ignored.

`index.html` is a deterministic composition: `render(t)` sets every style from `t` alone, so
any frame can be rendered on its own and the output does not depend on machine speed.
