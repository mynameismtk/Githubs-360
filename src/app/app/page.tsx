import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { resolveActivePatientId } from '@/server/auth/policy'
import { getPatientHome } from '@/server/services/home-service'
import { getClinic } from '@/server/services/clinic-service'
import { Card, CardLink, SectionHeader } from '@/components/ui/card'
import { Badge, Dot } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/states'
import { LinkButton } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import {
  IconCalendar, IconPin, IconChevronRight, IconPill, IconFlask,
  IconCard, IconRecords, IconStethoscope, IconCheck, IconClock,
} from '@/components/ui/icons'
import { greeting, formatTime, relativeDayLabel } from '@/lib/dates'
import { cn } from '@/lib/cn'

// The home screen must be current, not cached — a stale "next appointment" is worse
// than a slow one.
export const dynamic = 'force-dynamic'

/**
 * Patient home (§4).
 *
 * Ordered so the patient understands their situation in three seconds: who they are,
 * what is next, what needs attention today, then everything else.
 */
export default async function HomePage() {
  const actor = await getActor()
  if (!actor) redirect('/login')

  const patientId = await resolveActivePatientId(actor)
  if (!patientId) redirect('/app/profile')

  const [home, clinic] = await Promise.all([getPatientHome(actor, patientId), getClinic()])
  const { nextAppointment: next } = home
  const firstName = home.patient.fullName.split(' ')[0]

  return (
    <div className="space-y-8">
      <header>
        <p className="text-body text-ink-muted">{greeting()},</p>
        <h1 className="text-display text-ink">{firstName}</h1>
      </header>

      {/* ── Next appointment ─────────────────────────────────────────────── */}
      <section aria-labelledby="next-appt">
        <SectionHeader title="Next appointment" />
        {next ? (
          <Card padded={false} className="overflow-hidden">
            <div className="flex items-start gap-3.5 p-5">
              <Avatar name={next.doctor.user.fullName} src={next.doctor.photoUrl} size="md" />
              <div className="min-w-0 flex-1">
                <h3 id="next-appt" className="truncate text-subheading text-ink">
                  Dr. {next.doctor.user.fullName}
                </h3>
                <p className="truncate text-body-sm text-ink-muted">{next.speciality.name}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-body font-semibold text-ink">
                    <IconCalendar size={16} className="text-brand" />
                    {relativeDayLabel(next.startAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-body font-semibold text-ink tabular">
                    <IconClock size={16} className="text-brand" />
                    {formatTime(next.startAt)}
                  </span>
                </div>
                {next.location ? (
                  <p className="mt-2 flex items-start gap-1.5 text-body-sm text-ink-muted">
                    <IconPin size={15} className="mt-0.5 shrink-0" />
                    <span>{next.location.name}</span>
                  </p>
                ) : null}
                {next.status === 'CHECKED_IN' ? (
                  <div className="mt-3">
                    <Badge tone="positive" icon={<IconCheck size={13} />}>
                      Checked in
                    </Badge>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
              <Link
                href={`/app/appointments/${next.id}`}
                className="flex h-12 items-center justify-center text-body-sm font-semibold text-brand-ink"
              >
                View appointment
              </Link>
              <a
                href={
                  next.location?.mapsUrl ??
                  `https://maps.google.com/?q=${encodeURIComponent(next.location?.addressLine1 ?? clinic.name)}`
                }
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center text-body-sm font-semibold text-brand-ink"
              >
                Get directions
              </a>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={<IconCalendar size={28} />}
            title="Nothing scheduled yet"
            body="Book your next consultation and it will appear here."
            action={{ label: 'Book an appointment', href: '/app/book' }}
          />
        )}
      </section>

      {/* ── Your health today ────────────────────────────────────────────── */}
      {home.healthToday.length > 0 ? (
        <section aria-labelledby="health-today">
          <SectionHeader title="Your health today" />
          <ul className="space-y-2.5">
            {home.healthToday.map((item) => (
              <li key={item.key}>
                <CardLink href={item.href} padded={false}>
                  <div className="flex items-center gap-3.5 p-4">
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        item.tone === 'brand' && 'bg-brand-wash text-brand',
                        item.tone === 'positive' && 'bg-[var(--positive-wash)] text-[var(--positive)]',
                        item.tone === 'caution' && 'bg-[var(--caution-wash)] text-[var(--caution)]',
                        item.tone === 'critical' && 'bg-[var(--critical-wash)] text-[var(--critical)]',
                      )}
                    >
                      {item.key === 'medicines' ? <IconPill size={20} /> : null}
                      {item.key === 'lab-report' ? <IconFlask size={20} /> : null}
                      {item.key === 'follow-up' ? <IconStethoscope size={20} /> : null}
                      {item.key === 'payment' ? <IconCard size={20} /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-semibold text-ink">{item.label}</span>
                      <span className="block truncate text-body-sm text-ink-muted">{item.detail}</span>
                    </span>
                    <IconChevronRight size={18} className="shrink-0 text-ink-subtle" />
                  </div>
                </CardLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <section aria-labelledby="quick-actions">
        <SectionHeader title="Quick actions" />
        <div className="grid grid-cols-2 gap-2.5">
          <QuickAction href="/app/book" icon={<IconCalendar size={20} />} label="Book appointment" primary />
          <QuickAction href="/app/records" icon={<IconRecords size={20} />} label="View records" />
          <QuickAction href="/app/records/lab-reports" icon={<IconFlask size={20} />} label="Lab reports" />
          <QuickAction href="/app/records/prescriptions" icon={<IconPill size={20} />} label="Prescriptions" />
        </div>
      </section>

      {/* ── Care journeys ────────────────────────────────────────────────── */}
      {home.journeys.length > 0 ? (
        <section aria-labelledby="care-journey">
          <SectionHeader title="Your care journey" />
          <ul className="space-y-3">
            {home.journeys.map((journey) => (
              <li key={journey.id}>
                <Card>
                  <h3 className="text-subheading text-ink">{journey.name}</h3>
                  <ol className="mt-4 space-y-3">
                    {journey.steps.map((step) => (
                      <li key={step.id} className="flex items-center gap-3">
                        {/*
                          Step state is a shape AND a label, never colour alone:
                          filled check = done, ring = in progress, hollow = pending (§24).
                        */}
                        <span
                          aria-hidden
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                            step.status === 'COMPLETED' && 'border-brand bg-brand text-white',
                            step.status === 'IN_PROGRESS' && 'border-brand bg-brand-wash',
                            step.status === 'PENDING' && 'border-border-strong bg-surface',
                            step.status === 'SKIPPED' && 'border-border bg-surface-sunken',
                          )}
                        >
                          {step.status === 'COMPLETED' ? <IconCheck size={11} /> : null}
                          {step.status === 'IN_PROGRESS' ? <Dot tone="brand" /> : null}
                        </span>
                        <span
                          className={cn(
                            'flex-1 text-body-sm',
                            step.status === 'PENDING' ? 'text-ink-muted' : 'text-ink',
                            step.status === 'IN_PROGRESS' && 'font-semibold',
                          )}
                        >
                          {step.name}
                        </span>
                        <span className="text-caption text-ink-subtle">
                          {step.status === 'COMPLETED' ? 'Done' : null}
                          {step.status === 'IN_PROGRESS' ? 'In progress' : null}
                          {step.status === 'PENDING' ? 'Upcoming' : null}
                        </span>
                      </li>
                    ))}
                  </ol>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ── Clinic updates ───────────────────────────────────────────────── */}
      {home.updates.length > 0 ? (
        <section aria-labelledby="updates">
          <SectionHeader title="Clinic updates" />
          <ul className="space-y-2.5">
            {home.updates.map((update) => (
              <li key={update.id}>
                <Card>
                  <h3 className="text-subheading text-ink">{update.title}</h3>
                  <p className="mt-1 text-body-sm text-ink-muted">{update.body}</p>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Repeating the patient's identity in the content, not only in the chrome, so a
          screenshot or a scrolled page is never ambiguous about whose record this is. */}
      <p className="pt-2 text-center text-caption text-ink-subtle">
        {home.patient.fullName} · MRN {home.patient.mrn}
      </p>
    </div>
  )
}

function QuickAction({
  href, icon, label, primary = false,
}: {
  href: string
  icon: React.ReactNode
  label: string
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex min-h-[84px] flex-col justify-between rounded-lg border p-4 transition-colors duration-fast',
        primary
          ? 'border-transparent bg-brand text-white'
          : 'border-border bg-surface text-ink hover:bg-surface-sunken/50',
      )}
    >
      <span className={primary ? 'text-white' : 'text-brand'}>{icon}</span>
      <span className="text-body-sm font-semibold leading-tight">{label}</span>
    </Link>
  )
}
