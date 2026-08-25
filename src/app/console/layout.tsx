import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { surfaceForRole } from '@/server/auth/policy'
import { getClinic } from '@/server/services/clinic-service'
import { StaffShell, type NavItem } from '@/components/patterns/staff-shell'
import type { Role } from '@prisma/client'

const ROLE_LABEL: Record<string, string> = {
  DOCTOR: 'Doctor', NURSE: 'Nurse', LAB_TECH: 'Laboratory', PHARMACIST: 'Pharmacy',
}

/** Nav is per-role: a nurse has no reason to see the prescribing surface. */
function navFor(role: Role): NavItem[] {
  switch (role) {
    case 'DOCTOR':
      return [
        { href: '/console', label: 'Today', exact: true },
        { href: '/console/patients', label: 'Patients' },
        { href: '/console/schedule', label: 'My schedule' },
      ]
    case 'NURSE':
      return [
        { href: '/console', label: "Today's patients", exact: true },
        { href: '/console/patients', label: 'Patients' },
      ]
    case 'LAB_TECH':
      return [{ href: '/console', label: 'Lab orders', exact: true }]
    case 'PHARMACIST':
      return [{ href: '/console', label: 'Prescriptions', exact: true }]
    default:
      return [{ href: '/console', label: 'Today', exact: true }]
  }
}

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor()
  if (!actor) redirect('/login')
  if (!['DOCTOR', 'NURSE', 'LAB_TECH', 'PHARMACIST'].includes(actor.role)) {
    redirect(surfaceForRole(actor.role))
  }

  const clinic = await getClinic()
  return (
    <StaffShell
      productLabel="Clinical console"
      clinicName={clinic.name}
      user={{ fullName: actor.fullName, roleLabel: ROLE_LABEL[actor.role] ?? actor.role }}
      nav={navFor(actor.role)}
    >
      {children}
    </StaffShell>
  )
}
