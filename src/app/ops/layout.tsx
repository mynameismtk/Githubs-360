import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { surfaceForRole } from '@/server/auth/policy'
import { getClinic } from '@/server/services/clinic-service'
import { StaffShell, type NavItem } from '@/components/patterns/staff-shell'
import type { Role } from '@prisma/client'

/**
 * Operations surface. Reception and admin share a shell but not a nav — an admin sees
 * management and analytics; reception does not (§41: analytics are not for ordinary staff).
 */
function navFor(role: Role): NavItem[] {
  const shared: NavItem[] = [
    { href: '/ops', label: 'Overview', exact: true },
    { href: '/ops/appointments', label: 'Appointments' },
    { href: '/ops/patients', label: 'Patients' },
  ]
  if (role === 'ADMIN') {
    return [...shared, { href: '/ops/doctors', label: 'Doctors' }, { href: '/ops/audit', label: 'Audit log' }]
  }
  return shared
}

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor()
  if (!actor) redirect('/login')
  if (!['RECEPTIONIST', 'ADMIN'].includes(actor.role)) redirect(surfaceForRole(actor.role))

  const clinic = await getClinic()
  return (
    <StaffShell
      productLabel={actor.role === 'ADMIN' ? 'Administration' : 'Front desk'}
      clinicName={clinic.name}
      user={{ fullName: actor.fullName, roleLabel: actor.role === 'ADMIN' ? 'Administrator' : 'Reception' }}
      nav={navFor(actor.role)}
    >
      {children}
    </StaffShell>
  )
}
