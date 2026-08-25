import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { resolveActivePatientId } from '@/server/auth/policy'
import { listPatientAppointments } from '@/server/services/appointment-service'
import { CardLink, SectionHeader } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/states'
import { LinkButton } from '@/components/ui/button'
import { IconCalendar, IconChevronRight, IconPlus } from '@/components/ui/icons'
import { StatusBadge } from '@/components/patterns/appointment-status'
import { formatTime, relativeDayLabel, formatDate } from '@/lib/dates'
import type { AppointmentView } from '@/server/services/appointment-service'

export const dynamic = 'force-dynamic'

export default async function AppointmentsPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const patientId = await resolveActivePatientId(actor)
  if (!patientId) redirect('/app/profile')

  const [upcoming, past] = await Promise.all([
    listPatientAppointments(actor, patientId, 'upcoming'),
    listPatientAppointments(actor, patientId, 'past'),
  ])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-title text-ink">Appointments</h1>
        <LinkButton href="/app/book" size="sm">
          <IconPlus size={16} />
          Book
        </LinkButton>
      </div>

      <section>
        <SectionHeader title="Upcoming" />
        {upcoming.length === 0 ? (
          <EmptyState
            icon={<IconCalendar size={28} />}
            title="Nothing scheduled yet"
            body="Book your next consultation and it will appear here."
            action={{ label: 'Book an appointment', href: '/app/book' }}
          />
        ) : (
          <ul className="space-y-2.5">
            {upcoming.map((a) => (
              <li key={a.id}>
                <AppointmentRow appointment={a} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionHeader title="Past" />
        {past.length === 0 ? (
          <EmptyState title="No past visits yet" body="Your visit history will appear here." />
        ) : (
          <ul className="space-y-2.5">
            {past.slice(0, 20).map((a) => (
              <li key={a.id}>
                <AppointmentRow appointment={a} past />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function AppointmentRow({ appointment: a, past = false }: { appointment: AppointmentView; past?: boolean }) {
  return (
    <CardLink href={`/app/appointments/${a.id}`} padded={false}>
      <div className="flex items-center gap-3.5 p-4">
        <Avatar name={a.doctor.user.fullName} src={a.doctor.photoUrl} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-semibold text-ink">Dr. {a.doctor.user.fullName}</p>
          <p className="truncate text-body-sm text-ink-muted">{a.speciality.name}</p>
          <p className="mt-1.5 text-body-sm font-semibold text-ink tabular">
            {past ? formatDate(a.startAt) : relativeDayLabel(a.startAt)} · {formatTime(a.startAt)}
          </p>
          <div className="mt-2">
            <StatusBadge status={a.status} />
          </div>
        </div>
        <IconChevronRight size={18} className="shrink-0 text-ink-subtle" />
      </div>
    </CardLink>
  )
}
