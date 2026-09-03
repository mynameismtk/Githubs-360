import { withAnkuraApi } from '@/server/ankura/api'
import { listTodayDoses } from '@/server/ankura/services/reminders-service'
import { errors } from '@/lib/errors'

export const GET = withAnkuraApi({ auth: true }, async ({ actor }) => {
  if (!actor) throw errors.unauthenticated()
  return listTodayDoses(actor.userId)
})
