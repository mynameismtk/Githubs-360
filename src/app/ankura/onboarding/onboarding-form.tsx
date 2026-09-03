'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnkuraButton } from '@/components/ankura/ui/button'
import { AnkuraField, AnkuraInput, AnkuraSelect } from '@/components/ankura/ui/input'

const CYCLE_TYPES = [
  { value: 'IVF', label: 'IVF' },
  { value: 'IUI', label: 'IUI' },
  { value: 'FET', label: 'Frozen embryo transfer (FET)' },
  { value: 'EGG_FREEZING', label: 'Egg freezing' },
]

const CYCLE_STAGES = [
  { value: 'STIMULATION', label: 'Stimulation' },
  { value: 'RETRIEVAL', label: 'Around retrieval' },
  { value: 'TRANSFER', label: 'Around transfer' },
  { value: 'TWO_WEEK_WAIT', label: 'The two-week wait' },
  { value: 'BETA_RESULT', label: 'Waiting on my beta result' },
  { value: 'PREGNANT', label: 'Pregnant' },
  { value: 'NOT_PREGNANT', label: 'Between cycles' },
  { value: 'PAUSED', label: 'On a pause' },
]

export function AnkuraOnboardingForm({ clinics }: { clinics: Array<{ slug: string; name: string; city: string | null }> }) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [cycleType, setCycleType] = useState('IVF')
  const [cycleStage, setCycleStage] = useState('STIMULATION')
  const [cycleStartedAt, setCycleStartedAt] = useState('')
  const [clinicSlug, setClinicSlug] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/ankura/onboarding', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName,
          cycleType,
          cycleStage,
          cycleStartedAt: cycleStartedAt || null,
          clinicSlug: clinicSlug || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message ?? 'We could not save that. Please try again.')
        return
      }
      router.push('/ankura/home')
      router.refresh()
    } catch {
      setError('We could not reach Ankura. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <AnkuraField label="What should we call you?" htmlFor="fullName" required>
        <AnkuraInput id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your first name is enough" autoFocus required maxLength={80} />
      </AnkuraField>

      <AnkuraField label="What are you going through?" htmlFor="cycleType" required>
        <AnkuraSelect id="cycleType" value={cycleType} onChange={(e) => setCycleType(e.target.value)}>
          {CYCLE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </AnkuraSelect>
      </AnkuraField>

      <AnkuraField label="Where are you right now?" htmlFor="cycleStage" required>
        <AnkuraSelect id="cycleStage" value={cycleStage} onChange={(e) => setCycleStage(e.target.value)}>
          {CYCLE_STAGES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </AnkuraSelect>
      </AnkuraField>

      <AnkuraField label="When did this cycle start? (optional)" htmlFor="cycleStartedAt" hint="Helps us time your journey content — you can leave this blank.">
        <AnkuraInput id="cycleStartedAt" type="date" value={cycleStartedAt} onChange={(e) => setCycleStartedAt(e.target.value)} />
      </AnkuraField>

      {clinics.length > 0 ? (
        <AnkuraField label="Is a partner clinic looking after you? (optional)" htmlFor="clinicSlug" hint="This personalises your app with your clinic's details.">
          <AnkuraSelect id="clinicSlug" value={clinicSlug} onChange={(e) => setClinicSlug(e.target.value)}>
            <option value="">Not right now</option>
            {clinics.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}{c.city ? ` — ${c.city}` : ''}
              </option>
            ))}
          </AnkuraSelect>
        </AnkuraField>
      ) : null}

      {error ? (
        <p role="alert" className="text-caption font-medium text-a-critical">{error}</p>
      ) : null}

      <AnkuraButton type="submit" size="lg" fullWidth loading={pending} disabled={!fullName.trim()}>
        Begin
      </AnkuraButton>
    </form>
  )
}
