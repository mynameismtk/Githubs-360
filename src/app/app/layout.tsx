import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { resolveActivePatientId, surfaceForRole } from '@/server/auth/policy'
import { getFamilyForActor } from '@/server/services/patient-service'
import { getClinic } from '@/server/services/clinic-service'
import { unreadCount } from '@/server/services/notification-service'
import { PatientShell } from '@/components/patterns/patient-shell'

/**
 * The patient surface.
 *
 * Enforces two things for every page beneath it:
 *   1. Only a PATIENT-role session may enter. A doctor who lands here is redirected to
 *      their own surface rather than shown an empty patient app.
 *   2. The active family member is resolved server-side from grants, so the header can
 *      never display a patient the user is not entitled to see. docs/06 §5.
 */
export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor()
  if (!actor) redirect('/login')
  if (actor.role !== 'PATIENT') redirect(surfaceForRole(actor.role))

  const [clinic, family, activePatientId, unread] = await Promise.all([
    getClinic(),
    getFamilyForActor(actor),
    resolveActivePatientId(actor),
    unreadCount(actor.userId),
  ])

  if (!activePatientId || family.length === 0) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-patient flex-col items-center justify-center px-6 text-center">
        <h1 className="text-title text-ink">Your profile isn&apos;t linked yet</h1>
        <p className="mt-2 text-body text-ink-muted">
          Please contact {clinic.name} so we can link your medical record to this account.
        </p>
        <a
          href={`tel:${clinic.supportPhone}`}
          className="mt-6 inline-flex h-11 items-center rounded-md bg-brand px-5 font-semibold text-white"
        >
          Call the clinic
        </a>
      </main>
    )
  }

  const active = family.find((m) => m.patient.id === activePatientId) ?? family[0]!

  return (
    <PatientShell
      clinic={{
        name: clinic.name,
        supportPhone: clinic.supportPhone,
        emergencyPhone: clinic.emergencyPhone,
        brandPrimary: clinic.brandPrimary,
        brandAccent: clinic.brandAccent,
        locations: clinic.locations.map((l) => ({
          id: l.id,
          name: l.name,
          mapsUrl: l.mapsUrl,
          latitude: l.latitude,
          longitude: l.longitude,
          phone: l.phone,
        })),
      }}
      family={family.map((m) => ({
        patientId: m.patient.id,
        name: m.patient.fullName,
        relationship: m.relationship,
        isSelf: m.isSelf,
        avatarUrl: m.patient.avatarUrl,
      }))}
      active={{
        patientId: active.patient.id,
        name: active.patient.fullName,
        relationship: active.relationship,
        isSelf: active.isSelf,
        avatarUrl: active.patient.avatarUrl,
      }}
      unreadCount={unread}
    >
      {children}
    </PatientShell>
  )
}
