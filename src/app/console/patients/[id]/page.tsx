import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { getPatientForActor } from '@/server/services/patient-service'
import { db } from '@/server/db'
import { isAppError } from '@/lib/errors'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/states'
import {
  IconAlert, IconChevronLeft, IconStethoscope, IconFlask, IconPill, IconScan, IconShield,
} from '@/components/ui/icons'
import { formatDate, formatDateTime, ageLabel } from '@/lib/dates'

export const dynamic = 'force-dynamic'

/**
 * The doctor's patient view (§18).
 *
 * Safety-critical facts — allergies, current medications, chronic diagnoses — sit above
 * the fold and above the timeline, because a doctor reading this has about four seconds
 * before the consultation starts.
 */
export default async function ConsolePatientPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const { id } = await params

  let patient
  try {
    patient = await getPatientForActor(actor, id)
  } catch (e) {
    if (isAppError(e) && e.code === 'NOT_FOUND') notFound()
    // A doctor with no care relationship gets an explicit, honest wall rather than a
    // silent 404 — break-glass is the documented path. docs/03 §6.
    if (isAppError(e) && e.code === 'FORBIDDEN') {
      return (
        <div className="mx-auto max-w-lg py-12">
          <Card className="border-[var(--caution)]/30 bg-[var(--caution-wash)]">
            <p className="flex items-start gap-2.5">
              <IconShield size={20} className="mt-0.5 shrink-0 text-[var(--caution)]" />
              <span>
                <span className="block text-subheading text-ink">You don&apos;t have access to this patient</span>
                <span className="mt-1 block text-body-sm text-ink-muted">{e.message}</span>
                <span className="mt-3 block text-caption text-ink-subtle">
                  Emergency access is available for clinically necessary situations. It requires a reason,
                  is logged, and is reviewed by the clinic administrator. It ships with the clinical release.
                </span>
              </span>
            </p>
          </Card>
        </div>
      )
    }
    throw e
  }

  const [timeline, activeRx, chronic, lastVitals] = await Promise.all([
    db.medicalRecord.findMany({ where: { patientId: id }, orderBy: { occurredAt: 'desc' }, take: 30 }),
    db.prescription.findMany({
      where: { patientId: id, status: 'ACTIVE' },
      select: { id: true, items: { select: { id: true, medicineName: true, strength: true } } },
      orderBy: { issuedAt: 'desc' },
      take: 5,
    }),
    db.diagnosis.findMany({
      where: { patientId: id, isChronic: true, resolvedDate: null },
      select: { id: true, label: true, onsetDate: true },
    }),
    db.vitalsRecord.findFirst({
      where: { patientId: id },
      orderBy: { recordedAt: 'desc' },
    }),
  ])

  const medications = activeRx.flatMap((rx) => rx.items)

  return (
    <div className="space-y-6">
      <Link
        href="/console/patients"
        className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full pl-1 pr-3 text-body-sm font-semibold text-ink-muted"
      >
        <IconChevronLeft size={18} />
        Patients
      </Link>

      <header className="flex flex-wrap items-start gap-4">
        <Avatar name={patient.fullName} src={patient.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-title text-ink">{patient.fullName}</h1>
          <p className="text-body-sm text-ink-muted tabular">
            {ageLabel(patient.dateOfBirth)} · {sexLabel(patient.gender)} · {patient.mrn}
            {patient.phone ? ` · ${patient.phone}` : ''}
          </p>
        </div>
        {patient.projection !== 'FULL' ? (
          <Badge tone="caution" icon={<IconShield size={12} />}>
            Limited view
          </Badge>
        ) : null}
      </header>

      {/* Allergies first. Everything else can wait. */}
      <section className="grid gap-3 lg:grid-cols-3">
        <Card
          className={
            patient.allergies.length > 0
              ? 'border-[var(--critical)]/30 bg-[var(--critical-wash)]'
              : undefined
          }
        >
          <p className="text-overline uppercase text-ink-muted">Allergies</p>
          {patient.allergies.length === 0 ? (
            <p className="mt-2 text-body-sm text-ink-muted">None recorded</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {patient.allergies.map((a) => (
                <li key={a.id} className="flex items-start gap-1.5 text-body-sm">
                  <IconAlert size={14} className="mt-0.5 shrink-0 text-[var(--critical)]" />
                  <span className="text-ink">
                    <span className="font-semibold">{a.substance}</span>
                    {a.reaction ? ` — ${a.reaction}` : ''}
                    <span className="ml-1 text-caption text-ink-muted">({a.severity.toLowerCase()})</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <p className="text-overline uppercase text-ink-muted">Current medications</p>
          {medications.length === 0 ? (
            <p className="mt-2 text-body-sm text-ink-muted">None active</p>
          ) : (
            <ul className="mt-2 space-y-1 text-body-sm text-ink">
              {medications.map((m) => (
                <li key={m.id}>
                  {m.medicineName} {m.strength}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <p className="text-overline uppercase text-ink-muted">Ongoing conditions</p>
          {chronic.length === 0 ? (
            <p className="mt-2 text-body-sm text-ink-muted">None recorded</p>
          ) : (
            <ul className="mt-2 space-y-1 text-body-sm text-ink">
              {chronic.map((d) => (
                <li key={d.id}>
                  {d.label}
                  {d.onsetDate ? (
                    <span className="text-caption text-ink-muted"> · since {formatDate(d.onsetDate)}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {lastVitals ? (
        <Card>
          <p className="text-overline uppercase text-ink-muted">
            Latest vitals · {formatDateTime(lastVitals.recordedAt)}
            {lastVitals.recordedByName ? ` · ${lastVitals.recordedByName}` : ''}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Vital label="BP" value={lastVitals.systolicBp && lastVitals.diastolicBp ? `${lastVitals.systolicBp}/${lastVitals.diastolicBp}` : null} unit="mmHg" />
            <Vital label="Pulse" value={lastVitals.pulse} unit="bpm" />
            <Vital label="SpO₂" value={lastVitals.spo2} unit="%" />
            <Vital label="Temp" value={lastVitals.temperatureC10 ? (lastVitals.temperatureC10 / 10).toFixed(1) : null} unit="°C" />
            <Vital label="Weight" value={lastVitals.weightGrams ? (lastVitals.weightGrams / 1000).toFixed(1) : null} unit="kg" />
            <Vital label="Height" value={lastVitals.heightMm ? (lastVitals.heightMm / 10).toFixed(0) : null} unit="cm" />
          </dl>
        </Card>
      ) : null}

      <section>
        <h2 className="mb-3 text-overline uppercase text-ink-muted">Patient timeline</h2>
        {timeline.length === 0 ? (
          <EmptyState title="No records yet" body="This patient has no recorded history at the clinic." />
        ) : (
          <Card padded={false}>
            <ul className="divide-y divide-border">
              {timeline.map((event) => (
                <li key={event.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-wash text-brand">
                    {event.kind === 'CONSULTATION' ? <IconStethoscope size={14} /> : null}
                    {event.kind === 'LAB_REPORT' ? <IconFlask size={14} /> : null}
                    {event.kind === 'PRESCRIPTION' ? <IconPill size={14} /> : null}
                    {event.kind === 'IMAGING' ? <IconScan size={14} /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-sm font-semibold text-ink">{event.title}</span>
                    {event.summary ? (
                      <span className="block text-caption text-ink-muted">{event.summary}</span>
                    ) : null}
                    <span className="mt-0.5 block text-caption text-ink-subtle">
                      {event.authorName}
                      {event.specialityName ? ` · ${event.specialityName}` : ''}
                    </span>
                  </span>
                  <span className="shrink-0 text-caption text-ink-muted tabular">
                    {formatDate(event.occurredAt)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <Card>
        <p className="text-overline uppercase text-ink-muted">Arriving in the next release</p>
        <p className="mt-2 text-body-sm text-ink">
          Start consultation, prescribe, order labs and imaging, refer, and schedule follow-up ship
          with the clinical release. The data model, the timeline and the access rules that back them
          are already live.
        </p>
      </Card>
    </div>
  )
}

function Vital({ label, value, unit }: { label: string; value: string | number | null; unit: string }) {
  return (
    <div>
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className="text-body font-semibold text-ink tabular">
        {value ?? '—'}
        {value != null ? <span className="ml-0.5 text-caption font-normal text-ink-muted">{unit}</span> : null}
      </dd>
    </div>
  )
}

function sexLabel(gender: string): string {
  switch (gender) {
    case 'MALE': return 'Male'
    case 'FEMALE': return 'Female'
    case 'OTHER': return 'Other'
    default: return 'Not stated'
  }
}
