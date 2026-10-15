# minimal soundfile stand-in (stdlib wave, 16-bit PCM) - the workspace has numpy but no scipy/soundfile
import wave, numpy as np
def read(p):
    with wave.open(p) as w:
        sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float64) / 32768.0
    return (x.reshape(-1, ch) if ch > 1 else x), sr
def write(p, x, sr):
    x = np.asarray(x); ch = 1 if x.ndim == 1 else x.shape[1]
    with wave.open(p, 'wb') as w:
        w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
