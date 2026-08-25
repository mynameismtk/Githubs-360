/**
 * Date helpers.
 *
 * Instants are stored in UTC and rendered in the clinic's timezone. Recurring schedule
 * times are "HH:mm" wall-clock strings resolved against that timezone in exactly one
 * place — `wallTimeToInstant` below. docs/04 §7.
 */

export const CLINIC_TZ = process.env.CLINIC_TIMEZONE ?? 'Asia/Kolkata'

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: CLINIC_TZ, ...opts })

export const formatTime = (d: Date) => fmt({ hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
export const formatDate = (d: Date) => fmt({ day: 'numeric', month: 'short', year: 'numeric' }).format(d)
export const formatDateShort = (d: Date) => fmt({ day: 'numeric', month: 'short' }).format(d)
export const formatWeekday = (d: Date) => fmt({ weekday: 'short' }).format(d)
export const formatDayNum = (d: Date) => fmt({ day: 'numeric' }).format(d)
export const formatDateTime = (d: Date) =>
  fmt({ day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
export const formatLongDate = (d: Date) =>
  fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d)

/** "2026-08-26" in clinic-local time — the key we use for day grouping and @db.Date. */
export function clinicDateKey(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
  return parts
}

/** Midnight UTC for a "YYYY-MM-DD" key — the correct value for a @db.Date column. */
export function dateOnly(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`)
}

/** 0 = Sunday … 6 = Saturday, evaluated in clinic-local time (not server-local). */
export function clinicDayOfWeek(key: string): number {
  return new Date(`${key}T12:00:00.000Z`).getUTCDay()
}

/**
 * Resolve a clinic-local wall time ("09:20") on a given local date into a UTC instant.
 *
 * Implemented by probing the offset with Intl rather than hardcoding +05:30, so the same
 * code is correct if the clinic is ever configured to a DST-observing timezone.
 */
export function wallTimeToInstant(dateKey: string, hhmm: string): Date {
  const [h = '0', m = '0'] = hhmm.split(':')
  const naiveUtc = new Date(`${dateKey}T${h.padStart(2, '0')}:${m.padStart(2, '0')}:00.000Z`)
  const offsetMs = tzOffsetMs(naiveUtc)
  // Re-probe once: near a DST boundary the first offset can be off by an hour.
  const adjusted = new Date(naiveUtc.getTime() - offsetMs)
  const refined = tzOffsetMs(adjusted)
  return new Date(naiveUtc.getTime() - refined)
}

function tzOffsetMs(at: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: CLINIC_TZ,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const p = Object.fromEntries(dtf.formatToParts(at).map((x) => [x.type, x.value]))
  const asUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour) === 24 ? 0 : Number(p.hour),
    Number(p.minute),
    Number(p.second),
  )
  return asUtc - at.getTime()
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86_400_000)
}

export function addMinutes(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 60_000)
}

export function ageFromDob(dob: Date): number {
  const now = new Date()
  let age = now.getUTCFullYear() - dob.getUTCFullYear()
  const m = now.getUTCMonth() - dob.getUTCMonth()
  if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) age -= 1
  return Math.max(0, age)
}

/** Human age label — months matter for infants, years for everyone else. */
export function ageLabel(dob: Date): string {
  const years = ageFromDob(dob)
  if (years >= 2) return `${years} yrs`
  const months = Math.max(
    0,
    (new Date().getUTCFullYear() - dob.getUTCFullYear()) * 12 + (new Date().getUTCMonth() - dob.getUTCMonth()),
  )
  return `${months} mo`
}

/** "Today" / "Tomorrow" / "Tue, 26 Aug" — the phrasing patients actually scan for. */
export function relativeDayLabel(d: Date): string {
  const today = clinicDateKey(new Date())
  const target = clinicDateKey(d)
  if (target === today) return 'Today'
  if (target === clinicDateKey(addDays(new Date(), 1))) return 'Tomorrow'
  if (target === clinicDateKey(addDays(new Date(), -1))) return 'Yesterday'
  return fmt({ weekday: 'short', day: 'numeric', month: 'short' }).format(d)
}

export function greeting(now = new Date()): string {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: CLINIC_TZ, hour: 'numeric', hour12: false }).format(now))
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
