"""Original 120 BPM score + UI foley for the Meriva launch video, synthesized from scratch.

Every event time below is copied from the animation timeline in index.html, so hits, clicks and
whooshes land on the same frames as the picture.

    python3 music.py out/music.wav
"""
import sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
DUR = 15.0
N = int(SR * DUR)
BEAT = 0.5
rng = np.random.default_rng(2026)

L = np.zeros(N)
R = np.zeros(N)
SEND = np.zeros((2, N))          # reverb send
DUCK_BUS = np.zeros((2, N))      # pad / bass / arp: sidechained to the kick


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(dur):
    return np.arange(int(SR * dur)) / SR


def place(sig, t0, gain=1.0, pan=0.0, send=0.0, bus=None):
    """Add a mono or stereo signal at time t0 (s). pan -1..1 (equal power)."""
    i0 = int(round(t0 * SR))
    if sig.ndim == 1:
        a = (pan + 1) * np.pi / 4
        st = np.vstack([sig * np.cos(a), sig * np.sin(a)])
    else:
        st = sig
    st = st * gain
    if i0 < 0:
        st = st[:, -i0:]
        i0 = 0
    n = min(st.shape[1], N - i0)
    if n <= 0:
        return
    tgt = DUCK_BUS if bus == 'duck' else None
    if tgt is not None:
        tgt[:, i0:i0 + n] += st[:, :n]
    else:
        L[i0:i0 + n] += st[0, :n]
        R[i0:i0 + n] += st[1, :n]
    if send:
        SEND[:, i0:i0 + n] += st[:, :n] * send


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, min(f, SR * 0.45), 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, min(hi, SR * 0.45)], 'band', fs=SR, output='sos'), x)


def sweep_bp(x, f_curve, q=1.2, block=256):
    """Band-pass with a time-varying centre frequency (RBJ biquad, block-updated)."""
    y = np.zeros_like(x)
    zi = np.zeros(2)
    for i in range(0, len(x), block):
        f = float(np.clip(f_curve[min(i, len(f_curve) - 1)], 40, SR * 0.45))
        w0 = 2 * np.pi * f / SR
        alpha = np.sin(w0) / (2 * q)
        b = np.array([alpha, 0, -alpha])
        a = np.array([1 + alpha, -2 * np.cos(w0), 1 - alpha])
        y[i:i + block], zi = signal.lfilter(b / a[0], a / a[0], x[i:i + block], zi=zi)
    return y


def saw(f, t, phase=0.0):
    return 2 * ((f * t + phase) % 1.0) - 1


def env_ad(n, a, d_tau):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-6), np.exp(-(t - a) / d_tau))
    return e


# ── drums ────────────────────────────────────────────────────────────────────
def kick(big=False):
    t = tt(0.55 if not big else 1.2)
    f = 44 + 120 * np.exp(-t * 32) + (25 * np.exp(-t * 6) if big else 0)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * (6.5 if not big else 3.2))
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 400) * 0.35
    return np.tanh(1.6 * (body + click))


def clap():
    t = tt(0.4)
    n = rng.standard_normal(len(t))
    e = np.zeros_like(t)
    for k, o in enumerate([0, 0.011, 0.022]):
        e += np.where(t >= o, np.exp(-(t - o) * (220 if k < 2 else 16)), 0)
    return bp(n, 900, 2600) * e * 0.9


def hat(open_=False):
    t = tt(0.3 if open_ else 0.06)
    return hp(rng.standard_normal(len(t)), 7500, 4) * np.exp(-t * (14 if open_ else 70))


def snare():
    t = tt(0.25)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return (bp(rng.standard_normal(len(t)), 300, 7000) * np.exp(-t * 22) * 0.8 + tone * 0.5)


def crash(dur=2.2):
    t = tt(dur)
    n = hp(rng.standard_normal(len(t)), 4500, 2) * np.exp(-t * 2.2)
    metal = sum(np.sin(2 * np.pi * f * t + 5 * np.sin(2 * np.pi * f * 1.41 * t)) for f in (3120, 4470, 5310)) * np.exp(-t * 3) * 0.05
    return n * 0.5 + metal


def impact(scale=1.0, tail=1.4):
    t = tt(tail)
    f = 32 + 70 * np.exp(-t * 10)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    nz = lp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 9) * 0.7
    crack = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 45) * 0.5
    return np.tanh(1.8 * scale * (sub + nz + crack)) * 0.9


def reverse_swell(dur=0.6):
    t = tt(dur)
    n = lp(rng.standard_normal(len(t)), 6000) * (t / dur) ** 3
    return np.vstack([n, np.roll(n, 37)])


# ── tonal ────────────────────────────────────────────────────────────────────
def supersaw(freqs, dur, cutoff=2600, voices=5, detune=0.18, attack=0.06, release=0.25):
    t = tt(dur)
    l = np.zeros_like(t)
    r = np.zeros_like(t)
    for f in freqs:
        for v in range(voices):
            d = (v - (voices - 1) / 2) / ((voices - 1) / 2) * detune
            fv = f * 2 ** (d / 12)
            s = saw(fv, t, rng.random())
            if v % 2:
                l += s
            else:
                r += s
            if v == (voices - 1) // 2:
                l += s * .5
                r += s * .5
    e = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / release).clip(0, 1)
    sc = 1 / (len(freqs) * voices)
    return np.vstack([lp(l, cutoff) * e * sc, lp(r, cutoff) * e * sc])


def pluck(f, dur=0.32, bright=1.0):
    t = tt(dur)
    s = np.zeros_like(t)
    for h in range(1, 14):
        if f * h > SR * 0.45:
            break
        s += np.sin(2 * np.pi * f * h * t) / h * np.exp(-t * (9 + h * 5 / bright))
    return s * np.minimum(1, t / 0.002)


def bell(f, dur=1.6, idx=3.0):
    t = tt(dur)
    mod = idx * np.exp(-t * 4) * np.sin(2 * np.pi * f * 3.5 * t)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.2) * np.minimum(1, t / 0.003)


def bass_note(f, dur):
    t = tt(dur)
    s = 0.55 * saw(f, t) + 0.45 * np.sign(np.sin(2 * np.pi * f * t))
    s = lp(s, 520, 2) + 0.8 * np.sin(2 * np.pi * f * t)
    return s * np.minimum(1, t / 0.004) * np.exp(-t * 3.5) * np.minimum(1, (dur - t) / 0.02).clip(0, 1)


def blip(f, dur=0.09):
    t = tt(dur)
    return np.sin(2 * np.pi * f * t * (1 + 0.6 * np.exp(-t * 60))) * np.exp(-t * 55)


def ui_click():
    t = tt(0.06)
    tick = hp(rng.standard_normal(len(t)), 4000) * np.exp(-t * 900)
    tone = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 160) * 0.6
    thump = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 90) * 0.5
    return tick + tone + thump


def whoosh(dur, peak=0.7, f0=350, f1=5200, q=0.9):
    """Filtered-noise whoosh. `peak` = fraction of dur where it is loudest (the landing)."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = t / dur
    fc = np.where(x < peak, f0 * (f1 / f0) ** (x / peak), f1 * (f0 * 1.6 / f1) ** ((x - peak) / (1 - peak)))
    env = np.where(x < peak, (x / peak) ** 2.2, np.exp(-(x - peak) / (1 - peak) * 4))
    nz = rng.standard_normal(n)
    y = sweep_bp(nz, fc, q) * env
    pan = np.linspace(-0.7, 0.7, n)
    a = (pan + 1) * np.pi / 4
    return np.vstack([y * np.cos(a), y * np.sin(a)])


# ═════════════════════════════════════════════════════════════════════════════
# ARRANGEMENT
# ═════════════════════════════════════════════════════════════════════════════
B2, D3, Fs3 = midi(47), midi(50), midi(54)
CHORDS = [  # (start, end, root midi, chord midi notes)
    (3.0, 4.0, 38, [62, 66, 69, 74]),     # D
    (4.0, 6.0, 33, [61, 64, 69, 73]),     # A
    (6.0, 8.0, 35, [62, 66, 71, 74]),     # Bm
    (8.0, 10.0, 31, [62, 67, 71, 74]),    # G
    (10.0, 12.0, 33, [61, 64, 69, 76]),   # A
    (13.0, 15.0, 38, [62, 66, 69, 74, 78]),  # D (logo)
]

# 1 · HOOK 0–3 s — dark Bm drone, a hit on every word, build into the drop
drone = supersaw([midi(35), midi(42), midi(47)], 3.0, cutoff=700, voices=5, detune=0.25, attack=0.02, release=0.2)
drone *= np.linspace(0.6, 1.0, drone.shape[1])
place(drone, 0.0, 0.55, send=0.2)
for i, T in enumerate([0.0, 0.5, 1.0, 1.5]):
    place(kick(), T, 0.95)
    place(impact(0.6 + 0.1 * i, 0.8), T, 0.45)
    stab = supersaw([B2 * (1 + (i == 3) * 0), D3, Fs3, midi(59 + (i % 2) * 2)], 0.28, cutoff=3200, attack=0.003, release=0.1)
    place(stab, T, 0.75, send=0.35)
place(reverse_swell(0.45), 1.55, 0.5)
place(kick(big=True), 2.0, 1.05)
place(impact(1.2, 1.6), 2.0, 0.8, send=0.25)
place(supersaw([midi(35), B2, D3, Fs3, midi(59), midi(62)], 0.6, cutoff=4200, attack=0.003, release=0.4), 2.0, 0.8, send=0.5)
place(crash(1.6), 2.0, 0.35, send=0.2)
# build 2.0–3.0: accelerating snare roll + rising noise + pitch riser
roll_t = 2.25
step = 0.125
k = 0
while roll_t < 2.98:
    place(snare(), roll_t, 0.18 + 0.5 * (roll_t - 2.25) / 0.75, pan=0.1 * ((k % 2) * 2 - 1), send=0.15)
    roll_t += step
    k += 1
    if roll_t >= 2.5:
        step = 0.0625
    if roll_t >= 2.75:
        step = 0.03125
rt = tt(1.0)
riser_n = sweep_bp(rng.standard_normal(len(rt)), 300 * (8000 / 300) ** rt, 1.5) * (rt ** 2)
place(np.vstack([riser_n, np.roll(riser_n, 61)]), 2.0, 0.55, send=0.3)
rs = saw(1, rt) * 0
ph = np.cumsum(midi(47) * 2 ** (rt * 2)) / SR
place(lp(2 * (ph % 1) - 1, 2500) * rt ** 2 * 0.25, 2.0, 0.6, send=0.3)
place(whoosh(0.32, peak=0.92, f0=500, f1=7000), 2.7, 0.9)          # iris wipe

# 2–3 · GROOVE 3–12 s
place(impact(1.0, 1.6), 3.0, 0.7, send=0.2)
place(crash(2.2), 3.0, 0.45, send=0.25)
for b in range(6, 24):
    T = b * BEAT
    place(kick(), T, 0.9)
    if b % 2 == 1:
        place(clap(), T, 0.55, pan=0.05, send=0.3)
    place(hat(True), T + 0.25, 0.16, pan=0.3)
    for s16 in (0, 1, 3):
        place(hat(), T + s16 * 0.125, 0.07 + 0.05 * (s16 == 0), pan=0.35)
# a little fill into the logo
for i, T in enumerate([11.5, 11.625, 11.75, 11.875]):
    place(snare(), T, 0.25 + 0.08 * i, send=0.2)

for (t0, t1, root, notes) in CHORDS[:5]:
    dur = t1 - t0
    place(supersaw([midi(n) for n in notes], dur + 0.15, cutoff=3000, attack=0.02, release=0.2), t0, 0.62, send=0.35, bus='duck')
    # bass: driving 8ths with an octave hop on the offbeat
    for i in range(int(dur / 0.25)):
        f = midi(root + (12 if i % 4 == 3 else 0))
        place(bass_note(f, 0.24), t0 + i * 0.25, 0.42, bus='duck')
    # arp: 16ths across the chord tones, alternating sides
    tones = [notes[0], notes[1], notes[2], notes[3], notes[2] + 12, notes[3], notes[1] + 12, notes[2]]
    for i in range(int(dur / 0.125)):
        place(pluck(midi(tones[i % len(tones)] + 12), 0.3), t0 + i * 0.125, 0.13, pan=0.45 * (1 if i % 2 else -1), send=0.4, bus='duck')

# UI foley — assembly pops climb the D major scale on 16ths/8ths
for i, T in enumerate([3.375, 3.5, 3.5625, 3.625, 3.75, 3.875, 4.0, 4.125, 4.25, 4.375]):
    place(blip(midi([74, 76, 78, 81, 83, 86, 88, 90, 93, 95][i])), T, 0.22, pan=-0.5 + i * 0.1, send=0.25)
    place(ui_click(), T, 0.12, pan=-0.5 + i * 0.1)
place(whoosh(0.55, peak=0.85, f0=200, f1=4000), 2.98, 0.5)       # phone rises
place(whoosh(0.75, peak=0.5, f0=250, f1=1800, q=0.7), 4.6, 0.25)    # scroll
for c in [5.5, 6.5, 7.0, 8.5, 10.5, 11.0]:                         # cursor clicks, all on the beat
    place(ui_click(), c, 0.75, pan=0.15)
for T, d, g in [(5.625, .14, .3), (5.8125, .14, .3), (6.0, .14, .35), (6.625, .2, .4), (7.06, .2, .4), (8.56, .2, .4)]:
    place(whoosh(d + 0.12, peak=0.6, f0=600, f1=6500), T - 0.06, g)  # screen pushes
for T in [7.875, 9.875]:
    place(whoosh(0.32, peak=0.65, f0=300, f1=7000, q=1.1), T - 0.08, 0.6)  # whips
for T in [6.0, 8.0, 10.0]:                                          # title slams
    place(impact(0.5, 0.5), T, 0.35)
    place(whoosh(0.2, peak=0.9, f0=800, f1=8000), T - 0.18, 0.25)
for T in [6.1, 8.75, 11.06]:
    place(whoosh(0.3, peak=0.8, f0=150, f1=2200, q=0.8), T, 0.3)    # camera zooms
place(whoosh(0.32, peak=0.55, f0=200, f1=2500), 10.5, 0.45)         # sheet up
place(whoosh(0.28, peak=0.5, f0=2500, f1=300), 11.06, 0.35)         # sheet down
for i, f in enumerate([midi(81), midi(86)]):                        # booking confirmed
    place(bell(f, 1.2, 2.2), 7.06 + i * 0.125, 0.22, pan=-0.2 + 0.4 * i, send=0.5)
for i in range(10):                                                 # confetti sparkle
    place(blip(midi(98 + (i * 5) % 12), 0.05), 7.1 + i * 0.045, 0.06, pan=rng.uniform(-.8, .8), send=0.5)
place(bell(midi(83), 1.0, 1.5), 9.0, 0.16, send=0.5)                # result highlighted
place(bell(midi(85), 1.0, 1.5), 11.25, 0.16, send=0.5)              # family band highlighted
place(whoosh(0.42, peak=0.9, f0=300, f1=7500), 11.6, 0.7)           # phone exits

# 4 · LOGO 12–15 s — breakdown, petals pluck in, the cross lands on 13.0
place(impact(0.7, 1.0), 12.0, 0.45, send=0.4)
pad_soft = supersaw([midi(n) for n in [62, 66, 69, 74]], 1.05, cutoff=1400, attack=0.25, release=0.2)
place(pad_soft, 12.0, 0.45, send=0.5)
for j, m in enumerate([74, 76, 78, 81, 83, 86, 88, 90]):           # one note per petal (16ths)
    place(pluck(midi(m), 0.6, 1.4), 12.25 + j * 0.0625, 0.24, pan=np.sin(j * 0.8) * 0.6, send=0.55)
    place(blip(midi(m + 12), 0.06), 12.25 + j * 0.0625, 0.05, send=0.4)
place(reverse_swell(0.5), 12.5, 0.6)
place(kick(big=True), 13.0, 1.0)
place(impact(1.3, 2.0), 13.0, 0.8, send=0.35)
place(crash(2.0), 13.0, 0.45, send=0.3)
place(supersaw([midi(n) for n in [50, 57, 62, 66, 69, 74, 78]], 2.0, cutoff=3600, attack=0.01, release=0.6), 13.0, 0.7, send=0.5)
for i, m in enumerate([86, 90, 93, 98]):
    place(bell(midi(m), 1.8, 2.5), 13.0 + i * 0.03, 0.09, pan=-0.45 + i * 0.3, send=0.6)
place(whoosh(0.35, peak=0.6, f0=900, f1=9000, q=1.3), 13.3, 0.35)  # swoosh paints across the A
for T in [13.5, 14.5]:
    place(kick(), T, 0.6)
    place(hat(True), T + 0.25, 0.1, pan=0.3)
place(kick(), 14.0, 0.85)
place(impact(0.7, 1.0), 14.0, 0.5, send=0.3)
place(supersaw([midi(n) for n in [62, 66, 69, 74, 78, 81]], 1.0, cutoff=5200, attack=0.003, release=0.7), 14.0, 0.5, send=0.6)
for i, m in enumerate([93, 98, 102]):
    place(bell(midi(m), 1.0, 1.2), 14.0 + i * 0.06, 0.07, pan=0.3 * (i - 1), send=0.6)
place(whoosh(0.6, peak=0.4, f0=3000, f1=12000, q=2), 14.2, 0.12)   # light sweep

# ═════════════════════════════════════════════════════════════════════════════
# MIX
# ═════════════════════════════════════════════════════════════════════════════
duck = np.ones(N)
for b in range(6, 24):
    i0 = int(b * BEAT * SR)
    t = np.arange(N - i0) / SR
    duck[i0:] = np.minimum(duck[i0:], 1 - 0.65 * np.exp(-t / 0.11))
L += DUCK_BUS[0] * duck
R += DUCK_BUS[1] * duck
SEND[0] += DUCK_BUS[0] * duck * 0.25
SEND[1] += DUCK_BUS[1] * duck * 0.25

# reverb: decorrelated noise tail, pre-delay, darker as it decays
irt = tt(2.2)
ir = []
for ch in range(2):
    n = rng.standard_normal(len(irt)) * np.exp(-irt / 0.55)
    n = lp(n, 7000) * 0.7 + lp(n, 2500) * 0.3
    n = np.concatenate([np.zeros(int(0.022 * SR)), n])
    ir.append(n / np.sqrt(np.sum(n ** 2)))
wetL = signal.fftconvolve(hp(SEND[0], 250), ir[0])[:N]
wetR = signal.fftconvolve(hp(SEND[1], 250), ir[1])[:N]
L += wetL * 0.9
R += wetR * 0.9

mix = np.vstack([L, R])
mix = hp(mix, 28)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(1.5 * mix) / np.tanh(1.5)                     # glue / soft clip
fade = np.ones(N)
fade[int(14.55 * SR):] = np.linspace(1, 0, N - int(14.55 * SR)) ** 1.5
mix *= fade
mix *= 10 ** (-1.0 / 20) / np.max(np.abs(mix))              # -1 dBFS peak

out = sys.argv[1] if len(sys.argv) > 1 else 'out/music.wav'
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
print('wrote', out, f'{DUR}s', 'rms dBFS', round(20 * np.log10(np.sqrt(np.mean(mix ** 2))), 1))
