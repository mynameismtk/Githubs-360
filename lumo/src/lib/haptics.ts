/**
 * Soft haptics on completion. A big part of the felt reward.
 * Silently does nothing where the platform has no vibration motor.
 */
type Pattern = 'tap' | 'soft' | 'complete';

const PATTERNS: Record<Pattern, number | number[]> = {
  tap: 8,
  soft: 14,
  complete: [18, 70, 26],
};

export function haptic(kind: Pattern = 'tap') {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(PATTERNS[kind]);
    }
  } catch {
    /* no motor, no problem */
  }
}
