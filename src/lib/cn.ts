/** Minimal class combiner. Falsy values are dropped; later classes are not deduped. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
