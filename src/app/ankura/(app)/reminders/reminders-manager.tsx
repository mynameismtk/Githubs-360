'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnkuraCard, AnkuraSectionTitle } from '@/components/ankura/ui/card'
import { AnkuraButton } from '@/components/ankura/ui/button'
import { AnkuraBadge } from '@/components/ankura/ui/badge'
import { AnkuraField, AnkuraInput, AnkuraSelect } from '@/components/ankura/ui/input'
import { AnkuraSkeleton, AnkuraEmptyState } from '@/components/ankura/ui/states'
import { IconDrop, IconPlus, IconTrash, IconSprout } from '@/components/ankura/ui/icons'
import { COMMON_DRUGS } from '@/lib/ankura/common-drugs'

interface Reminder {
  id: string
  drugName: string
  dose: string
  route: string
  isTrigger: boolean
  timeOfDay: string
  startDate: string
  endDate: string | null
  notes: string | null
}

const ROUTES = [
  { value: 'SUBCUTANEOUS', label: 'Subcutaneous' },
  { value: 'INTRAMUSCULAR', label: 'Intramuscular' },
  { value: 'ORAL', label: 'Oral' },
  { value: 'VAGINAL', label: 'Vaginal' },
]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function RemindersManager() {
  const [reminders, setReminders] = useState<Reminder[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setFailed(false)
    try {
      const res = await fetch('/api/ankura/reminders')
      if (!res.ok) throw new Error()
      setReminders((await res.json()).data)
    } catch {
      setFailed(true)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function remove(id: string) {
    setReminders((prev) => prev?.filter((r) => r.id !== id) ?? null)
    await fetch(`/api/ankura/reminders/${id}`, { method: 'DELETE' }).catch(() => void load())
  }

  return (
    <section>
      <AnkuraSectionTitle
        eyebrow="Your protocol"
        title="All reminders"
        action={
          <AnkuraButton size="sm" variant={showForm ? 'secondary' : 'primary'} onClick={() => setShowForm((v) => !v)}>
            <IconPlus size={16} /> {showForm ? 'Close' : 'Add'}
          </AnkuraButton>
        }
      />

      {showForm ? <AddReminderForm onAdded={() => { setShowForm(false); void load() }} /> : null}

      {failed ? (
        <p className="text-body-sm text-a-ink-muted">We couldn't load your reminders.</p>
      ) : !reminders ? (
        <div className="space-y-2.5">
          <AnkuraSkeleton className="h-16" />
          <AnkuraSkeleton className="h-16" />
        </div>
      ) : reminders.length === 0 ? (
        <AnkuraEmptyState
          icon={<IconDrop size={28} />}
          title="No reminders yet"
          body="Add the medicines from your prescription and we'll remind you gently, every day."
          action={
            !showForm ? (
              <AnkuraButton size="sm" onClick={() => setShowForm(true)}>
                <IconPlus size={16} /> Add your first reminder
              </AnkuraButton>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2.5">
          {reminders.map((r) => (
            <AnkuraCard key={r.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-a-serif text-base text-a-ink">{r.drugName}</p>
                  {r.isTrigger ? (
                    <AnkuraBadge tone="accent" icon={<IconSprout size={12} />}>Trigger shot</AnkuraBadge>
                  ) : null}
                </div>
                <p className="text-caption text-a-ink-subtle">
                  {r.dose} · {r.timeOfDay} · {r.route.toLowerCase()}
                </p>
                {r.notes ? <p className="mt-0.5 text-caption text-a-ink-muted">{r.notes}</p> : null}
              </div>
              <button
                type="button"
                aria-label={`Remove ${r.drugName} reminder`}
                onClick={() => void remove(r.id)}
                className="shrink-0 rounded-full p-2 text-a-ink-subtle hover:bg-a-critical-wash hover:text-a-critical"
              >
                <IconTrash size={18} />
              </button>
            </AnkuraCard>
          ))}
        </div>
      )}
    </section>
  )
}

function AddReminderForm({ onAdded }: { onAdded: () => void }) {
  const [drugName, setDrugName] = useState('')
  const [dose, setDose] = useState('')
  const [route, setRoute] = useState('SUBCUTANEOUS')
  const [isTrigger, setIsTrigger] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState('21:00')
  const [startDate, setStartDate] = useState(todayIso())
  const [notes, setNotes] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function pickCommon(name: string) {
    const match = COMMON_DRUGS.find((d) => d.name === name)
    setDrugName(name)
    if (match) {
      setRoute(match.route)
      setIsTrigger(Boolean(match.isTrigger))
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/ankura/reminders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ drugName, dose, route, isTrigger, timeOfDay, startDate, notes: notes || null }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message ?? 'We could not add that reminder.')
        return
      }
      onAdded()
    } catch {
      setError('We could not reach Ankura. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AnkuraCard className="mb-4">
      <form onSubmit={submit} className="space-y-4">
        <AnkuraField label="Medicine" htmlFor="drugName" required hint="Pick a common one or type your own.">
          <AnkuraInput
            id="drugName"
            list="common-drugs"
            value={drugName}
            onChange={(e) => pickCommon(e.target.value)}
            placeholder="e.g. Gonal-F"
            required
          />
          <datalist id="common-drugs">
            {COMMON_DRUGS.map((d) => (
              <option key={d.name} value={d.name} />
            ))}
          </datalist>
        </AnkuraField>

        <AnkuraField label="Dose (from your prescription)" htmlFor="dose" required>
          <AnkuraInput id="dose" value={dose} onChange={(e) => setDose(e.target.value)} placeholder="e.g. 225 IU" required />
        </AnkuraField>

        <div className="grid grid-cols-2 gap-3">
          <AnkuraField label="Route" htmlFor="route">
            <AnkuraSelect id="route" value={route} onChange={(e) => setRoute(e.target.value)}>
              {ROUTES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </AnkuraSelect>
          </AnkuraField>
          <AnkuraField label="Time" htmlFor="timeOfDay">
            <AnkuraInput id="timeOfDay" type="time" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} />
          </AnkuraField>
        </div>

        <AnkuraField label="Start date" htmlFor="startDate">
          <AnkuraInput id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </AnkuraField>

        <label className="flex items-center gap-2.5 rounded-xl border border-a-accent/40 bg-a-accent-wash/50 px-3.5 py-3">
          <input
            type="checkbox"
            checked={isTrigger}
            onChange={(e) => setIsTrigger(e.target.checked)}
            className="h-5 w-5 accent-[var(--a-accent)]"
          />
          <span className="text-body-sm text-a-ink">
            This is my <strong>trigger shot</strong> — time it exactly.
          </span>
        </label>

        <AnkuraField label="Notes (optional)" htmlFor="notes">
          <AnkuraInput id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. left side, ice first" />
        </AnkuraField>

        {error ? <p role="alert" className="text-caption font-medium text-a-critical">{error}</p> : null}

        <AnkuraButton type="submit" fullWidth loading={pending} disabled={!drugName.trim() || !dose.trim()}>
          Save reminder
        </AnkuraButton>
      </form>
    </AnkuraCard>
  )
}
