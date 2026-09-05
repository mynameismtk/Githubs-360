import { z } from 'zod'
import { withAnkuraApi } from '@/server/ankura/api'
import { requireStaffClinic, listAnnouncements, createAnnouncement } from '@/server/ankura/services/clinic-service'
import { errors } from '@/lib/errors'

const schema = z.object({ title: z.string().min(1).max(120), body: z.string().min(1).max(2000), isPinned: z.boolean().default(false) })

export const GET = withAnkuraApi({ auth: true }, async ({ actor }) => {
  if (!actor || actor.role !== 'CLINIC_STAFF') throw errors.forbidden()
  const clinic = await requireStaffClinic(actor.clinicId)
  return listAnnouncements(clinic.id)
})

export const POST = withAnkuraApi({ auth: true, body: schema, write: true }, async ({ actor, body }) => {
  if (!actor || actor.role !== 'CLINIC_STAFF') throw errors.forbidden()
  const clinic = await requireStaffClinic(actor.clinicId)
  return createAnnouncement(clinic.id, body.title, body.body, body.isPinned)
})
