import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { resolveActivePatientId } from '@/server/auth/policy'
import { listInvoices } from '@/server/services/records-service'
import { getClinic } from '@/server/services/clinic-service'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/states'
import { IconCard, IconChevronLeft, IconCheck } from '@/components/ui/icons'
import { formatDate } from '@/lib/dates'
import { formatMoney } from '@/lib/money'

export const dynamic = 'force-dynamic'

const CATEGORY_LABEL: Record<string, string> = {
  CONSULTATION: 'Consultation',
  LABORATORY: 'Laboratory',
  PHARMACY: 'Pharmacy',
  IMAGING: 'Imaging',
  PROCEDURE: 'Procedure',
  OTHER: 'Other',
}

export default async function BillsPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const patientId = await resolveActivePatientId(actor)
  if (!patientId) redirect('/app/profile')

  const [{ invoices, outstandingPaise }, clinic] = await Promise.all([
    listInvoices(actor, patientId),
    getClinic(),
  ])

  const unpaid = invoices.filter((i) => i.amountDue > 0)
  const paid = invoices.filter((i) => i.amountDue === 0)

  return (
    <div className="space-y-6">
      <Link
        href="/app/records"
        className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full pl-1 pr-3 text-body-sm font-semibold text-ink-muted"
      >
        <IconChevronLeft size={18} />
        Records
      </Link>

      <h1 className="text-title text-ink">Bills &amp; payments</h1>

      {invoices.length === 0 ? (
        <EmptyState
          icon={<IconCard size={28} />}
          title="No bills yet"
          body="Bills from your visits will appear here."
        />
      ) : (
        <>
          <Card className={outstandingPaise > 0 ? 'border-accent/30 bg-accent-wash' : undefined}>
            <p className="text-overline uppercase text-ink-muted">Outstanding</p>
            <p className="mt-1 text-display text-ink tabular">{formatMoney(outstandingPaise)}</p>
            {outstandingPaise > 0 ? (
              <>
                <p className="mt-1 text-body-sm text-ink-muted">
                  Across {unpaid.length} bill{unpaid.length === 1 ? '' : 's'}
                </p>
                {/*
                  Payment collection needs a real UPI gateway. Rather than a "Pay Now"
                  button that silently does nothing, we say plainly where payment happens
                  today and mark the integration point. docs/02 TD-5.
                */}
                <div className="mt-4 rounded-md border border-border bg-surface p-3.5">
                  <p className="text-body-sm text-ink">
                    Online payment is not switched on for this clinic yet. You can settle at the
                    reception desk, or call us to pay over the phone.
                  </p>
                  <a
                    href={`tel:${clinic.supportPhone}`}
                    className="mt-3 flex h-11 items-center justify-center rounded-md bg-brand font-semibold text-white"
                  >
                    Call {clinic.name}
                  </a>
                </div>
              </>
            ) : (
              <p className="mt-1 flex items-center gap-1.5 text-body-sm text-[var(--positive)]">
                <IconCheck size={15} />
                Everything is settled
              </p>
            )}
          </Card>

          {unpaid.length > 0 ? (
            <section>
              <h2 className="mb-2.5 text-overline uppercase text-ink-muted">Unpaid</h2>
              <ul className="space-y-2.5">
                {unpaid.map((inv) => (
                  <li key={inv.id}>
                    <InvoiceCard invoice={inv} categoryLabel={CATEGORY_LABEL[inv.category] ?? 'Other'} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {paid.length > 0 ? (
            <section>
              <h2 className="mb-2.5 text-overline uppercase text-ink-muted">Paid</h2>
              <ul className="space-y-2.5">
                {paid.map((inv) => (
                  <li key={inv.id}>
                    <InvoiceCard invoice={inv} categoryLabel={CATEGORY_LABEL[inv.category] ?? 'Other'} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}

function InvoiceCard({
  invoice, categoryLabel,
}: {
  invoice: Awaited<ReturnType<typeof listInvoices>>['invoices'][number]
  categoryLabel: string
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-body font-semibold text-ink">{categoryLabel}</p>
          <p className="text-caption text-ink-muted tabular">
            {formatDate(invoice.issuedAt)} · {invoice.number}
          </p>
        </div>
        <div className="text-right">
          <p className="text-heading text-ink tabular">{formatMoney(invoice.total)}</p>
          {invoice.amountDue === 0 ? (
            <Badge tone="positive" icon={<IconCheck size={12} />}>Paid</Badge>
          ) : (
            <Badge tone="caution">{formatMoney(invoice.amountDue)} due</Badge>
          )}
        </div>
      </div>
      <ul className="mt-3 space-y-1 border-t border-border pt-3">
        {invoice.lines.map((line) => (
          <li key={line.id} className="flex items-baseline justify-between gap-3 text-body-sm">
            <span className="text-ink-muted">{line.description}</span>
            <span className="shrink-0 font-medium text-ink tabular">{formatMoney(line.lineTotal)}</span>
          </li>
        ))}
      </ul>
      {invoice.payments.length > 0 ? (
        <p className="mt-3 text-caption text-ink-subtle">
          Receipt {invoice.payments[0]?.receiptNumber ?? '—'} ·{' '}
          {invoice.payments[0]?.paidAt ? formatDate(invoice.payments[0].paidAt) : ''}
        </p>
      ) : null}
    </Card>
  )
}
