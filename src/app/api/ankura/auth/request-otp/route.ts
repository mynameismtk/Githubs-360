import { z } from 'zod'
import { withAnkuraApi } from '@/server/ankura/api'
import { ankuraRequestOtp } from '@/server/ankura/services/auth-service'
import { ankuraRequestMeta } from '@/server/ankura/session'

const schema = z.object({ phone: z.string().min(6).max(20) })

export const POST = withAnkuraApi({ body: schema }, async ({ body }) => {
  const meta = await ankuraRequestMeta()
  return ankuraRequestOtp(body.phone, { ip: meta.ip })
})
