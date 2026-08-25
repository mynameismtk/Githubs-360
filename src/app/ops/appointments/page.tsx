import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getActor } from '@/server/auth/session'
import { getOpsOverview } from '@/server/services/console-service'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/states'
import { StatusBadge } from '@/components/patterns/appointment-status'
import { CheckInButton } from '../check-in-button'
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@/components/ui/icons'
import { formatTime, formatLongDate, ageLabel, addDays, clinicDateKey } from '@/lib/dates'

export const dynamic = 'force-dynamic'

export default async function OpsAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const { date } = await searchParams

  const dateKey = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : clinicDateKey(new Date())
  const { appointments } = await getOpsOverview(actor, dateKey)

  const anchor = new Date(`${dateKey}T12:00:00Z`)
  const prev = clinicDateKey(addDays(anchor, -1))
  const next = clinicDateKey(addDays(anchor, 1))

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-title text-ink">Appointments</h1>
          <p className="mt-1 text-body-sm text-ink-muted">{formatLongDate(anchor)}</p>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/ops/appointments?date=${prev}`}
            aria-label="Previous day"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-ink-muted hover:bg-surface-sunken"
          >
            <IconChevronLeft size={18} />
          </Link>
          <Link
            href="/ops/appointments"
            className="flex h-9 items-center rounded-md border border-border bg-surface px-3 text-body-sm font-semibold text-ink hover:bg-surface-sunken"
          >
            Today
          </Link>
          <Link
            href={`/ops/appointments?date=${next}`}
            aria-label="Next day"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-ink-muted hover:bg-surface-sunken"
          >
            <IconChevronRight size={18} />
          </Link>
        </div>
      </header>

      {appointments.length === 0 ? (
        <EmptyState
          icon={<IconCalendar size={26} />}
          title="Nothing booked on this day"
          body="Use the arrows above to look at another day."
        />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Time</th>
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Patient</th>
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Doctor</th>
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Reason</th>
                  <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Status</th>
                  <th scope="col" className="px-4 py-2.5 text-right text-overline uppercase text-ink-muted">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-body-sm font-semibold text-ink tabular">
                      {formatTime(a.startAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/ops/patients/${a.patient.id}`}
                        className="text-body-sm font-medium text-ink hover:text-brand-ink"
                      >
                        {a.patient.fullName}
                      </Link>
                      <span className="block text-caption text-ink-muted tabular">
                        {ageLabel(a.patient.dateOfBirth)} · {a.patient.mrn}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-body-sm text-ink">Dr. {a.doctor.user.fullName}</td>
                    <td className="max-w-[220px] px-4 py-2.5 text-body-sm text-ink-muted">
                      <span className="line-clamp-2">{a.reasonForVisit ?? '—'}</span>
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-2.5 text-right">
                      {a.status === 'CONFIRMED' || a.status === 'SCHEDULED' ? (
                        <CheckInButton appointmentId={a.id} patientName={a.patient.fullName} />
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
