import { z } from 'zod'
import { withAnkuraApi } from '@/server/ankura/api'
import { completeOnboarding } from '@/server/ankura/services/profile-service'
import { errors } from '@/lib/errors'

const schema = z.object({
  fullName: z.string().min(1).max(80),
  cycleType: z.enum(['IUI', 'IVF', 'FET', 'EGG_FREEZING']),
  cycleStage: z.enum(['STIMULATION', 'RETRIEVAL', 'TRANSFER', 'TWO_WEEK_WAIT', 'BETA_RESULT', 'PREGNANT', 'NOT_PREGNANT', 'PAUSED']),
  cycleStartedAt: z.string().optional().nullable(),
  clinicSlug: z.string().optional().nullable(),
})

export const POST = withAnkuraApi({ auth: true, body: schema, write: true }, async ({ actor, body }) => {
  if (!actor) throw errors.unauthenticated()
  await completeOnboarding(actor.userId, body)
  return { ok: true }
})
