'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState, ErrorState, Skeleton, SuccessNote } from '@/components/ui/states'
import { Field, Textarea } from '@/components/ui/input'
import { DynamicIcon, IconChevronLeft, IconCheck, IconClock, IconAlert } from '@/components/ui/icons'
import { formatMoney } from '@/lib/money'
import { cn } from '@/lib/cn'

interface SpecialityOption {
  id: string
  name: string
  blurb: string | null
  iconKey: string
  preparationNotes: string | null
  doctorCount: number
}
interface DoctorOption {
  id: string
  name: string
  specialityId: string
  specialityName: string
  qualifications: string
  yearsExperience: number
  languages: string[]
  consultationFee: number
  photoUrl: string | null
  nextAvailableAt: string | null
}
interface FamilyOption {
  patientId: string
  name: string
  relationship: string
  isSelf: boolean
  canBook: boolean
}
interface DayAvailability {
  dateKey: string
  availableCount: number
  slots: Array<{ startAt: string; label: string; available: boolean }>
}

type Step = 'speciality' | 'doctor' | 'slot' | 'confirm' | 'done'

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', ml: 'Malayalam', ta: 'Tamil', hi: 'Hindi', kn: 'Kannada', te: 'Telugu',
}
const RELATIONSHIP_LABEL: Record<string, string> = {
  SELF: 'You', SPOUSE: 'Spouse', CHILD: 'Child', PARENT: 'Parent',
  SIBLING: 'Sibling', GRANDPARENT: 'Grandparent', GUARDIAN: 'Guardian', OTHER: 'Family',
}

export function BookingFlow({
  clinicName, supportPhone, specialities, doctors, family, defaultPatientId, preselect,
}: {
  clinicName: string
  supportPhone: string
  specialities: SpecialityOption[]
  doctors: DoctorOption[]
  family: FamilyOption[]
  defaultPatientId: string
  preselect: { specialityId: string | null; doctorId: string | null; followUpId: string | null; reason: string | null }
}) {
  const [specialityId, setSpecialityId] = useState<string | null>(preselect.specialityId)
  const [doctorId, setDoctorId] = useState<string | null>(preselect.doctorId)
  const [patientId, setPatientId] = useState(defaultPatientId)
  const [slotIso, setSlotIso] = useState<string | null>(null)
  const [reason, setReason] = useState(preselect.reason ?? '')
  const [step, setStep] = useState<Step>(
    preselect.doctorId ? 'slot' : preselect.specialityId ? 'doctor' : 'speciality',
  )
  const [confirmed, setConfirmed] = useState<{ id: string; doctorName: string; when: string; patientName: string } | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const speciality = specialities.find((s) => s.id === specialityId) ?? null
  const doctor = doctors.find((d) => d.id === doctorId) ?? null
  const patient = family.find((f) => f.patientId === patientId) ?? null
  const specialityDoctors = useMemo(
    () => doctors.filter((d) => d.specialityId === specialityId),
    [doctors, specialityId],
  )

  function back() {
    setSubmitError(null)
    if (step === 'confirm') return setStep('slot')
    if (step === 'slot') return setStep(preselect.specialityId ? 'doctor' : 'doctor')
    if (step === 'doctor') return setStep('speciality')
  }

  async function submit() {
    if (!doctor || !slotIso) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId: doctor.id,
          startAt: slotIso,
          consultationType: 'IN_PERSON',
          reasonForVisit: reason.trim() || null,
          followUpId: preselect.followUpId,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setSubmitError(json.error?.message ?? 'We could not confirm that booking. Please try again.')
        // A lost slot race must send the patient back to a fresh slot list, not leave
        // them staring at a slot that no longer exists.
        if (json.error?.code === 'SLOT_TAKEN') {
          setSlotIso(null)
          setStep('slot')
        }
        return
      }
      setConfirmed({
        id: json.data.id,
        doctorName: json.data.doctorName,
        when: new Date(json.data.startAt).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short',
          hour: 'numeric', minute: '2-digit', hour12: true,
        }),
        patientName: json.data.patientName,
      })
      setStep('done')
    } catch {
      setSubmitError('We could not reach the clinic. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'done' && confirmed) {
    return (
      <div className="space-y-6 py-4">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--positive-wash)] text-[var(--positive)]">
            <IconCheck size={32} />
          </span>
          <h1 className="text-title text-ink">Appointment confirmed</h1>
          <p className="mt-2 text-body text-ink-muted">
            {confirmed.patientName} with Dr. {confirmed.doctorName}
          </p>
          <p className="mt-1 text-body font-semibold text-ink tabular">{confirmed.when}</p>
        </div>

        {speciality?.preparationNotes ? (
          <Card className="border-[var(--caution)]/25 bg-[var(--caution-wash)]">
            <p className="flex items-start gap-2 text-body-sm text-ink">
              <IconAlert size={16} className="mt-0.5 shrink-0 text-[var(--caution)]" />
              <span>
                <span className="font-semibold">Before your visit: </span>
                {speciality.preparationNotes}
              </span>
            </p>
          </Card>
        ) : null}

        <div className="space-y-2.5">
          <Link
            href={`/app/appointments/${confirmed.id}`}
            className="flex h-[52px] items-center justify-center rounded-md bg-brand font-semibold text-white"
          >
            View appointment
          </Link>
          <Link
            href="/app"
            className="flex h-11 items-center justify-center rounded-md border border-border-strong bg-surface font-semibold text-ink"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        {step !== 'speciality' ? (
          <button
            onClick={back}
            aria-label="Back"
            className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-sunken"
          >
            <IconChevronLeft size={20} />
          </button>
        ) : null}
        <h1 className="text-title text-ink">Book an appointment</h1>
      </div>

      <StepIndicator step={step} />

      {preselect.followUpId ? (
        <div className="rounded-md border border-brand/25 bg-brand-wash px-4 py-3">
          <p className="text-body-sm text-brand-ink">
            <span className="font-semibold">Follow-up booking.</span> We&apos;ve kept your doctor and the
            reason from your last visit.
          </p>
        </div>
      ) : null}

      {step === 'speciality' ? (
        <section>
          <h2 className="mb-3 text-subheading text-ink">What do you need help with?</h2>
          <ul className="space-y-2.5">
            {specialities.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => {
                    setSpecialityId(s.id)
                    setDoctorId(null)
                    setStep('doctor')
                  }}
                  className="flex w-full items-center gap-3.5 rounded-lg border border-border bg-surface p-4 text-left transition-colors duration-fast hover:border-border-strong"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-wash text-brand">
                    <DynamicIcon name={s.iconKey} size={21} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-semibold text-ink">{s.name}</span>
                    {s.blurb ? (
                      <span className="block text-body-sm text-ink-muted">{s.blurb}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {step === 'doctor' ? (
        <section>
          <h2 className="mb-1 text-subheading text-ink">Choose a doctor</h2>
          <p className="mb-3 text-body-sm text-ink-muted">{speciality?.name}</p>
          {specialityDoctors.length === 0 ? (
            <EmptyState
              title="No doctors available"
              body={`We don't have a ${speciality?.name ?? ''} doctor taking appointments right now. Please call the clinic.`}
              action={{ label: 'Choose another speciality', href: '/app/book' }}
            />
          ) : (
            <ul className="space-y-2.5">
              {specialityDoctors.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => {
                      setDoctorId(d.id)
                      setSlotIso(null)
                      setStep('slot')
                    }}
                    className="w-full rounded-lg border border-border bg-surface p-4 text-left transition-colors duration-fast hover:border-border-strong"
                  >
                    <div className="flex gap-3.5">
                      <Avatar name={d.name} src={d.photoUrl} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-body font-semibold text-ink">Dr. {d.name}</p>
                        <p className="mt-0.5 text-caption text-ink-muted">{d.qualifications}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-muted">
                          <span>{d.yearsExperience} yrs experience</span>
                          <span aria-hidden>·</span>
                          <span>{d.languages.map((l) => LANGUAGE_NAMES[l] ?? l).join(', ')}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge tone="neutral">{formatMoney(d.consultationFee)}</Badge>
                          {d.nextAvailableAt ? (
                            <Badge tone="positive" icon={<IconClock size={12} />}>
                              {availabilityLabel(d.nextAvailableAt)}
                            </Badge>
                          ) : (
                            <Badge tone="caution">No slots in the next 2 weeks</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {step === 'slot' && doctor ? (
        <SlotPicker
          doctor={doctor}
          selected={slotIso}
          onSelect={(iso) => {
            setSlotIso(iso)
            setStep('confirm')
          }}
        />
      ) : null}

      {step === 'confirm' && doctor && slotIso ? (
        <section className="space-y-5">
          <h2 className="text-subheading text-ink">Review and confirm</h2>

          <Card className="space-y-3">
            <Row label="Patient" value={patient?.name ?? ''} />
            <Row label="Doctor" value={`Dr. ${doctor.name}`} />
            <Row label="Speciality" value={doctor.specialityName} />
            <Row
              label="When"
              value={new Date(slotIso).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short',
                hour: 'numeric', minute: '2-digit', hour12: true,
              })}
            />
            <Row label="Consultation fee" value={formatMoney(doctor.consultationFee)} />
          </Card>

          {family.length > 1 ? (
            <div>
              <h3 className="mb-2 text-body-sm font-semibold text-ink">Who is this appointment for?</h3>
              <div className="space-y-2">
                {family.map((f) => (
                  <button
                    key={f.patientId}
                    onClick={() => f.canBook && setPatientId(f.patientId)}
                    disabled={!f.canBook}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md border p-3 text-left disabled:opacity-50',
                      f.patientId === patientId ? 'border-brand bg-brand-wash' : 'border-border bg-surface',
                    )}
                  >
                    <Avatar name={f.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-sm font-semibold text-ink">{f.name}</span>
                      <span className="block text-caption text-ink-muted">
                        {RELATIONSHIP_LABEL[f.relationship] ?? 'Family'}
                        {!f.canBook ? ' · view only' : ''}
                      </span>
                    </span>
                    {f.patientId === patientId ? <IconCheck size={18} className="text-brand" /> : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <Field
            label="What would you like to discuss?"
            htmlFor="reason"
            hint="Optional. It helps the doctor prepare for your visit."
          >
            <Textarea
              id="reason"
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Chest discomfort when climbing stairs"
            />
          </Field>

          {speciality?.preparationNotes ? (
            <div className="rounded-md border border-[var(--caution)]/25 bg-[var(--caution-wash)] px-4 py-3">
              <p className="flex items-start gap-2 text-body-sm text-ink">
                <IconAlert size={16} className="mt-0.5 shrink-0 text-[var(--caution)]" />
                <span>{speciality.preparationNotes}</span>
              </p>
            </div>
          ) : null}

          {submitError ? (
            <ErrorState title="We couldn't confirm that" body={submitError} clinicPhone={supportPhone} />
          ) : null}

          <Button size="lg" fullWidth loading={submitting} onClick={submit}>
            Confirm appointment
          </Button>
          <p className="text-center text-caption text-ink-subtle">
            You can reschedule or cancel any time before your visit. Payment is collected at {clinicName}.
          </p>
        </section>
      ) : null}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-body-sm text-ink-muted">{label}</span>
      <span className="text-right text-body font-semibold text-ink">{value}</span>
    </div>
  )
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Array<{ key: Step; label: string }> = [
    { key: 'speciality', label: 'Speciality' },
    { key: 'doctor', label: 'Doctor' },
    { key: 'slot', label: 'Time' },
    { key: 'confirm', label: 'Confirm' },
  ]
  const currentIndex = steps.findIndex((s) => s.key === step)
  return (
    <ol className="flex items-center gap-1.5" aria-label={`Step ${currentIndex + 1} of ${steps.length}`}>
      {steps.map((s, i) => (
        <li key={s.key} className="flex flex-1 flex-col gap-1.5">
          <span
            aria-hidden
            className={cn('h-1 rounded-full', i <= currentIndex ? 'bg-brand' : 'bg-border-strong')}
          />
          <span
            className={cn(
              'text-[11px] font-semibold',
              i === currentIndex ? 'text-brand-ink' : 'text-ink-subtle',
            )}
          >
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  )
}

/**
 * Live slot picker. This is the one part of the flow that must hit the network as the
 * patient moves, because availability changes underneath them.
 */
function SlotPicker({
  doctor, selected, onSelect,
}: {
  doctor: DoctorOption
  selected: string | null
  onSelect: (iso: string) => void
}) {
  const [days, setDays] = useState<DayAvailability[] | null>(null)
  const [error, setError] = useState(false)
  const [activeDate, setActiveDate] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(false)
    setDays(null)
    try {
      const res = await fetch(`/api/doctors/${doctor.id}/availability?days=14`)
      if (!res.ok) throw new Error('failed')
      const json = await res.json()
      const data: DayAvailability[] = json.data
      setDays(data)
      setActiveDate((current) => current ?? data.find((d) => d.availableCount > 0)?.dateKey ?? data[0]?.dateKey ?? null)
    } catch {
      setError(true)
    }
  }, [doctor.id])

  useEffect(() => {
    void load()
  }, [load])

  if (error) {
    return (
      <ErrorState
        title="We couldn't load available times"
        body="Please try again in a moment."
        onRetry={() => void load()}
      />
    )
  }

  if (!days) {
    return (
      <div className="space-y-4">
        <h2 className="text-subheading text-ink">Pick a time</h2>
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-16 shrink-0 rounded-md" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-11 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  const day = days.find((d) => d.dateKey === activeDate) ?? null
  const bookable = day?.slots.filter((s) => s.available) ?? []

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-subheading text-ink">Pick a time</h2>
        <p className="text-body-sm text-ink-muted">Dr. {doctor.name} · {doctor.specialityName}</p>
      </div>

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {days.map((d) => {
          const date = new Date(`${d.dateKey}T12:00:00Z`)
          const isActive = d.dateKey === activeDate
          const isFull = d.availableCount === 0
          return (
            <button
              key={d.dateKey}
              onClick={() => setActiveDate(d.dateKey)}
              aria-pressed={isActive}
              className={cn(
                'flex h-[68px] w-16 shrink-0 flex-col items-center justify-center rounded-md border transition-colors duration-fast',
                isActive ? 'border-brand bg-brand text-white' : 'border-border bg-surface text-ink',
                isFull && !isActive && 'opacity-45',
              )}
            >
              <span className="text-caption font-semibold">
                {date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' })}
              </span>
              <span className="text-heading tabular">
                {date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric' })}
              </span>
              <span className={cn('text-[10px] font-semibold', isActive ? 'text-white/80' : 'text-ink-subtle')}>
                {isFull ? 'Full' : `${d.availableCount} free`}
              </span>
            </button>
          )
        })}
      </div>

      {bookable.length === 0 ? (
        <EmptyState
          icon={<IconClock size={26} />}
          title="No slots available on this day"
          body="Try another date above, or choose a different doctor."
        />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {bookable.map((slot) => (
            <button
              key={slot.startAt}
              onClick={() => onSelect(slot.startAt)}
              className={cn(
                'h-11 rounded-md border text-body-sm font-semibold tabular transition-colors duration-fast',
                slot.startAt === selected
                  ? 'border-brand bg-brand text-white'
                  : 'border-border-strong bg-surface text-ink hover:border-brand hover:text-brand-ink',
              )}
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

function availabilityLabel(iso: string): string {
  const date = new Date(iso)
  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
  const today = dayKey(new Date())
  const tomorrow = dayKey(new Date(Date.now() + 86_400_000))
  const target = dayKey(date)
  const time = date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true })
  if (target === today) return `Today, ${time}`
  if (target === tomorrow) return `Tomorrow, ${time}`
  return `${date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' })}, ${time}`
}
