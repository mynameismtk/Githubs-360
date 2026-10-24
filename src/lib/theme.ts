/**
 * Runtime clinic theming.
 *
 * Every brand token comes from the Clinic record and is injected once, on <html>, by the
 * root layout — so login, onboarding, the patient app and both consoles are all branded.
 * Tokens are emitted as RGB channels to match the token layer in globals.css.
 */

type ThemeSettings = {
  brandHover?: string
  brandInk?: string
  brandWash?: string
  accentWash?: string
}

const HEX = /^#[0-9a-fA-F]{6}$/

function channels(hex: string): string | null {
  if (!HEX.test(hex)) return null
  const h = hex.slice(1)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ')
}

export function clinicThemeStyle(clinic: {
  brandPrimary: string
  brandAccent: string
  settings: unknown
}): Record<string, string> {
  const theme = ((clinic.settings as { theme?: ThemeSettings } | null)?.theme ?? {}) as ThemeSettings
  const tokens: Record<string, string | undefined> = {
    brand: clinic.brandPrimary,
    accent: clinic.brandAccent,
    'brand-hover': theme.brandHover,
    'brand-ink': theme.brandInk,
    'brand-wash': theme.brandWash,
    'accent-wash': theme.accentWash,
  }
  const style: Record<string, string> = {}
  for (const [name, hex] of Object.entries(tokens)) {
    // An absent or malformed value keeps the platform default from globals.css.
    const value = hex ? channels(hex) : null
    if (value) style[`--${name}-rgb`] = value
  }
  return style
}

/** The MRN prefix is clinic configuration, never a platform constant. */
export function mrnPrefix(settings: unknown): string {
  const prefix = (settings as { mrnPrefix?: unknown } | null)?.mrnPrefix
  return typeof prefix === 'string' && prefix.length > 0 ? prefix : 'MRN-'
}
