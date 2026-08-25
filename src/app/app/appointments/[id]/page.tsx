import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getActor } from '@/server/auth/session'
import { getAppointment } from '@/server/services/appointment-service'
import { getClinic } from '@/server/services/clinic-service'
import { isAppError } from '@/lib/errors'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/patterns/appointment-status'
import { AppointmentActions } from './actions'
import { IconPin, IconPhone, IconChevronLeft, IconAlert } from '@/components/ui/icons'
import { formatLongDate, formatTime, ageLabel } from '@/lib/dates'
import { formatMoney } from '@/lib/money'

export const dynamic = 'force-dynamic'

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor()
  if (!actor) redirect('/login')
  const { id } = await params

  let appointment
  try {
    appointment = await getAppointment(actor, id)
  } catch (e) {
    // A denied or missing appointment resolves to the same not-found screen: whether it
    // exists is not something we confirm to someone without access.
    if (isAppError(e) && (e.code === 'NOT_FOUND' || e.code === 'FORBIDDEN')) notFound()
    throw e
  }

  const clinic = await getClinic()
  const isUpcoming =
    appointment.startAt > new Date() && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appointment.status)
  const fee = appointment.isFollowUp
    ? (appointment.doctor.followUpFee ?? appointment.doctor.consultationFee)
    : appointment.doctor.consultationFee

  return (
    <div className="space-y-5">
      <Link
        href="/app/appointments"
        className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full pl-1 pr-3 text-body-sm font-semibold text-ink-muted"
      >
        <IconChevronLeft size={18} />
        Appointments
      </Link>

      <div>
        <StatusBadge status={appointment.status} />
        <h1 className="mt-3 text-title text-ink">{formatLongDate(appointment.startAt)}</h1>
        <p className="mt-1 text-heading text-brand-ink tabular">{formatTime(appointment.startAt)}</p>
      </div>

      <Card>
        <div className="flex gap-3.5">
          <Avatar name={appointment.doctor.user.fullName} src={appointment.doctor.photoUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-subheading text-ink">Dr. {appointment.doctor.user.fullName}</p>
            <p className="text-body-sm text-ink-muted">{appointment.speciality.name}</p>
            <p className="mt-1 text-caption text-ink-subtle">{appointment.doctor.qualifications}</p>
          </div>
        </div>
      </Card>

      {/* Naming the patient in the body, not only in the header — a family account must
          never leave any doubt about whose appointment this is. docs/06 §5. */}
      <Card className="space-y-3">
        <Row label="Patient" value={appointment.patient.fullName} />
        <Row
          label="Age / sex"
          value={`${ageLabel(appointment.patient.dateOfBirth)} · ${sexLabel(appointment.patient.gender)}`}
        />
        <Row label="Patient ID" value={appointment.patient.mrn} />
        <Row label="Consultation fee" value={formatMoney(fee)} />
        {appointment.reasonForVisit ? <Row label="Reason" value={appointment.reasonForVisit} /> : null}
      </Card>

      {appointment.location ? (
        <Card>
          <p className="text-overline uppercase text-ink-muted">Where</p>
          <p className="mt-2 text-body font-semibold text-ink">{appointment.location.name}</p>
          <p className="text-body-sm text-ink-muted">
            {appointment.location.addressLine1}, {appointment.location.city}
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href={
                appointment.location.mapsUrl ??
                `https://maps.google.com/?q=${encodeURIComponent(`${appointment.location.addressLine1}, ${appointment.location.city}`)}`
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-border-strong bg-surface text-body-sm font-semibold text-ink"
            >
              <IconPin size={16} />
              Directions
            </a>
            {appointment.location.phone ? (
              <a
                href={`tel:${appointment.location.phone}`}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-border-strong bg-surface text-body-sm font-semibold text-ink"
              >
                <IconPhone size={16} />
                Call
              </a>
            ) : null}
          </div>
        </Card>
      ) : null}

      {appointment.speciality.preparationNotes && isUpcoming ? (
        <Card className="border-[var(--caution)]/25 bg-[var(--caution-wash)]">
          <p className="flex items-start gap-2 text-body-sm text-ink">
            <IconAlert size={16} className="mt-0.5 shrink-0 text-[var(--caution)]" />
            <span>
              <span className="font-semibold">Before your visit: </span>
              {appointment.speciality.preparationNotes}
            </span>
          </p>
        </Card>
      ) : null}

      {appointment.status === 'CANCELLED' ? (
        <Card className="border-[var(--critical)]/20 bg-[var(--critical-wash)]">
          <p className="text-body-sm text-ink">
            This appointment was cancelled
            {appointment.cancellationReason ? ` — ${appointment.cancellationReason}` : ''}.
          </p>
        </Card>
      ) : null}

      {isUpcoming ? (
        <AppointmentActions
          appointmentId={appointment.id}
          doctorId={appointment.doctor.id}
          doctorName={appointment.doctor.user.fullName}
          supportPhone={clinic.supportPhone}
        />
      ) : (
        <a
          href={`tel:${clinic.supportPhone}`}
          className="flex h-11 items-center justify-center gap-2 rounded-md border border-border-strong bg-surface font-semibold text-ink"
        >
          <IconPhone size={18} />
          Contact the clinic
        </a>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="shrink-0 text-body-sm text-ink-muted">{label}</span>
      <span className="text-right text-body font-semibold text-ink">{value}</span>
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
