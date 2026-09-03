import { z } from 'zod'
import { withAnkuraApi } from '@/server/ankura/api'
import { listReminders, createReminder } from '@/server/ankura/services/reminders-service'
import { errors } from '@/lib/errors'

const schema = z.object({
  drugName: z.string().min(1).max(80),
  dose: z.string().min(1).max(40),
  route: z.enum(['SUBCUTANEOUS', 'INTRAMUSCULAR', 'ORAL', 'VAGINAL']),
  isTrigger: z.boolean().default(false),
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a 24-hour time like 21:00.'),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  notes: z.string().max(300).optional().nullable(),
})

export const GET = withAnkuraApi({ auth: true }, async ({ actor }) => {
  if (!actor) throw errors.unauthenticated()
  return listReminders(actor.userId)
})

export const POST = withAnkuraApi({ auth: true, body: schema, write: true }, async ({ actor, body }) => {
  if (!actor) throw errors.unauthenticated()
  return createReminder(actor.userId, body)
})
