import { withApi } from '@/server/api'
import { getFamilyForActor } from '@/server/services/patient-service'
import { resolveActivePatientId } from '@/server/auth/policy'

export const GET = withApi({}, async ({ actor }) => {
  if (!actor) return { user: null }
  const family = actor.role === 'PATIENT' ? await getFamilyForActor(actor) : []
  return {
    user: {
      id: actor.userId,
      fullName: actor.fullName,
      role: actor.role,
      phone: actor.phone,
      locale: actor.locale,
    },
    activePatientId: actor.role === 'PATIENT' ? await resolveActivePatientId(actor) : null,
    family,
  }
})
