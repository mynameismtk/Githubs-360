'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnkuraCard } from './ui/card'
import { AnkuraBadge } from './ui/badge'
import { AnkuraDoseCheck } from './ui/dose-check'
import { AnkuraSkeleton, AnkuraEmptyState } from './ui/states'
import { IconDrop, IconSprout } from './ui/icons'

interface TodayDose {
  reminderId: string
  drugName: string
  dose: string
  route: string
  isTrigger: boolean
  timeOfDay: string
  notes: string | null
  scheduledFor: string
  outcome: 'TAKEN' | 'SKIPPED' | 'MISSED' | null
}

const ROUTE_LABEL: Record<string, string> = {
  SUBCUTANEOUS: 'subcutaneous',
  INTRAMUSCULAR: 'intramuscular',
  ORAL: 'oral',
  VAGINAL: 'vaginal',
}

function minutesUntil(scheduledFor: string) {
  return Math.round((new Date(scheduledFor).getTime() - Date.now()) / 60000)
}

export function TodayDosesCard({ compact = false }: { compact?: boolean }) {
  const [doses, setDoses] = useState<TodayDose[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [, setNow] = useState(() => Date.now())

  const loadToday = useCallback(async () => {
    setFailed(false)
    try {
      const res = await fetch('/api/ankura/reminders/today')
      if (!res.ok) throw new Error()
      const json = await res.json()
      setDoses(json.data)
    } catch {
      setFailed(true)
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    void loadToday()
  }, [loadToday])

  async function toggle(dose: TodayDose) {
    const nextOutcome = dose.outcome === 'TAKEN' ? 'MISSED' : 'TAKEN'
    setDoses((prev) => prev?.map((d) => (d.reminderId === dose.reminderId ? { ...d, outcome: nextOutcome } : d)) ?? null)
    await fetch(`/api/ankura/reminders/${dose.reminderId}/dose`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scheduledFor: dose.scheduledFor, outcome: nextOutcome }),
    }).catch(() => void loadToday())
  }

  if (failed) {
    return (
      <AnkuraCard>
        <p className="text-body-sm text-a-ink-muted">We couldn't load today's reminders. Pull to refresh.</p>
      </AnkuraCard>
    )
  }

  if (!doses) {
    return (
      <div className="space-y-2.5">
        <AnkuraSkeleton className="h-16" />
        <AnkuraSkeleton className="h-16" />
      </div>
    )
  }

  const shown = compact ? doses.slice(0, 3) : doses

  if (doses.length === 0) {
    return (
      <AnkuraEmptyState
        icon={<IconDrop size={28} />}
        title="Nothing scheduled for today"
        body="Add your protocol and we'll remind you gently, right when it matters."
      />
    )
  }

  return (
    <div className="space-y-2.5">
      {shown.map((dose) => {
        const mins = minutesUntil(dose.scheduledFor)
        const taken = dose.outcome === 'TAKEN'
        return (
          <AnkuraCard
            key={dose.reminderId + dose.scheduledFor}
            className={dose.isTrigger && !taken ? 'border-a-accent/60 bg-a-accent-wash/40' : undefined}
          >
            <div className="flex items-center gap-3.5">
              <AnkuraDoseCheck
                checked={taken}
                onToggle={() => void toggle(dose)}
                label={`Mark ${dose.drugName} as taken`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className={`font-a-serif text-base ${taken ? 'text-a-ink-muted line-through decoration-a-brand/40' : 'text-a-ink'}`}>
                    {dose.drugName} <span className="font-a-sans text-body-sm font-normal text-a-ink-muted">{dose.dose}</span>
                  </p>
                  {dose.isTrigger ? (
                    <AnkuraBadge tone="accent" icon={<IconSprout size={12} />}>
                      Trigger shot
                    </AnkuraBadge>
                  ) : null}
                </div>
                <p className="text-caption text-a-ink-subtle">
                  {dose.timeOfDay} · {ROUTE_LABEL[dose.route]}
                  {!taken && mins > 0 && mins < 180 ? ` · in ${mins} min` : null}
                  {!taken && mins <= 0 && mins > -60 ? ' · now' : null}
                  {!taken && mins <= -60 ? ` · ${Math.abs(Math.round(mins / 60))}h ago` : null}
                </p>
              </div>
            </div>
          </AnkuraCard>
        )
      })}
      {compact && doses.length > 3 ? (
        <p className="pt-1 text-center text-caption text-a-ink-subtle">+{doses.length - 3} more today</p>
      ) : null}
    </div>
  )
}
