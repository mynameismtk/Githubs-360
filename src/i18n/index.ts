import { en, type Messages } from './en'

/**
 * Locales the architecture is built for. Only `en` is populated today; the rest resolve
 * to English until their catalogues land, which is a visible fallback rather than a
 * broken screen.
 */
export const SUPPORTED_LOCALES = ['en', 'ml', 'ta', 'hi', 'kn', 'te'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ml: 'മലയാളം',
  ta: 'தமிழ்',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
  te: 'తెలుగు',
}

const catalogues: Partial<Record<Locale, Messages>> = { en }

/** Dot-path keys, typed all the way down: t('home.nextAppointment') autocompletes. */
type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>
}[keyof T & string]

export type MessageKey = Leaves<Messages>

export function getMessages(locale: string): Messages {
  return catalogues[locale as Locale] ?? en
}

export function translator(locale: string) {
  const messages = getMessages(locale)
  return function t(key: MessageKey): string {
    const value = key.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object' && part in acc) return (acc as Record<string, unknown>)[part]
      return undefined
    }, messages)
    // A missing key is loud in development and harmless in production.
    if (typeof value !== 'string') {
      if (process.env.NODE_ENV !== 'production') console.warn(`[i18n] missing key: ${key}`)
      return key
    }
    return value
  }
}

export const t = translator('en')
