import { NextResponse } from 'next/server'
import { getActor } from '@/server/auth/session'
import { getDoctorAvailability } from '@/server/services/availability-service'
import { clinicDateKey } from '@/lib/dates'
import { errors, toSafeError } from '@/lib/errors'
import { randomUUID } from 'node:crypto'

/**
 * Computed slot availability for one doctor (docs/02 TD-7).
 * Not wrapped by withApi because it reads dynamic route params.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = randomUUID()
  try {
    const actor = await getActor()
    if (!actor) throw errors.unauthenticated()

    const { id } = await params
    const url = new URL(request.url)
    const from = url.searchParams.get('from') ?? clinicDateKey(new Date())
    const days = Math.min(Math.max(Number(url.searchParams.get('days') ?? 14), 1), 60)

    if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) throw errors.validation('Invalid date.')

    const availability = await getDoctorAvailability(id, from, days)
    return NextResponse.json({
      data: availability.map((day) => ({
        dateKey: day.dateKey,
        availableCount: day.availableCount,
        slots: day.slots.map((s) => ({
          startAt: s.startAt.toISOString(),
          label: s.label,
          available: s.available,
        })),
      })),
    })
  } catch (e) {
    const error = toSafeError(e, correlationId)
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    )
  }
}
