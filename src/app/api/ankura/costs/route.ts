import { z } from 'zod'
import { withAnkuraApi } from '@/server/ankura/api'
import { listCostEntries, createCostEntry, getBudget } from '@/server/ankura/services/costs-service'
import { errors } from '@/lib/errors'

const schema = z.object({
  category: z.enum(['CONSULTATION', 'MEDICATION', 'MONITORING', 'RETRIEVAL', 'ICSI', 'FREEZING', 'STORAGE', 'FET', 'TRAVEL', 'OTHER']),
  label: z.string().min(1).max(120),
  amount: z.number().int().positive().max(100_00_000),
  incurredAt: z.string().min(1),
  notes: z.string().max(300).optional().nullable(),
})

export const GET = withAnkuraApi({ auth: true }, async ({ actor }) => {
  if (!actor) throw errors.unauthenticated()
  const [entries, budget] = await Promise.all([listCostEntries(actor.userId), getBudget(actor.userId)])
  return { entries, budget }
})

export const POST = withAnkuraApi({ auth: true, body: schema, write: true }, async ({ actor, body }) => {
  if (!actor) throw errors.unauthenticated()
  return createCostEntry(actor.userId, body)
})
