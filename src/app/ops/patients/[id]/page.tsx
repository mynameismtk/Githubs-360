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
import { StatusBadge } from '@/components/patterns/appointment-status'
import { IconChevronLeft, IconShield } from '@/components/ui/icons'
import { formatDate, formatDateTime, ageLabel } from '@/lib/dates'
import { formatMoney } from '@/lib/money'

export const dynamic = 'force-dynamic'

/**
 * Reception / admin patient view.
 *
 * OPERATIONAL projection only: demographics, appointments and money. No clinical content
 * — reception can see that a report exists, never what it says. docs/03 §3 note 12.
 */
export default async function OpsPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const { id } = await params

  let patient
  try {
    patient = await getPatientForActor(actor, id)
  } catch (e) {
    if (isAppError(e) && (e.code === 'NOT_FOUND' || e.code === 'FORBIDDEN')) notFound()
    throw e
  }

  const [appointments, invoices, outstanding] = await Promise.all([
    db.appointment.findMany({
      where: { patientId: id },
      select: {
        id: true, startAt: true, status: true,
        doctor: { select: { user: { select: { fullName: true } } } },
        speciality: { select: { name: true } },
      },
      orderBy: { startAt: 'desc' },
      take: 20,
    }),
    db.invoice.findMany({
      where: { patientId: id },
      select: { id: true, number: true, category: true, total: true, amountDue: true, issuedAt: true, status: true },
      orderBy: { issuedAt: 'desc' },
      take: 20,
    }),
    db.invoice.aggregate({
      where: { patientId: id, status: { in: ['ISSUED', 'PARTIALLY_PAID'] } },
      _sum: { amountDue: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <Link
        href="/ops/patients"
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
            {ageLabel(patient.dateOfBirth)} · {patient.mrn}
            {patient.phone ? ` · ${patient.phone}` : ''}
          </p>
          <p className="text-caption text-ink-subtle">Registered {formatDate(patient.registeredAt)}</p>
        </div>
        <Badge tone="neutral" icon={<IconShield size={12} />}>
          Front-desk view
        </Badge>
      </header>

      {/*
        Stated explicitly rather than left implicit. A receptionist should understand
        that the absence of clinical content is a deliberate rule, not a missing feature.
      */}
      <Card className="border-brand/20 bg-brand-wash">
        <p className="text-body-sm text-brand-ink">
          This view shows appointments and billing only. Clinical records — consultations, reports and
          prescriptions — are available to the treating clinician.
        </p>
      </Card>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <p className="text-overline uppercase text-ink-muted">Contact</p>
          <p className="mt-2 text-body-sm text-ink">{patient.phone ?? 'No mobile on file'}</p>
          <p className="text-body-sm text-ink-muted">
            {patient.addressLine1
              ? `${patient.addressLine1}, ${patient.city ?? ''} ${patient.pincode ?? ''}`.trim()
              : 'No address on file'}
          </p>
        </Card>
        <Card>
          <p className="text-overline uppercase text-ink-muted">Emergency contact</p>
          <p className="mt-2 text-body-sm text-ink">
            {patient.emergencyContactName ?? 'Not recorded'}
          </p>
          {patient.emergencyContactPhone ? (
            <p className="text-body-sm text-ink-muted tabular">{patient.emergencyContactPhone}</p>
          ) : null}
        </Card>
        <Card className={(outstanding._sum.amountDue ?? 0) > 0 ? 'border-accent/30 bg-accent-wash' : undefined}>
          <p className="text-overline uppercase text-ink-muted">Outstanding</p>
          <p className="mt-2 text-heading text-ink tabular">{formatMoney(outstanding._sum.amountDue ?? 0)}</p>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-overline uppercase text-ink-muted">Appointments</h2>
        {appointments.length === 0 ? (
          <EmptyState title="No appointments" body="This patient has not booked yet." />
        ) : (
          <Card padded={false}>
            <ul className="divide-y divide-border">
              {appointments.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                  <span className="w-40 shrink-0 text-body-sm text-ink tabular">
                    {formatDateTime(a.startAt)}
                  </span>
                  <span className="min-w-0 flex-1 text-body-sm text-ink">
                    Dr. {a.doctor.user.fullName}
                    <span className="ml-2 text-caption text-ink-muted">{a.speciality.name}</span>
                  </span>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-overline uppercase text-ink-muted">Billing</h2>
        {invoices.length === 0 ? (
          <EmptyState title="No invoices" body="Bills raised for this patient will appear here." />
        ) : (
          <Card padded={false}>
            <ul className="divide-y divide-border">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                  <span className="w-28 shrink-0 text-caption text-ink-muted tabular">
                    {formatDate(inv.issuedAt)}
                  </span>
                  <span className="min-w-0 flex-1 text-body-sm text-ink">
                    {inv.number}
                    <span className="ml-2 text-caption text-ink-muted">{inv.category.toLowerCase()}</span>
                  </span>
                  <span className="text-body-sm font-semibold text-ink tabular">{formatMoney(inv.total)}</span>
                  {inv.amountDue > 0 ? (
                    <Badge tone="caution">{formatMoney(inv.amountDue)} due</Badge>
                  ) : (
                    <Badge tone="positive">Paid</Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  )
}
