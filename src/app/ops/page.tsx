import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getActor } from '@/server/auth/session'
import { getOpsOverview } from '@/server/services/console-service'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/states'
import { StatusBadge } from '@/components/patterns/appointment-status'
import { Avatar } from '@/components/ui/avatar'
import { CheckInButton } from './check-in-button'
import { IconCalendar } from '@/components/ui/icons'
import { formatTime, formatLongDate, ageLabel } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import { cn } from '@/lib/cn'

export const dynamic = 'force-dynamic'

export default async function OpsOverviewPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')

  const { dateKey, appointments, stats } = await getOpsOverview(actor)
  const isAdmin = actor.role === 'ADMIN'

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-title text-ink">Today</h1>
        <p className="mt-1 text-body-sm text-ink-muted">
          {formatLongDate(new Date(`${dateKey}T12:00:00Z`))}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Appointments today" value={String(stats.appointmentsToday)} />
        <Stat label="Checked in" value={String(stats.checkedIn)} highlight={stats.checkedIn > 0} />
        <Stat label="Completed" value={String(stats.completed)} />
        <Stat label="Cancelled / missed" value={String(stats.cancelled)} />
        {/*
          Revenue and outstanding balances are administrator-only (§41). Reception needs
          to run the desk, not to see the clinic's finances.
        */}
        {isAdmin ? (
          <>
            <Stat label="Collected today" value={formatMoney(stats.revenueTodayPaise)} />
            <Stat
              label="Outstanding"
              value={formatMoney(stats.outstandingPaise)}
              sub={`${stats.outstandingCount} invoice${stats.outstandingCount === 1 ? '' : 's'}`}
            />
            <Stat label="Registered patients" value={String(stats.patientCount)} />
            <Stat label="Active doctors" value={String(stats.doctorCount)} />
          </>
        ) : (
          <Stat label="Lab orders pending" value={String(stats.pendingLabs)} />
        )}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-overline uppercase text-ink-muted">Day board</h2>
          <Link href="/ops/appointments" className="text-body-sm font-semibold text-brand-ink">
            All appointments
          </Link>
        </div>
        {appointments.length === 0 ? (
          <EmptyState
            icon={<IconCalendar size={26} />}
            title="Nothing booked today"
            body="Appointments booked for today will appear here."
          />
        ) : (
          <Card padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Time</th>
                    <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Patient</th>
                    <th scope="col" className="px-4 py-2.5 text-overline uppercase text-ink-muted">Doctor</th>
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
                        <div className="flex items-center gap-2.5">
                          <Avatar name={a.patient.fullName} size="sm" />
                          <div className="min-w-0">
                            <Link
                              href={`/ops/patients/${a.patient.id}`}
                              className="block truncate text-body-sm font-medium text-ink hover:text-brand-ink"
                            >
                              {a.patient.fullName}
                            </Link>
                            <span className="block text-caption text-ink-muted tabular">
                              {ageLabel(a.patient.dateOfBirth)} · {a.patient.mrn}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-body-sm text-ink">
                        Dr. {a.doctor.user.fullName}
                        <span className="block text-caption text-ink-muted">{a.speciality.name}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={a.status} />
                      </td>
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
      </section>
    </div>
  )
}

function Stat({
  label, value, sub, highlight,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <Card className={cn(highlight && 'border-brand/30 bg-brand-wash')}>
      <p className="text-overline uppercase text-ink-muted">{label}</p>
      <p className="mt-1 text-title text-ink tabular">{value}</p>
      {sub ? <p className="text-caption text-ink-muted">{sub}</p> : null}
    </Card>
  )
}
