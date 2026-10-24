import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { getClinic } from '@/server/services/clinic-service'
import { mrnPrefix } from '@/lib/theme'
import { PatientSearch } from './search'

export default async function PatientsPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const clinic = await getClinic()
  return (
    <div className="space-y-6">
      <h1 className="text-title text-ink">Patients</h1>
      <PatientSearch mrnPrefix={mrnPrefix(clinic.settings)} />
    </div>
  )
}
