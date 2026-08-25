import { z } from 'zod'
import { withApi } from '@/server/api'
import { setActivePatient } from '@/server/auth/session'
import { assertCanAccessPatient } from '@/server/auth/policy'
import { requireActor } from '@/server/auth/policy'

const schema = z.object({ patientId: z.string().min(1) })

/**
 * Switch the family member shown in the UI.
 *
 * The check here is not optional decoration: it is what stops a crafted request from
 * pinning the session to a patient the user has no grant over. Even so, nothing downstream
 * trusts the stored value — every read re-resolves it. Belt and braces, deliberately.
 */
export const POST = withApi({ roles: ['PATIENT'], body: schema, write: true }, async ({ actor, body }) => {
  const a = requireActor(actor)
  await assertCanAccessPatient(a, body.patientId, 'READ')
  await setActivePatient(a.sessionId, body.patientId)
  return { activePatientId: body.patientId }
})
