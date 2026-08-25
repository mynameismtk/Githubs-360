import { z } from 'zod'
import { withApi } from '@/server/api'
import { requestOtp } from '@/server/services/auth-service'
import { getClinic } from '@/server/services/clinic-service'
import { requestMeta } from '@/server/auth/session'

const schema = z.object({ phone: z.string().min(6).max(20) })

export const POST = withApi({ body: schema }, async ({ body }) => {
  const clinic = await getClinic()
  const meta = await requestMeta()
  return requestOtp(clinic.id, body.phone, { ip: meta.ip })
})
