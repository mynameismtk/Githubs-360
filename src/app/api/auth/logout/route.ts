import { withApi } from '@/server/api'
import { destroySession } from '@/server/auth/session'
import { audit } from '@/server/audit'

export const POST = withApi({}, async ({ actor }) => {
  if (actor) {
    await audit({
      clinicId: actor.clinicId,
      actorId: actor.userId,
      actorRole: actor.role,
      actorName: actor.fullName,
      action: 'auth.signed_out',
    })
  }
  await destroySession()
  return { ok: true }
})
