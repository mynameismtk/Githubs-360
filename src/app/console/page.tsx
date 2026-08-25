import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getActor } from '@/server/auth/session'
import { getDoctorDay, getNurseDay, getLabWorklist, getPharmacyWorklist } from '@/server/services/console-service'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/states'
import { StatusBadge } from '@/components/patterns/appointment-status'
import { IconCalendar, IconFlask, IconPill, IconAlert } from '@/components/ui/icons'
import { formatTime, formatLongDate, ageLabel, formatDate } from '@/lib/dates'
import { greeting } from '@/lib/dates'

export const dynamic = 'force-dynamic'

export default async function ConsoleHome() {
  const actor = await getActor()
  if (!actor) redirect('/login')

  switch (actor.role) {
    case 'DOCTOR':
      return <DoctorDashboard />
    case 'NURSE':
      return <NurseDashboard />
    case 'LAB_TECH':
      return <LabDashboard />
    case 'PHARMACIST':
      return <PharmacyDashboard />
    default:
      redirect('/login')
  }
}

async function DoctorDashboard() {
  const actor = (await getActor())!
  const { doctor, dateKey, appointments, stats } = await getDoctorDay(actor)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-title text-ink">
          {greeting()}, Dr. {doctor.user.fullName}
        </h1>
        <p className="mt-1 text-body-sm text-ink-muted">
          {formatLongDate(new Date(`${dateKey}T12:00:00Z`))} · {doctor.speciality.name}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Today" value={stats.total} />
        <Stat label="Waiting" value={stats.waiting} tone={stats.waiting > 0 ? 'caution' : undefined} />
        <Stat label="Completed" value={stats.completed} />
        <Stat label="Reports pending" value={stats.pendingReports} />
        <Stat label="Follow-ups due" value={stats.followUpsDue} />
      </div>

      <section>
        <h2 className="mb-3 text-overline uppercase text-ink-muted">Today&apos;s appointments</h2>
        {appointments.length === 0 ? (
          <EmptyState
            icon={<IconCalendar size={26} />}
            title="No appointments today"
            body="Your list is clear. Anything booked will appear here."
          />
        ) : (
          <Card padded={false}>
            <ul className="divide-y divide-border">
              {appointments.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/console/patients/${a.patient.id}`}
                    className="flex items-center gap-4 px-4 py-3 transition-colors duration-fast hover:bg-surface-sunken/50"
                  >
                    <span className="w-16 shrink-0 text-body-sm font-semibold text-ink tabular">
                      {formatTime(a.startAt)}
                    </span>
                    <Avatar name={a.patient.fullName} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-sm font-semibold text-ink">
                        {a.patient.fullName}
                      </span>
                      <span className="block truncate text-caption text-ink-muted">
                        {ageLabel(a.patient.dateOfBirth)} · {a.patient.mrn}
                        {a.reasonForVisit ? ` · ${a.reasonForVisit}` : ''}
                      </span>
                    </span>
                    <StatusBadge status={a.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  )
}

async function NurseDashboard() {
  const actor = (await getActor())!
  const { dateKey, patients } = await getNurseDay(actor)
  const awaitingVitals = patients.filter((p) => !p.hasVitals && p.appointment.status === 'CHECKED_IN')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-title text-ink">{greeting()}, {actor.fullName}</h1>
        <p className="mt-1 text-body-sm text-ink-muted">
          {formatLongDate(new Date(`${dateKey}T12:00:00Z`))}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Patients today" value={patients.length} />
        <Stat
          label="Awaiting vitals"
          value={awaitingVitals.length}
          tone={awaitingVitals.length > 0 ? 'caution' : undefined}
        />
        <Stat label="Vitals recorded" value={patients.filter((p) => p.hasVitals).length} />
      </div>

      <section>
        <h2 className="mb-3 text-overline uppercase text-ink-muted">Today&apos;s patients</h2>
        {patients.length === 0 ? (
          <EmptyState title="No patients on today's list" body="Checked-in patients will appear here." />
        ) : (
          <Card padded={false}>
            <ul className="divide-y divide-border">
              {patients.map(({ appointment: a, hasVitals }) => (
                <li key={a.id} className="flex items-center gap-4 px-4 py-3">
                  <span className="w-16 shrink-0 text-body-sm font-semibold text-ink tabular">
                    {formatTime(a.startAt)}
                  </span>
                  <Avatar name={a.patient.fullName} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-semibold text-ink">
                      {a.patient.fullName}
                    </span>
                    <span className="block truncate text-caption text-ink-muted">
                      {ageLabel(a.patient.dateOfBirth)} · Dr. {a.doctor.user.fullName}
                    </span>
                  </span>
                  {hasVitals ? (
                    <Badge tone="positive">Vitals recorded</Badge>
                  ) : (
                    <Badge tone="caution">Vitals needed</Badge>
                  )}
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <Card>
        <p className="text-overline uppercase text-ink-muted">Arriving in the next release</p>
        <p className="mt-2 text-body-sm text-ink">
          Recording vitals (BP, pulse, SpO₂, temperature, weight, height) lands with the operations
          release, alongside the live queue. The data model and the doctor-side display are already in
          place.
        </p>
      </Card>
    </div>
  )
}

async function LabDashboard() {
  const actor = (await getActor())!
  const orders = await getLabWorklist(actor)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-title text-ink">Laboratory worklist</h1>
        <p className="mt-1 text-body-sm text-ink-muted">Orders awaiting collection, processing or verification</p>
      </header>

      {orders.length === 0 ? (
        <EmptyState icon={<IconFlask size={26} />} title="Nothing outstanding" body="New lab orders will appear here." />
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-border">
            {orders.map((o) => (
              <li key={o.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-semibold text-ink">
                      {o.patient.fullName}
                      <span className="ml-2 font-normal text-ink-muted">
                        {ageLabel(o.patient.dateOfBirth)} · {o.patient.mrn}
                      </span>
                    </span>
                    <span className="block truncate text-caption text-ink-muted">
                      {o.items.map((i) => i.testName).join(', ')} · Dr. {o.doctor.user.fullName} ·{' '}
                      {formatDate(o.orderedAt)}
                    </span>
                  </span>
                  {o.priority !== 'ROUTINE' ? (
                    <Badge tone="critical" icon={<IconAlert size={12} />}>{o.priority}</Badge>
                  ) : null}
                  <Badge tone="caution">{o.status.replace(/_/g, ' ').toLowerCase()}</Badge>
                </div>
                {/* The lab sees the clinical note attached to the order — not the record. */}
                {o.clinicalNotes ? (
                  <p className="mt-1.5 text-caption text-ink-subtle">{o.clinicalNotes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <p className="text-overline uppercase text-ink-muted">Arriving in the next release</p>
        <p className="mt-2 text-body-sm text-ink">
          Marking samples collected, uploading results and verifying reports ship with the clinical
          release. Your access is already restricted to the patients you have an open order for.
        </p>
      </Card>
    </div>
  )
}

async function PharmacyDashboard() {
  const actor = (await getActor())!
  const prescriptions = await getPharmacyWorklist(actor)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-title text-ink">Prescriptions to dispense</h1>
        <p className="mt-1 text-body-sm text-ink-muted">Awaiting dispensing</p>
      </header>

      {prescriptions.length === 0 ? (
        <EmptyState icon={<IconPill size={26} />} title="Nothing to dispense" body="New prescriptions will appear here." />
      ) : (
        <ul className="space-y-3">
          {prescriptions.map((rx) => (
            <li key={rx.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-ink">{rx.patient.fullName}</p>
                    <p className="text-caption text-ink-muted">
                      {rx.patient.mrn} · Dr. {rx.doctor.user.fullName} · {formatDate(rx.issuedAt)}
                    </p>
                  </div>
                  <Badge tone="caution">{rx.dispenseStatus.replace(/_/g, ' ').toLowerCase()}</Badge>
                </div>
                {/* Allergies are surfaced to pharmacy by design — this is the one clinical
                    fact this role genuinely needs before handing over a medicine. */}
                {rx.patient.allergies.length > 0 ? (
                  <p className="mt-2 flex items-center gap-1.5 rounded-md bg-[var(--critical-wash)] px-2.5 py-1.5 text-caption font-semibold text-[var(--critical)]">
                    <IconAlert size={13} />
                    Allergies: {rx.patient.allergies.map((a) => a.substance).join(', ')}
                  </p>
                ) : null}
                <ul className="mt-3 space-y-1">
                  {rx.items.map((item) => (
                    <li key={item.id} className="flex justify-between text-body-sm">
                      <span className="text-ink">
                        {item.medicineName} {item.strength}
                      </span>
                      <span className="text-ink-muted tabular">
                        {item.quantity ? `× ${item.quantity}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'caution' }) {
  return (
    <Card className={tone === 'caution' && value > 0 ? 'border-[var(--caution)]/30 bg-[var(--caution-wash)]' : undefined}>
      <p className="text-overline uppercase text-ink-muted">{label}</p>
      <p className="mt-1 text-title text-ink tabular">{value}</p>
    </Card>
  )
}
