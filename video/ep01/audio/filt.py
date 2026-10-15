# zero-phase Butterworth-magnitude filters applied in the frequency domain (no scipy here)
import numpy as np
def _apply(x, fc, sr, order, high):
    n = len(x); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / sr)
    r = (f / fc) ** (2 * order)
    H = np.sqrt(r / (1 + r)) if high else 1 / np.sqrt(1 + r)
    return np.fft.irfft(X * H, n)
def lp(x, fc, sr, order=2): return _apply(x, fc, sr, order, False)
def hp(x, fc, sr, order=2): return _apply(x, fc, sr, order, True)
