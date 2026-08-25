import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { listDoctors } from '@/server/services/doctor-service'
import { getSpecialities } from '@/server/services/clinic-service'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatMoney } from '@/lib/money'
import { formatDateTime } from '@/lib/dates'

export const dynamic = 'force-dynamic'

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', ml: 'Malayalam', ta: 'Tamil', hi: 'Hindi', kn: 'Kannada', te: 'Telugu',
}

export default async function OpsDoctorsPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')
  if (actor.role !== 'ADMIN') redirect('/ops')

  const [doctors, specialities] = await Promise.all([
    listDoctors(actor.clinicId),
    getSpecialities(actor.clinicId),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-title text-ink">Doctors &amp; departments</h1>
        <p className="mt-1 text-body-sm text-ink-muted">
          {doctors.length} doctors across {specialities.length} specialities
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-overline uppercase text-ink-muted">Specialities</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {specialities.map((s) => (
            <Card key={s.id}>
              <p className="text-body font-semibold text-ink">{s.name}</p>
              <p className="text-caption text-ink-muted">{s.department.name}</p>
              <p className="mt-2 text-caption text-ink-subtle tabular">
                {s._count.doctors} doctor{s._count.doctors === 1 ? '' : 's'}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-overline uppercase text-ink-muted">Doctors</h2>
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Doctor</th>
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Speciality</th>
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Languages</th>
                  <th scope="col" className="px-4 py-2.5 text-right text-overline uppercase text-ink-muted">Fee</th>
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Next free</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={d.name} src={d.photoUrl} size="sm" />
                        <div className="min-w-0">
                          <span className="block truncate text-body-sm font-medium text-ink">
                            Dr. {d.name}
                          </span>
                          <span className="block truncate text-caption text-ink-muted">
                            {d.qualifications}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-body-sm text-ink">{d.speciality.name}</td>
                    <td className="px-4 py-2.5 text-caption text-ink-muted">
                      {d.languages.map((l) => LANGUAGE_NAMES[l] ?? l).join(', ')}
                    </td>
                    <td className="px-4 py-2.5 text-right text-body-sm text-ink tabular">
                      {formatMoney(d.consultationFee)}
                    </td>
                    <td className="px-4 py-2.5">
                      {d.nextAvailableAt ? (
                        <span className="text-caption text-ink tabular">
                          {formatDateTime(d.nextAvailableAt)}
                        </span>
                      ) : (
                        <Badge tone="caution">No slots</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <Card>
        <p className="text-overline uppercase text-ink-muted">Arriving in the next release</p>
        <p className="mt-2 text-body-sm text-ink">
          Adding and editing doctors, departments, services, pricing and clinic branding ships with the
          operations release. Every one of these is already stored as configuration rather than code,
          so nothing here is hardcoded to this clinic.
        </p>
      </Card>
    </div>
  )
}
