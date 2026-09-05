import { withAnkuraApi } from '@/server/ankura/api'
import { destroyAnkuraSession } from '@/server/ankura/session'

export const POST = withAnkuraApi({ auth: true }, async () => {
  await destroyAnkuraSession()
  return { ok: true }
})
