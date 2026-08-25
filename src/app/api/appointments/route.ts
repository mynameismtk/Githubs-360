import { z } from 'zod'
import { withApi } from '@/server/api'
import { bookAppointment } from '@/server/services/appointment-service'

const schema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  startAt: z.string().datetime(),
  consultationType: z.enum(['IN_PERSON', 'VIDEO', 'PHONE']).default('IN_PERSON'),
  reasonForVisit: z.string().max(500).optional().nullable(),
  followUpId: z.string().optional().nullable(),
})

export const POST = withApi(
  { roles: ['PATIENT', 'RECEPTIONIST', 'ADMIN'], body: schema, write: true, auditAction: 'appointment.book' },
  async ({ actor, body }) => {
    const appointment = await bookAppointment(actor, {
      patientId: body.patientId,
      doctorId: body.doctorId,
      startAt: new Date(body.startAt),
      consultationType: body.consultationType,
      reasonForVisit: body.reasonForVisit ?? null,
      followUpId: body.followUpId ?? null,
    })
    return {
      id: appointment.id,
      startAt: appointment.startAt.toISOString(),
      doctorName: appointment.doctor.user.fullName,
      specialityName: appointment.speciality.name,
      patientName: appointment.patient.fullName,
      locationName: appointment.location?.name ?? null,
    }
  },
)
