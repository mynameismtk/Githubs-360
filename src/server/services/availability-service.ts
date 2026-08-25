import 'server-only'
import { db } from '../db'
import { clinicDateKey, clinicDayOfWeek, dateOnly, wallTimeToInstant, addMinutes, addDays } from '@/lib/dates'

/**
 * Slot availability.
 *
 * Slots are COMPUTED from (recurring rules + exceptions − booked appointments), never
 * stored. docs/02 TD-7 explains why: a stored slot table makes every schedule change a
 * bulk rewrite and every schedule bug a data-corruption bug.
 */

export interface Slot {
  /** UTC instant. */
  startAt: Date
  endAt: Date
  /** "10:20 AM" pre-rendered in clinic time so the client does no timezone maths. */
  label: string
  available: boolean
  locationId: string
}

export interface DayAvailability {
  /** "2026-08-26" in clinic-local time. */
  dateKey: string
  slots: Slot[]
  availableCount: number
}

function timeToMinutes(hhmm: string): number {
  const [h = '0', m = '0'] = hhmm.split(':')
  return Number(h) * 60 + Number(m)
}

function minutesToTime(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Availability for one doctor across a date range.
 *
 * One query for rules, one for exceptions, one for booked appointments across the whole
 * range — not one per day. The booking calendar shows a fortnight at a time, and N+1
 * queries there would be immediately felt.
 */
export async function getDoctorAvailability(
  doctorId: string,
  fromDateKey: string,
  days: number,
): Promise<DayAvailability[]> {
  const doctor = await db.doctor.findUnique({
    where: { id: doctorId },
    select: { id: true, slotDurationMins: true, bookingHorizonDays: true, isActive: true, acceptsNewPatients: true },
  })
  if (!doctor || !doctor.isActive) return []

  const rangeStart = new Date(`${fromDateKey}T00:00:00.000Z`)
  const dateKeys = Array.from({ length: days }, (_, i) => clinicDateKey(addDays(rangeStart, i)))
  const firstKey = dateKeys[0]!
  const lastKey = dateKeys[dateKeys.length - 1]!

  const [rules, exceptions, booked] = await Promise.all([
    db.doctorScheduleRule.findMany({
      where: { doctorId, isActive: true },
      select: {
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        locationId: true,
        consultationType: true,
        maxAppointments: true,
        effectiveFrom: true,
        effectiveTo: true,
      },
    }),
    db.scheduleException.findMany({
      where: { doctorId, date: { gte: dateOnly(firstKey), lte: dateOnly(lastKey) } },
      select: { date: true, isAvailable: true, startTime: true, endTime: true },
    }),
    db.appointment.findMany({
      where: {
        doctorId,
        startAt: { gte: wallTimeToInstant(firstKey, '00:00'), lt: wallTimeToInstant(lastKey, '23:59') },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      select: { startAt: true },
    }),
  ])

  const bookedInstants = new Set(booked.map((a) => a.startAt.getTime()))
  const exceptionsByDate = new Map<string, typeof exceptions>()
  for (const ex of exceptions) {
    const key = clinicDateKey(ex.date)
    const list = exceptionsByDate.get(key) ?? []
    list.push(ex)
    exceptionsByDate.set(key, list)
  }

  const now = new Date()
  const horizonEnd = addDays(now, doctor.bookingHorizonDays)

  return dateKeys.map((dateKey) => {
    const dow = clinicDayOfWeek(dateKey)
    const dayExceptions = exceptionsByDate.get(dateKey) ?? []

    // A full-day block (no times given) removes the day entirely.
    if (dayExceptions.some((e) => !e.isAvailable && !e.startTime)) {
      return { dateKey, slots: [], availableCount: 0 }
    }

    const dayStart = dateOnly(dateKey)
    const applicableRules = rules.filter(
      (r) =>
        r.dayOfWeek === dow &&
        r.effectiveFrom <= addDays(dayStart, 1) &&
        (!r.effectiveTo || r.effectiveTo >= dayStart),
    )

    // Extra clinics added by exception participate exactly like a rule for that day.
    const extraWindows = dayExceptions
      .filter((e) => e.isAvailable && e.startTime && e.endTime)
      .map((e) => ({
        startTime: e.startTime!,
        endTime: e.endTime!,
        locationId: applicableRules[0]?.locationId ?? '',
      }))

    const blockedWindows = dayExceptions
      .filter((e) => !e.isAvailable && e.startTime && e.endTime)
      .map((e) => ({ from: timeToMinutes(e.startTime!), to: timeToMinutes(e.endTime!) }))

    const windows = [
      ...applicableRules.map((r) => ({ startTime: r.startTime, endTime: r.endTime, locationId: r.locationId })),
      ...extraWindows,
    ]

    const slots: Slot[] = []
    for (const w of windows) {
      if (!w.locationId) continue
      const from = timeToMinutes(w.startTime)
      const to = timeToMinutes(w.endTime)
      for (let m = from; m + doctor.slotDurationMins <= to; m += doctor.slotDurationMins) {
        if (blockedWindows.some((b) => m >= b.from && m < b.to)) continue

        const startAt = wallTimeToInstant(dateKey, minutesToTime(m))
        const endAt = addMinutes(startAt, doctor.slotDurationMins)

        // Past slots and slots beyond the booking horizon are shown as unavailable
        // rather than hidden, so the day's shape stays legible.
        const inPast = startAt <= now
        const beyondHorizon = startAt > horizonEnd
        const taken = bookedInstants.has(startAt.getTime())

        slots.push({
          startAt,
          endAt,
          label: new Intl.DateTimeFormat('en-IN', {
            timeZone: process.env.CLINIC_TIMEZONE ?? 'Asia/Kolkata',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }).format(startAt),
          available: !inPast && !beyondHorizon && !taken && doctor.acceptsNewPatients,
          locationId: w.locationId,
        })
      }
    }

    slots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    return { dateKey, slots, availableCount: slots.filter((s) => s.available).length }
  })
}

/**
 * "Available today / tomorrow / this week" summaries for the doctor list (§5).
 * Computed for many doctors in one pass so the directory does not fan out into N
 * availability queries.
 */
export async function getNextAvailableByDoctor(
  doctorIds: string[],
  withinDays = 14,
): Promise<Map<string, Date | null>> {
  const result = new Map<string, Date | null>()
  if (doctorIds.length === 0) return result

  const todayKey = clinicDateKey(new Date())
  await Promise.all(
    doctorIds.map(async (id) => {
      const days = await getDoctorAvailability(id, todayKey, withinDays)
      const firstFree = days.flatMap((d) => d.slots).find((s) => s.available)
      result.set(id, firstFree?.startAt ?? null)
    }),
  )
  return result
}
