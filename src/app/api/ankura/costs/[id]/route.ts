import { withAnkuraApi } from '@/server/ankura/api'
import { deleteCostEntry } from '@/server/ankura/services/costs-service'
import { errors } from '@/lib/errors'

export const DELETE = withAnkuraApi({ auth: true, write: true }, async ({ actor, request }) => {
  if (!actor) throw errors.unauthenticated()
  const id = new URL(request.url).pathname.split('/').at(-1)!
  await deleteCostEntry(actor.userId, id)
  return { ok: true }
})
