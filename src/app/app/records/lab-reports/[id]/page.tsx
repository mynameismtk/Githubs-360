import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { resolveActivePatientId } from '@/server/auth/policy'
import { getLabReport } from '@/server/services/records-service'
import { getClinic } from '@/server/services/clinic-service'
import { isAppError } from '@/lib/errors'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/ui/button'
import { IconChevronLeft, IconAlert, IconTrend } from '@/components/ui/icons'
import { formatDate } from '@/lib/dates'
import { cn } from '@/lib/cn'

export const dynamic = 'force-dynamic'

export default async function LabReportPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const patientId = await resolveActivePatientId(actor)
  if (!patientId) redirect('/app/profile')
  const { id } = await params

  let report
  try {
    report = await getLabReport(actor, patientId, id)
  } catch (e) {
    if (isAppError(e) && (e.code === 'NOT_FOUND' || e.code === 'FORBIDDEN')) notFound()
    throw e
  }

  const clinic = await getClinic()
  const hasAbnormal = report.results.some((r) => r.flag !== 'NORMAL')

  return (
    <div className="space-y-5">
      <Link
        href="/app/records/lab-reports"
        className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full pl-1 pr-3 text-body-sm font-semibold text-ink-muted"
      >
        <IconChevronLeft size={18} />
        Lab reports
      </Link>

      <div>
        <h1 className="text-title text-ink">{report.items.map((i) => i.testName).join(', ')}</h1>
        <p className="mt-1 text-body-sm text-ink-muted tabular">
          {report.verifiedAt ? formatDate(report.verifiedAt) : formatDate(report.orderedAt)} · {report.number}
        </p>
        <p className="mt-0.5 text-caption text-ink-subtle">
          Ordered by Dr. {report.doctor.user.fullName}
          {report.verifiedByName ? ` · Verified by ${report.verifiedByName}` : ''}
        </p>
      </div>

      {/*
        THE clinical-safety rule (§8). We state that a value sits outside the displayed
        range and route the patient to a human. We never name a condition, never say
        "high risk", and never imply a diagnosis from a number.
      */}
      {hasAbnormal ? (
        <Card className="border-[var(--caution)]/25 bg-[var(--caution-wash)]">
          <p className="flex items-start gap-2 text-body-sm text-ink">
            <IconAlert size={16} className="mt-0.5 shrink-0 text-[var(--caution)]" />
            <span>
              Some results are outside the displayed reference range. Please discuss them with your
              healthcare professional. This is not a diagnosis.
            </span>
          </p>
        </Card>
      ) : null}

      <Card padded={false}>
        <table className="w-full">
          <caption className="sr-only">Test results with reference ranges</caption>
          <thead>
            <tr className="border-b border-border text-left">
              <th scope="col" className="px-4 py-3 text-overline uppercase text-ink-muted">Test</th>
              <th scope="col" className="px-2 py-3 text-right text-overline uppercase text-ink-muted">Result</th>
              <th scope="col" className="px-4 py-3 text-right text-overline uppercase text-ink-muted">Range</th>
            </tr>
          </thead>
          <tbody>
            {report.results.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 align-top">
                <td className="px-4 py-3">
                  <p className="text-body-sm font-medium text-ink">{r.analyteName}</p>
                  {r.previous?.value != null ? (
                    <p className="mt-0.5 flex items-center gap-1 text-caption text-ink-subtle tabular">
                      <IconTrend size={12} />
                      Previous {r.previous.value} on {formatDate(r.previous.measuredAt)}
                    </p>
                  ) : null}
                  {r.comment ? <p className="mt-0.5 text-caption text-ink-subtle">{r.comment}</p> : null}
                </td>
                <td className="px-2 py-3 text-right">
                  <span
                    className={cn(
                      'text-body font-semibold tabular',
                      r.flag === 'NORMAL' ? 'text-ink' : 'text-[var(--caution)]',
                    )}
                  >
                    {r.valueNumeric ?? r.valueText ?? '—'}
                  </span>
                  {r.unit ? <span className="ml-1 text-caption text-ink-muted">{r.unit}</span> : null}
                  {/* The flag is a word, not only a colour. */}
                  {r.flag !== 'NORMAL' ? (
                    <span className="mt-1 block text-caption font-semibold text-[var(--caution)]">
                      {flagLabel(r.flag)}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right text-caption text-ink-muted tabular">
                  {r.refText ??
                    (r.refLow != null && r.refHigh != null ? `${r.refLow} – ${r.refHigh}` : '—')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="space-y-2.5">
        <LinkButton href="/app/book" size="lg" fullWidth>
          Book a consultation about this
        </LinkButton>
        <a
          href={`tel:${clinic.supportPhone}`}
          className="flex h-11 items-center justify-center rounded-md border border-border-strong bg-surface font-semibold text-ink"
        >
          Ask the clinic a question
        </a>
      </div>

      <p className="pb-2 text-center text-caption text-ink-subtle">
        Reference ranges vary between laboratories. Always read a result alongside your clinical history.
      </p>
    </div>
  )
}

function flagLabel(flag: string): string {
  switch (flag) {
    case 'LOW': return 'Below range'
    case 'HIGH': return 'Above range'
    case 'CRITICAL_LOW': return 'Well below range'
    case 'CRITICAL_HIGH': return 'Well above range'
    case 'ABNORMAL': return 'Outside range'
    case 'INCONCLUSIVE': return 'Inconclusive'
    default: return ''
  }
}
