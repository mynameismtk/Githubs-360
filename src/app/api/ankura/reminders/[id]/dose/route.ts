import { z } from 'zod'
import { withAnkuraApi } from '@/server/ankura/api'
import { logDose } from '@/server/ankura/services/reminders-service'
import { errors } from '@/lib/errors'

const schema = z.object({
  scheduledFor: z.string().min(1),
  outcome: z.enum(['TAKEN', 'SKIPPED', 'MISSED']),
})

export const POST = withAnkuraApi({ auth: true, body: schema, write: true }, async ({ actor, body, request }) => {
  if (!actor) throw errors.unauthenticated()
  const id = new URL(request.url).pathname.split('/').at(-2)!
  return logDose(actor.userId, id, body.scheduledFor, body.outcome)
})
