# Re-times the voiceover: each sentence is cut from the take at its measured word boundaries and placed at a
# target time, so the read fits 25 s without speeding the voice up. Writes vo.wav, vo.json and captions.srt.
import json, subprocess, numpy as np, soundfile as sf
SR = 48000
src = 'vo_take.ogg'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', str(SR), 'vo_src.wav'], check=True)
x, _ = sf.read('vo_src.wav')

# (take start, take end, target start, caption text) - take times from the edge-tts word boundaries
SEG = [
    (0.06, 1.98, 0.15, 'We make time for everything...'),
    (2.79, 4.10, 2.30, 'Except our health.'),
    (4.90, 5.99, 3.75, 'That headache.'),
    (6.79, 8.34, 4.95, 'That constant fatigue.'),
    (9.15, 11.20, 6.70, 'The symptoms we keep ignoring.'),
    (12.01, 16.68, 9.15, 'Sometimes, the smartest first step\nis simply talking to a doctor.'),
    (17.49, 20.87, 14.05, 'For everyday healthcare,\nstart closer to home.'),
    (21.67, 23.45, 17.95, 'Meriva Medical Centre.'),
    (24.27, 26.46, 22.10, 'Your first step to better health.'),
]
DUR = 25.0
out = np.zeros(int(DUR * SR))
fade = int(0.012 * SR)
cues = []
for a, b, t, text in SEG:
    seg = x[int(a * SR):int(b * SR)].copy()
    seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    i = int(t * SR); out[i:i + len(seg)] += seg
    cues.append({'start': t, 'end': t + (b - a), 'text': text})
assert cues[-1]['end'] < 24.6, cues[-1]
out *= 10 ** (-1.0 / 20) / max(1e-6, np.abs(out).max())  # peak -1 dBFS; final loudness set in the mix
sf.write('vo.wav', out, SR)
json.dump(cues, open('vo.json', 'w'), indent=1)

def ts(s):
    ms = int(round(s * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
with open('captions.srt', 'w') as f:
    for k, c in enumerate(cues, 1):
        # hold each line 0.25 s past the voice, but never into the next line
        end = min(c['end'] + 0.25, cues[k]['start'] - 0.05) if k < len(cues) else c['end'] + 0.25
        f.write(f"{k}\n{ts(c['start'])} --> {ts(end)}\n{c['text']}\n\n")
for c in cues: print(f"{c['start']:6.2f} {c['end']:6.2f}  {c['text']!r}")
