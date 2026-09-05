import { z } from 'zod'
import { withAnkuraApi } from '@/server/ankura/api'
import { requireStaffClinic, listProtocolTemplates, createProtocolTemplate } from '@/server/ankura/services/clinic-service'
import { errors } from '@/lib/errors'

const itemSchema = z.object({
  drugName: z.string().min(1).max(80),
  dose: z.string().min(1).max(40),
  route: z.enum(['SUBCUTANEOUS', 'INTRAMUSCULAR', 'ORAL', 'VAGINAL']),
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  isTrigger: z.boolean().default(false),
})
const schema = z.object({ name: z.string().min(1).max(120), items: z.array(itemSchema).min(1).max(20) })

export const GET = withAnkuraApi({ auth: true }, async ({ actor }) => {
  if (!actor || actor.role !== 'CLINIC_STAFF') throw errors.forbidden()
  const clinic = await requireStaffClinic(actor.clinicId)
  return listProtocolTemplates(clinic.id)
})

export const POST = withAnkuraApi({ auth: true, body: schema, write: true }, async ({ actor, body }) => {
  if (!actor || actor.role !== 'CLINIC_STAFF') throw errors.forbidden()
  const clinic = await requireStaffClinic(actor.clinicId)
  return createProtocolTemplate(clinic.id, body.name, body.items)
})
