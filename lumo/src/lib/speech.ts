/**
 * Voice in and voice out.
 * Both are optional everywhere they appear: typing always works, and reading
 * always works. Neither feature ever blocks a screen.
 */

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text: string, rate = 0.82) {
  if (!canSpeak()) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* no voice available */
  }
}

export function hush() {
  if (canSpeak()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* nothing playing */
    }
  }
}

type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function recogniser(): SR | null {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export const canDictate = () => recogniser() !== null;

/** Returns a stop() function. onText fires with the running transcript. */
export function dictate(onText: (text: string) => void, onEnd?: () => void): () => void {
  const r = recogniser();
  if (!r) {
    onEnd?.();
    return () => {};
  }
  r.lang = navigator.language || 'en-GB';
  r.interimResults = true;
  r.continuous = true;
  r.onresult = (e) => {
    let text = '';
    for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
    onText(text.trim());
  };
  r.onerror = () => onEnd?.();
  r.onend = () => onEnd?.();
  try {
    r.start();
  } catch {
    onEnd?.();
  }
  return () => {
    try {
      r.stop();
    } catch {
      /* already stopped */
    }
  };
}
