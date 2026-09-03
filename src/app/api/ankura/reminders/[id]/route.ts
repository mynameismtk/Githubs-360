import { withAnkuraApi } from '@/server/ankura/api'
import { deactivateReminder } from '@/server/ankura/services/reminders-service'
import { errors } from '@/lib/errors'

export const DELETE = withAnkuraApi({ auth: true, write: true }, async ({ actor, request }) => {
  if (!actor) throw errors.unauthenticated()
  const id = new URL(request.url).pathname.split('/').at(-1)!
  await deactivateReminder(actor.userId, id)
  return { ok: true }
})
