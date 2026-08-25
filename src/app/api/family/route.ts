import { z } from 'zod'
import { withApi } from '@/server/api'
import { addFamilyMember, getFamilyForActor } from '@/server/services/patient-service'
import { requireActor } from '@/server/auth/policy'

const schema = z.object({
  fullName: z.string().min(2, 'Please enter their full name.').max(120),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date of birth.'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED']),
  relationship: z.enum(['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT', 'GUARDIAN', 'OTHER']),
  phone: z.string().max(20).optional().nullable(),
})

export const GET = withApi({ roles: ['PATIENT'] }, async ({ actor }) => {
  return getFamilyForActor(requireActor(actor))
})

export const POST = withApi(
  { roles: ['PATIENT'], body: schema, write: true, auditAction: 'family.member.add' },
  async ({ actor, body }) => {
    const result = await addFamilyMember(requireActor(actor), {
      fullName: body.fullName,
      dateOfBirth: new Date(`${body.dateOfBirth}T00:00:00.000Z`),
      gender: body.gender,
      relationship: body.relationship,
      phone: body.phone ?? null,
    })
    return {
      patientId: result.patient.id,
      fullName: result.patient.fullName,
      mrn: result.patient.mrn,
      requiresConfirmation: result.requiresConfirmation,
    }
  },
)
