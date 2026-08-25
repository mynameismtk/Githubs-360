import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { resolveActivePatientId } from '@/server/auth/policy'
import { db } from '@/server/db'
import { assertCanAccessPatient } from '@/server/auth/policy'
import { CardLink, Card, SectionHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/states'
import { Badge } from '@/components/ui/badge'
import {
  IconRecords, IconFlask, IconPill, IconScan, IconCard, IconChevronRight, IconStethoscope,
} from '@/components/ui/icons'
import { formatDate } from '@/lib/dates'
import { formatMoney } from '@/lib/money'

export const dynamic = 'force-dynamic'

/**
 * Records hub.
 *
 * Phase 1 delivers the timeline itself plus counts and entry points. The individual
 * viewers (lab report detail with trends, prescription viewer, document download) are
 * Phase 2 — so the sections here link to real, honest "coming in the next release"
 * destinations rather than pretending to be complete.
 */
export default async function RecordsPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const patientId = await resolveActivePatientId(actor)
  if (!patientId) redirect('/app/profile')
  await assertCanAccessPatient(actor, patientId, 'READ')

  const [timeline, counts, patient, outstanding] = await Promise.all([
    db.medicalRecord.findMany({
      where: { patientId },
      orderBy: { occurredAt: 'desc' },
      take: 25,
    }),
    Promise.all([
      db.labOrder.count({ where: { patientId, status: 'VERIFIED' } }),
      db.prescription.count({ where: { patientId, status: 'ACTIVE' } }),
      db.imagingStudy.count({ where: { patientId, status: 'REPORTED' } }),
      db.invoice.count({ where: { patientId } }),
    ]),
    db.patient.findUniqueOrThrow({ where: { id: patientId }, select: { fullName: true, mrn: true } }),
    db.invoice.aggregate({
      where: { patientId, status: { in: ['ISSUED', 'PARTIALLY_PAID'] } },
      _sum: { amountDue: true },
    }),
  ])

  const [labCount, rxCount, imagingCount, billCount] = counts
  const due = outstanding._sum.amountDue ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-title text-ink">Records</h1>
        <p className="mt-1 text-body-sm text-ink-muted">
          {patient.fullName} · MRN {patient.mrn}
        </p>
      </div>

      <section>
        <SectionHeader title="Browse" />
        <div className="space-y-2.5">
          <RecordLink href="/app/records/lab-reports" icon={<IconFlask size={20} />} label="Lab reports" count={labCount} />
          <RecordLink href="/app/records/prescriptions" icon={<IconPill size={20} />} label="Prescriptions" count={rxCount} />
          <RecordLink href="/app/records/imaging" icon={<IconScan size={20} />} label="Imaging & scans" count={imagingCount} />
          <RecordLink
            href="/app/records/bills"
            icon={<IconCard size={20} />}
            label="Bills & payments"
            count={billCount}
            trailing={due > 0 ? <Badge tone="critical">{formatMoney(due)} due</Badge> : undefined}
          />
        </div>
      </section>

      <section>
        <SectionHeader title="Medical timeline" />
        {timeline.length === 0 ? (
          <EmptyState
            icon={<IconRecords size={28} />}
            title="Nothing here yet"
            body="Your consultations, reports and prescriptions will appear here after your first visit."
            action={{ label: 'Book an appointment', href: '/app/book' }}
          />
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-6">
            {timeline.map((event) => (
              <li key={event.id} className="relative">
                {/* The dot on the spine carries the record kind as a shape, so the
                    timeline is scannable without reading every label. */}
                <span
                  aria-hidden
                  className="absolute -left-[31px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand bg-surface text-brand"
                >
                  {event.kind === 'CONSULTATION' ? <IconStethoscope size={11} /> : null}
                  {event.kind === 'LAB_REPORT' ? <IconFlask size={11} /> : null}
                  {event.kind === 'PRESCRIPTION' ? <IconPill size={11} /> : null}
                  {event.kind === 'IMAGING' ? <IconScan size={11} /> : null}
                </span>
                <Card>
                  <p className="text-caption text-ink-muted tabular">{formatDate(event.occurredAt)}</p>
                  <p className="mt-0.5 text-body font-semibold text-ink">{event.title}</p>
                  {event.summary ? (
                    <p className="mt-0.5 text-body-sm text-ink-muted">{event.summary}</p>
                  ) : null}
                  {event.authorName ? (
                    <p className="mt-2 text-caption text-ink-subtle">{event.authorName}</p>
                  ) : null}
                </Card>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function RecordLink({
  href, icon, label, count, trailing,
}: {
  href: string
  icon: React.ReactNode
  label: string
  count: number
  trailing?: React.ReactNode
}) {
  return (
    <CardLink href={href} padded={false}>
      <div className="flex items-center gap-3.5 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-wash text-brand">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold text-ink">{label}</span>
          <span className="block text-caption text-ink-muted tabular">
            {count === 0 ? 'None yet' : `${count} available`}
          </span>
        </span>
        {trailing}
        <IconChevronRight size={18} className="shrink-0 text-ink-subtle" />
      </div>
    </CardLink>
  )
}
