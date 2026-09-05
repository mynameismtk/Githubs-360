import { z } from 'zod'
import { withAnkuraApi } from '@/server/ankura/api'
import { ankuraVerifyOtpAndSignIn } from '@/server/ankura/services/auth-service'
import { ankuraRequestMeta } from '@/server/ankura/session'

const schema = z.object({
  challengeId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code.'),
})

export const POST = withAnkuraApi({ body: schema }, async ({ body }) => {
  const meta = await ankuraRequestMeta()
  const { isNewUser, onboardedAt, role } = await ankuraVerifyOtpAndSignIn(body.challengeId, body.code, meta)
  return {
    isNewUser,
    redirectTo: role === 'CLINIC_STAFF' ? '/ankura/clinic' : onboardedAt ? '/ankura/home' : '/ankura/onboarding',
  }
})
