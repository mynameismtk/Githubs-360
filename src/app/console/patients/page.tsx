import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { PatientSearch } from './search'

export default async function PatientsPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')
  return (
    <div className="space-y-6">
      <h1 className="text-title text-ink">Patients</h1>
      <PatientSearch />
    </div>
  )
}
