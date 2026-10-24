import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { getClinic } from '@/server/services/clinic-service'
import { mrnPrefix } from '@/lib/theme'
import { OpsPatientSearch } from './search'

export default async function OpsPatientsPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const clinic = await getClinic()
  return (
    <div className="space-y-6">
      <h1 className="text-title text-ink">Patients</h1>
      <OpsPatientSearch mrnPrefix={mrnPrefix(clinic.settings)} />
    </div>
  )
}
