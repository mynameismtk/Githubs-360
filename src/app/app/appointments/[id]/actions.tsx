'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Field, Textarea } from '@/components/ui/input'
import { ErrorState, Skeleton, EmptyState } from '@/components/ui/states'
import { IconClock } from '@/components/ui/icons'
import { cn } from '@/lib/cn'

interface DayAvailability {
  dateKey: string
  availableCount: number
  slots: Array<{ startAt: string; label: string; available: boolean }>
}

export function AppointmentActions({
  appointmentId, doctorId, doctorName, supportPhone,
}: {
  appointmentId: string
  doctorId: string
  doctorName: string
  supportPhone: string
}) {
  const router = useRouter()
  const [sheet, setSheet] = useState<'none' | 'cancel' | 'reschedule'>('none')
  const [reason, setReason] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function act(body: Record<string, unknown>) {
    setPending(true)
    setError(null)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message ?? 'We could not complete that. Please try again.')
        return null
      }
      return json.data as { id: string }
    } catch {
      setError('We could not reach the clinic. Check your connection and try again.')
      return null
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <div className="space-y-2.5">
        <Button variant="secondary" size="lg" fullWidth onClick={() => setSheet('reschedule')}>
          Reschedule
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={() => setSheet('cancel')}>
          Cancel appointment
        </Button>
      </div>

      <Sheet open={sheet === 'cancel'} onClose={() => setSheet('none')} title="Cancel this appointment?">
        <p className="mb-4 text-body text-ink-muted">
          Your slot with Dr. {doctorName} will be released for another patient. You can book again at
          any time.
        </p>
        <Field label="Reason (optional)" htmlFor="cancel-reason" hint="This helps the clinic plan.">
          <Textarea
            id="cancel-reason"
            value={reason}
            maxLength={300}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. I'm travelling that week"
          />
        </Field>
        {error ? (
          <p role="alert" className="mt-3 text-caption font-medium text-[var(--critical)]">
            ⚠ {error}
          </p>
        ) : null}
        <div className="mt-5 space-y-2.5">
          <Button
            variant="danger"
            size="lg"
            fullWidth
            loading={pending}
            onClick={async () => {
              const result = await act({ action: 'cancel', reason: reason.trim() || undefined })
              if (result) {
                setSheet('none')
                router.refresh()
              }
            }}
          >
            Yes, cancel it
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={() => setSheet('none')}>
            Keep my appointment
          </Button>
        </div>
      </Sheet>

      <Sheet open={sheet === 'reschedule'} onClose={() => setSheet('none')} title="Pick a new time">
        <RescheduleSlots
          doctorId={doctorId}
          supportPhone={supportPhone}
          pending={pending}
          error={error}
          onPick={async (iso) => {
            const result = await act({ action: 'reschedule', startAt: iso })
            if (result) {
              setSheet('none')
              router.replace(`/app/appointments/${result.id}`)
              router.refresh()
            }
          }}
        />
      </Sheet>
    </>
  )
}

function RescheduleSlots({
  doctorId, supportPhone, pending, error, onPick,
}: {
  doctorId: string
  supportPhone: string
  pending: boolean
  error: string | null
  onPick: (iso: string) => void
}) {
  const [days, setDays] = useState<DayAvailability[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [activeDate, setActiveDate] = useState<string | null>(null)

  const load = useCallback(async () => {
    setFailed(false)
    setDays(null)
    try {
      const res = await fetch(`/api/doctors/${doctorId}/availability?days=14`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      const data: DayAvailability[] = json.data
      setDays(data)
      setActiveDate(data.find((d) => d.availableCount > 0)?.dateKey ?? data[0]?.dateKey ?? null)
    } catch {
      setFailed(true)
    }
  }, [doctorId])

  useEffect(() => {
    void load()
  }, [load])

  if (failed) {
    return <ErrorState title="We couldn't load available times" onRetry={() => void load()} clinicPhone={supportPhone} />
  }
  if (!days) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-16 rounded-md" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  const day = days.find((d) => d.dateKey === activeDate)
  const bookable = day?.slots.filter((s) => s.available) ?? []

  return (
    <div className="space-y-4">
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {days.map((d) => {
          const date = new Date(`${d.dateKey}T12:00:00Z`)
          const isActive = d.dateKey === activeDate
          return (
            <button
              key={d.dateKey}
              onClick={() => setActiveDate(d.dateKey)}
              aria-pressed={isActive}
              className={cn(
                'flex h-[68px] w-16 shrink-0 flex-col items-center justify-center rounded-md border',
                isActive ? 'border-brand bg-brand text-white' : 'border-border bg-surface text-ink',
                d.availableCount === 0 && !isActive && 'opacity-45',
              )}
            >
              <span className="text-caption font-semibold">
                {date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' })}
              </span>
              <span className="text-heading tabular">
                {date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric' })}
              </span>
            </button>
          )
        })}
      </div>

      {bookable.length === 0 ? (
        <EmptyState icon={<IconClock size={24} />} title="No slots on this day" body="Try another date above." />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {bookable.map((slot) => (
            <button
              key={slot.startAt}
              disabled={pending}
              onClick={() => onPick(slot.startAt)}
              className="h-11 rounded-md border border-border-strong bg-surface text-body-sm font-semibold tabular text-ink hover:border-brand hover:text-brand-ink disabled:opacity-50"
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <p role="alert" className="text-caption font-medium text-[var(--critical)]">⚠ {error}</p>
      ) : null}
    </div>
  )
}
