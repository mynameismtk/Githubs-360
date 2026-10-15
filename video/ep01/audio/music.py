# Original score + sound design for the 25 s cut, synthesized from scratch - every sound, keys and
# whooshes included, is generated here (no samples). Writes music.wav (score + SFX, no voice) and mix.wav (with voice,
# ducked). Cue map (seconds):
#   0.0-7.0  office ambience, keyboard, restrained low pulse (A minor, 96 BPM), tightening
#   6.85-7.25 a breath of silence
#   7.25-11  pulse softens, warm pad enters (F major 7)
#   11-17    felt-piano arpeggio, C - G/B - Am - F, relief and clarity
#   17-22    resolution on C, logo signature (three-note chime) at 17.9
#   22-25    sustain under the end card, gentle tail
import numpy as np, soundfile as sf, subprocess
import filt
SR = 48000; DUR = 25.0; N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
mus = np.zeros((N, 2))

def env(n, a, d, s=0.0, r=None):
    e = np.ones(n) * s
    na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    nd = int(d * SR); e[na:na + nd] = np.exp(-np.linspace(0, 5, len(e[na:na + nd]))) * (1 - s) + s
    return e

def add(sig, at, pan=0.0, gain=1.0):
    i = int(at * SR); j = min(N, i + len(sig))
    if j <= i: return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mus[i:j, 0] += sig[:j - i] * l * gain; mus[i:j, 1] += sig[:j - i] * r * gain

def lp(x, fc, order=2):
    return filt.lp(x, fc, SR, order)

def hp(x, fc, order=2):
    return filt.hp(x, fc, SR, order)

def hz(m): return 440 * 2 ** ((m - 69) / 12)

def xfade(a, b, x): return a * (1 - x) + b * x


# ---- synthesized foley (no samples) ----
def keys(ln, seed=3):
    r = np.random.default_rng(seed); n = int(ln * SR); y = np.zeros(n); i = 0
    while i < n - int(0.03 * SR):
        m = int(0.025 * SR); tt = np.arange(m) / SR
        click = hp(r.standard_normal(m), 1800) * np.exp(-tt * 260) * r.uniform(0.35, 0.8)
        thock = np.sin(2 * np.pi * r.uniform(180, 260) * tt) * np.exp(-tt * 90) * 0.25
        y[i:i + m] += click + thock
        i += int(r.uniform(0.055, 0.15) * SR)
    return y * 0.9

def whoosh(ln=0.55, lo=400, hi=4200, seed=5):
    r = np.random.default_rng(seed); n = int(ln * SR); tt = np.arange(n) / SR
    noise = r.standard_normal(n); y = np.zeros(n); k = 12
    for j in range(k):  # a band that sweeps upward, built from crossfaded filtered slices
        fc = lo * (hi / lo) ** (j / (k - 1))
        w = np.exp(-0.5 * ((tt / ln - j / (k - 1)) / 0.12) ** 2)
        y += lp(hp(noise, fc * 0.5), fc) * w
    env = np.sin(np.pi * np.clip(tt / ln, 0, 1)) ** 2
    return y * env / (np.abs(y).max() + 1e-9)

def sparkle_swoosh(ln=1.1):
    y = whoosh(ln, 300, 6000, 9) * 0.8; tt = np.arange(len(y)) / SR
    for f0, at in [(2637, 0.45), (3136, 0.6), (3951, 0.75)]:
        g = np.sin(2 * np.pi * f0 * tt) * np.exp(-np.clip(tt - at, 0, None) * 9) * (tt >= at) * 0.25
        y += g
    return y

# ---- office ambience: band-limited room noise + distant HVAC hum, 0-7 s, then gone ----
room = lp(hp(rng.standard_normal(N), 120), 1800) * 0.018
room += np.sin(2 * np.pi * 100 * t) * 0.002
amb = room * np.clip(np.minimum(t / 0.05, (6.85 - t) / 0.15), 0, 1)
add(amb, 0, 0, 1.0); add(lp(rng.standard_normal(N), 900) * 0.006 * np.clip((6.85 - t) / 0.15, 0, 1), 0, 0.4)

# ---- keyboard: synthesized key clicks, placed on the pattern beats ----
typ = keys(1.6)
for at, ln, g, p in [(0.0, 1.4, 0.35, -0.3), (3.0, 1.45, 0.55, -0.2), (4.55, 1.0, 0.6, 0.2), (5.65, 0.7, 0.5, -0.1)]:
    seg = typ[:int(ln * SR)].copy(); f = int(0.03 * SR); seg[-f:] *= np.linspace(1, 0, f)
    add(seg, at, p, g)

# ---- low pulse, A (55 Hz) soft sine kick at 96 BPM, eighth-note ghost in the pattern, tightens to 7 s ----
beat = 60 / 96
k = 0.0; hits = []
while k < 6.8:
    hits.append((k, 1.0)); 
    if k > 2.9: hits.append((k + beat / 2, 0.45))
    k += beat
for at, v in hits:
    n = int(0.45 * SR); tt = np.arange(n) / SR
    f = 55 * (1 + 0.6 * np.exp(-tt * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7) * 0.32 * v
    add(s, at, 0, 1.0)
# a muted bass drone that swells under the pattern and stops dead for the breath at 6.85
dr = (np.sin(2 * np.pi * 55 * t) + 0.35 * np.sin(2 * np.pi * 110 * t + 0.3)) * 0.05
dr *= np.clip(t / 2.5, 0, 1) * np.clip((6.85 - t) / 0.05, 0, 1) * (0.7 + 0.3 * np.clip((t - 3) / 3.5, 0, 1))
add(dr, 0)
# high tension: a filtered noise riser 4.5-6.85 that cuts into silence
rz = hp(rng.standard_normal(N), 2500) * 0.0
ri = (t > 4.5) & (t < 6.85); rz[ri] = hp(rng.standard_normal(ri.sum()), 3000) * ((t[ri] - 4.5) / 2.35) ** 2 * 0.05
add(rz, 0, 0)

# ---- warm pad, 7.25 -> 25: detuned saws through a low-pass, chords per section ----
def pad(notes, at, ln, gain=0.05, bright=1400):
    n = int(ln * SR); tt = np.arange(n) / SR; s = np.zeros(n)
    for m in notes:
        for det in (-0.08, 0.0, 0.08):
            ph = 2 * np.pi * hz(m + det) * tt + rng.uniform(0, 6.28)
            s += (2 * ((ph / (2 * np.pi)) % 1) - 1)
    s = lp(s, bright, 2) / (len(notes) * 3)
    e = np.minimum(1, np.minimum(tt / 0.9, (ln - tt) / 0.9).clip(0, 1))
    return s * e * gain
add(pad([53, 57, 60, 64], 7.25, 4.1, 0.10, 900), 0)          # Fmaj7, dark filter (the decision)
add(pad([48, 55, 60, 64], 11.0, 3.1, 0.09, 1500), 7.25 - 7.25)  # C
add(pad([47, 55, 62, 67], 14.0, 1.6, 0.08, 1500), 0)          # G/B
add(pad([45, 57, 60, 64], 15.5, 1.7, 0.08, 1500), 0)          # Am
add(pad([41, 53, 57, 60, 65], 17.0, 1.1, 0.09, 1700), 0)      # F
add(pad([48, 55, 60, 64, 67, 72], 17.9, 7.1, 0.10, 2200), 0)  # C, resolution under the logo and end card

# ---- felt piano: additive partials with hammer noise, soft and low-passed ----
def piano(m, v=0.5, ln=2.6):
    n = int(ln * SR); tt = np.arange(n) / SR; f = hz(m); s = np.zeros(n)
    for p, (amp, dec) in enumerate([(1, 1.2), (0.45, 1.8), (0.22, 2.6), (0.1, 3.4), (0.05, 4.5)], 1):
        s += amp * np.sin(2 * np.pi * f * p * (1 + 0.0004 * p * p) * tt) * np.exp(-tt * dec)
    s += lp(rng.standard_normal(n), 2500) * np.exp(-tt * 60) * 0.15
    s *= np.minimum(1, tt / 0.004)
    return lp(s, 2600) * v * 0.16
# the first notes answer the decision (8.0 / 9.5), then the arpeggio under the clinic
add(piano(64, 0.35, 3), 8.05, 0.2); add(piano(67, 0.3, 3), 9.6, -0.2)
arp = {11.0: [48, 55, 60, 64, 67, 64], 14.0: [47, 55, 62, 67], 15.5: [45, 57, 60, 64], 17.0: [41, 53, 60]}
for at, notes in arp.items():
    step = 0.5
    for i, m in enumerate(notes):
        add(piano(m + 12 if i > 1 else m, 0.42 if i == 0 else 0.3, 2.4), at + i * step, (-0.3, 0.3)[i % 2])
# resolution chord at the logo landing
for i, m in enumerate([48, 55, 60, 64, 67, 72]):
    add(piano(m, 0.38, 6.5), 17.9 + i * 0.012, (i - 2.5) / 6)

# ---- logo signature: three bell tones (G-C-E) over the chord, plus the house soft reveal swoosh ----
def bell(m, v=0.5, ln=3.0):
    n = int(ln * SR); tt = np.arange(n) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 2.2) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 5) + 0.2 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt * 9)
    return s * np.minimum(1, tt / 0.002) * v * 0.12
add(bell(79, 0.6), 17.75, -0.3); add(bell(84, 0.6), 17.95, 0.3); add(bell(88, 0.7), 18.15, 0)
add(sparkle_swoosh() * 0.3, 17.25, 0)
# soft transition sounds: match cut into the clinic (11.0) and into the white brand world (17.0)
wh = whoosh() * 0.22
add(wh, 10.75, 0); add(wh * 0.8, 16.75, 0)
# end card: one last high bell as the CTA settles
add(bell(84, 0.45, 2.5), 22.05, 0)

# ---- master the score, write it, then mix the voice with ducking ----
mus = np.tanh(mus * 1.2) / 1.2
fo = np.clip((DUR - t) / 0.6, 0, 1); mus *= fo[:, None]
mus *= 10 ** (-3 / 20) / np.abs(mus).max()
sf.write('./music.wav', mus, SR)

vo, _ = sf.read('./vo.wav')
vo = vo[:N] if len(vo) >= N else np.pad(vo, (0, N - len(vo)))
# duck the score ~7 dB under speech, 80 ms attack / 300 ms release
lvl = np.convolve(np.abs(vo), np.ones(int(0.03 * SR)) / int(0.03 * SR), 'same') > 0.01
g = np.where(lvl, 10 ** (-7 / 20), 1.0)
sm = np.zeros(N); a, r = np.exp(-1 / (0.08 * SR)), np.exp(-1 / (0.3 * SR)); y = 1.0
for i in range(0, N, 48):
    target = g[i]; c = a if target < y else r
    for _ in range(48): y = c * y + (1 - c) * target
    sm[i:i + 48] = y
mix = mus * sm[:, None] * 0.75 + np.stack([vo, vo], 1) * 1.0
mix *= 10 ** (-1 / 20) / np.abs(mix).max()
sf.write('./mix.wav', mix, SR)
print('ok', np.abs(mix).max())
