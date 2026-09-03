import { z } from 'zod'
import { withAnkuraApi } from '@/server/ankura/api'
import { setBudget } from '@/server/ankura/services/costs-service'
import { errors } from '@/lib/errors'

const schema = z.object({ amount: z.number().int().nonnegative().max(1_00_00_000) })

export const POST = withAnkuraApi({ auth: true, body: schema, write: true }, async ({ actor, body }) => {
  if (!actor) throw errors.unauthenticated()
  return setBudget(actor.userId, body.amount)
})
