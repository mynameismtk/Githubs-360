import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { resolveActivePatientId } from '@/server/auth/policy'
import { listLabReports } from '@/server/services/records-service'
import { CardLink } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/states'
import { IconFlask, IconChevronRight, IconChevronLeft, IconCheck, IconClock, IconAlert } from '@/components/ui/icons'
import { formatDate } from '@/lib/dates'

export const dynamic = 'force-dynamic'

export default async function LabReportsPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const patientId = await resolveActivePatientId(actor)
  if (!patientId) redirect('/app/profile')

  const reports = await listLabReports(actor, patientId)
  const ready = reports.filter((r) => r.status === 'VERIFIED')
  const pending = reports.filter((r) => r.status !== 'VERIFIED')

  return (
    <div className="space-y-6">
      <Link
        href="/app/records"
        className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full pl-1 pr-3 text-body-sm font-semibold text-ink-muted"
      >
        <IconChevronLeft size={18} />
        Records
      </Link>

      <h1 className="text-title text-ink">Lab reports</h1>

      {reports.length === 0 ? (
        <EmptyState
          icon={<IconFlask size={28} />}
          title="No reports yet"
          body="Your reports will appear here as soon as they're ready."
        />
      ) : (
        <>
          {pending.length > 0 ? (
            <section>
              <h2 className="mb-2.5 text-overline uppercase text-ink-muted">In progress</h2>
              <ul className="space-y-2.5">
                {pending.map((r) => (
                  <li key={r.id}>
                    <div className="rounded-lg border border-border bg-surface p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--caution-wash)] text-[var(--caution)]">
                          <IconClock size={19} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body font-semibold text-ink">
                            {r.items.map((i) => i.testName).join(', ')}
                          </p>
                          <p className="text-caption text-ink-muted tabular">
                            Ordered {formatDate(r.orderedAt)}
                          </p>
                        </div>
                        <Badge tone="caution">{statusLabel(r.status)}</Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {ready.length > 0 ? (
            <section>
              <h2 className="mb-2.5 text-overline uppercase text-ink-muted">Available</h2>
              <ul className="space-y-2.5">
                {ready.map((r) => {
                  const abnormal = r.results.some((x) => x.flag !== 'NORMAL')
                  return (
                    <li key={r.id}>
                      <CardLink href={`/app/records/lab-reports/${r.id}`} padded={false}>
                        <div className="flex items-center gap-3 p-4">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--positive-wash)] text-[var(--positive)]">
                            <IconFlask size={19} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-body font-semibold text-ink">
                              {r.items.map((i) => i.testName).join(', ')}
                            </p>
                            <p className="text-caption text-ink-muted tabular">
                              {r.verifiedAt ? formatDate(r.verifiedAt) : formatDate(r.orderedAt)} ·{' '}
                              {r.number}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <Badge tone="positive" icon={<IconCheck size={12} />}>
                                Report available
                              </Badge>
                              {/*
                                We flag that something is outside the reference range — we
                                never characterise it as a problem or a diagnosis (§8).
                              */}
                              {abnormal ? (
                                <Badge tone="caution" icon={<IconAlert size={12} />}>
                                  Some values outside range
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                          <IconChevronRight size={18} className="shrink-0 text-ink-subtle" />
                        </div>
                      </CardLink>
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}

function statusLabel(status: string): string {
  switch (status) {
    case 'ORDERED': return 'Ordered'
    case 'SAMPLE_PENDING': return 'Awaiting sample'
    case 'SAMPLE_COLLECTED': return 'Sample collected'
    case 'IN_PROGRESS': return 'Being processed'
    case 'RESULTS_UPLOADED': return 'Being checked'
    default: return 'In progress'
  }
}
