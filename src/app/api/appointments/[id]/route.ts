import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { getActor } from '@/server/auth/session'
import { cancelAppointment, rescheduleAppointment, checkInAppointment } from '@/server/services/appointment-service'
import { errors, toSafeError } from '@/lib/errors'

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel'), reason: z.string().max(300).optional() }),
  z.object({ action: z.literal('reschedule'), startAt: z.string().datetime() }),
  z.object({ action: z.literal('check-in') }),
])

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = randomUUID()
  try {
    const actor = await getActor()
    if (!actor) throw errors.unauthenticated()

    const { id } = await params
    const parsed = schema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) throw errors.validation('That action is not valid.')

    switch (parsed.data.action) {
      case 'cancel': {
        const result = await cancelAppointment(actor, id, parsed.data.reason)
        return NextResponse.json({ data: { id: result.id, status: result.status } })
      }
      case 'reschedule': {
        const result = await rescheduleAppointment(actor, id, new Date(parsed.data.startAt))
        return NextResponse.json({ data: { id: result.id, startAt: result.startAt.toISOString() } })
      }
      case 'check-in': {
        const result = await checkInAppointment(actor, id)
        return NextResponse.json({ data: { id: result.id, status: result.status } })
      }
    }
  } catch (e) {
    const error = toSafeError(e, correlationId)
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status })
  }
}
