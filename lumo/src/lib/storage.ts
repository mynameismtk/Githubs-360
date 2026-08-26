/**
 * Local persistence. Everything the user records stays on this device.
 * There is no server, no account and no sync. If localStorage is unavailable
 * (private mode in some browsers) the app still runs, in memory, for the session.
 */

const KEY = 'lumo.v1';

export function loadRaw<T>(): T | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveRaw(value: unknown) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* out of quota or blocked — the session still works */
  }
}

export function wipe() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
