/** Keeps the screen on during a timer or a sit. Fails quietly where unsupported. */
type Sentinel = { release: () => Promise<void> };
let lock: Sentinel | null = null;

export async function keepAwake() {
  try {
    const wl = (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<Sentinel> } }).wakeLock;
    if (!wl) return;
    lock = await wl.request('screen');
  } catch {
    /* denied or unsupported */
  }
}

export async function releaseAwake() {
  try {
    await lock?.release();
  } catch {
    /* already released */
  }
  lock = null;
}
