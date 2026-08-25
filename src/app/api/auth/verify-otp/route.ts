import { z } from 'zod'
import { withApi } from '@/server/api'
import { verifyOtpAndSignIn } from '@/server/services/auth-service'
import { requestMeta } from '@/server/auth/session'
import { surfaceForRole } from '@/server/auth/policy'
import type { Role } from '@prisma/client'

const schema = z.object({
  challengeId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code.'),
})

export const POST = withApi({ body: schema }, async ({ body }) => {
  const meta = await requestMeta()
  const { userId, role } = await verifyOtpAndSignIn(body.challengeId, body.code, meta)
  return { userId, role, redirectTo: surfaceForRole(role as Role) }
})
