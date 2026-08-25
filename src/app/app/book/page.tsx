import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { resolveActivePatientId } from '@/server/auth/policy'
import { getClinic, getSpecialities } from '@/server/services/clinic-service'
import { listDoctors } from '@/server/services/doctor-service'
import { getFamilyForActor } from '@/server/services/patient-service'
import { db } from '@/server/db'
import { BookingFlow } from './booking-flow'

export const dynamic = 'force-dynamic'

/**
 * Booking (§5).
 *
 * All the reference data the flow needs is loaded once on the server, so stepping
 * between speciality → doctor → date is instant. Only the slot query — which must be
 * live — goes over the network as the patient moves through it.
 */
export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ specialityId?: string; doctorId?: string; followUpId?: string }>
}) {
  const actor = await getActor()
  if (!actor) redirect('/login')

  const params = await searchParams
  const activePatientId = await resolveActivePatientId(actor)
  if (!activePatientId) redirect('/app/profile')

  const [clinic, specialities, doctors, family] = await Promise.all([
    getClinic(),
    getSpecialities(actor.clinicId),
    listDoctors(actor.clinicId),
    getFamilyForActor(actor),
  ])

  // A follow-up pre-selects its doctor and carries the reason through, so rebooking with
  // the same doctor is genuinely one tap from the home card (§13).
  const followUp = params.followUpId
    ? await db.followUp.findFirst({
        where: { id: params.followUpId, patientId: { in: family.map((f) => f.patient.id) }, status: 'PENDING' },
        select: { id: true, reason: true, doctorId: true, patientId: true, specialityId: true },
      })
    : null

  return (
    <BookingFlow
      clinicName={clinic.name}
      supportPhone={clinic.supportPhone}
      specialities={specialities.map((s) => ({
        id: s.id,
        name: s.name,
        blurb: s.patientBlurb,
        iconKey: s.iconKey,
        preparationNotes: s.preparationNotes,
        doctorCount: s._count.doctors,
      }))}
      doctors={doctors.map((d) => ({
        id: d.id,
        name: d.name,
        specialityId: d.speciality.id,
        specialityName: d.speciality.name,
        qualifications: d.qualifications,
        yearsExperience: d.yearsExperience,
        languages: d.languages,
        consultationFee: d.consultationFee,
        photoUrl: d.photoUrl,
        nextAvailableAt: d.nextAvailableAt ? d.nextAvailableAt.toISOString() : null,
      }))}
      family={family.map((f) => ({
        patientId: f.patient.id,
        name: f.patient.fullName,
        relationship: f.relationship,
        isSelf: f.isSelf,
        canBook: f.level === 'FULL',
      }))}
      defaultPatientId={followUp?.patientId ?? activePatientId}
      preselect={{
        specialityId: followUp?.specialityId ?? params.specialityId ?? null,
        doctorId: followUp?.doctorId ?? params.doctorId ?? null,
        followUpId: followUp?.id ?? null,
        reason: followUp?.reason ?? null,
      }}
    />
  )
}
