import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { resolveActivePatientId } from '@/server/auth/policy'
import { listPrescriptions } from '@/server/services/records-service'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/states'
import { IconPill, IconChevronLeft, IconAlert } from '@/components/ui/icons'
import { formatDate } from '@/lib/dates'

export const dynamic = 'force-dynamic'

const TIMING_LABEL: Record<string, string> = {
  BEFORE_FOOD: 'Before food',
  AFTER_FOOD: 'After food',
  WITH_FOOD: 'With food',
  ANYTIME: 'Any time',
}

export default async function PrescriptionsPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const patientId = await resolveActivePatientId(actor)
  if (!patientId) redirect('/app/profile')

  const prescriptions = await listPrescriptions(actor, patientId)

  return (
    <div className="space-y-6">
      <Link
        href="/app/records"
        className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full pl-1 pr-3 text-body-sm font-semibold text-ink-muted"
      >
        <IconChevronLeft size={18} />
        Records
      </Link>

      <h1 className="text-title text-ink">Prescriptions</h1>

      {prescriptions.length === 0 ? (
        <EmptyState
          icon={<IconPill size={28} />}
          title="No active prescriptions"
          body="Prescriptions from your consultations will appear here."
        />
      ) : (
        <ul className="space-y-4">
          {prescriptions.map((rx) => (
            <li key={rx.id}>
              <Card padded={false}>
                <div className="border-b border-border p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-subheading text-ink">Dr. {rx.doctor.user.fullName}</p>
                      <p className="text-body-sm text-ink-muted">{rx.doctor.speciality.name}</p>
                      <p className="mt-1 text-caption text-ink-subtle tabular">
                        {formatDate(rx.issuedAt)} · {rx.number}
                      </p>
                    </div>
                    <Badge tone={rx.status === 'ACTIVE' ? 'brand' : 'neutral'}>
                      {rx.status === 'ACTIVE' ? 'Active' : rx.status === 'COMPLETED' ? 'Completed' : 'Ended'}
                    </Badge>
                  </div>
                  {rx.diagnosisSummary ? (
                    <p className="mt-3 text-body-sm text-ink-muted">
                      <span className="font-semibold text-ink">For: </span>
                      {rx.diagnosisSummary}
                    </p>
                  ) : null}
                </div>

                <ul className="divide-y divide-border">
                  {rx.items.map((item) => (
                    <li key={item.id} className="p-5">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-body font-semibold text-ink">
                          {item.medicineName}
                          {item.strength ? (
                            <span className="ml-1.5 font-normal text-ink-muted">{item.strength}</span>
                          ) : null}
                        </p>
                        {item.isSos ? <Badge tone="caution">Only when needed</Badge> : null}
                      </div>

                      {/*
                        1-0-1 is the convention Indian patients already read fluently, so
                        we lead with it and label each slot underneath.
                      */}
                      {!item.isSos ? (
                        <div className="mt-3 flex gap-2">
                          {(
                            [
                              ['Morning', item.morning],
                              ['Afternoon', item.afternoon],
                              ['Evening', item.evening],
                              ['Night', item.night],
                            ] as const
                          ).map(([label, dose]) => (
                            <div
                              key={label}
                              className={
                                dose > 0
                                  ? 'flex-1 rounded-md bg-brand-wash px-2 py-2 text-center'
                                  : 'flex-1 rounded-md bg-surface-sunken px-2 py-2 text-center opacity-60'
                              }
                            >
                              <p
                                className={
                                  dose > 0
                                    ? 'text-heading text-brand-ink tabular'
                                    : 'text-heading text-ink-subtle tabular'
                                }
                              >
                                {dose % 1 === 0 ? dose : dose.toFixed(1)}
                              </p>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                                {label}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <dl className="mt-3 space-y-1 text-body-sm">
                        {item.durationDays ? (
                          <div className="flex gap-2">
                            <dt className="text-ink-muted">Duration:</dt>
                            <dd className="font-medium text-ink tabular">{item.durationDays} days</dd>
                          </div>
                        ) : null}
                        <div className="flex gap-2">
                          <dt className="text-ink-muted">Instructions:</dt>
                          <dd className="font-medium text-ink">
                            {TIMING_LABEL[item.timing] ?? item.timing}
                            {item.instructions ? ` · ${item.instructions}` : ''}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>

                {rx.generalInstructions ? (
                  <div className="border-t border-border bg-surface-sunken/40 p-5">
                    <p className="flex items-start gap-2 text-body-sm text-ink">
                      <IconAlert size={15} className="mt-0.5 shrink-0 text-ink-muted" />
                      <span>{rx.generalInstructions}</span>
                    </p>
                  </div>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <p className="pb-2 text-center text-caption text-ink-subtle">
        Never change or stop a medicine without speaking to your doctor.
      </p>
    </div>
  )
}
