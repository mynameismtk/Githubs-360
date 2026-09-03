'use client'

import { useState } from 'react'
import { AnkuraCard } from '@/components/ankura/ui/card'
import { AnkuraButton } from '@/components/ankura/ui/button'
import { AnkuraField, AnkuraInput, AnkuraSelect } from '@/components/ankura/ui/input'
import { AnkuraBadge } from '@/components/ankura/ui/badge'
import { AnkuraEmptyState } from '@/components/ankura/ui/states'
import { IconFlask, IconPlus, IconSprout, IconTrash } from '@/components/ankura/ui/icons'

interface TemplateItem {
  drugName: string
  dose: string
  route: string
  timeOfDay: string
  isTrigger: boolean
}
interface Template {
  id: string
  name: string
  items: TemplateItem[]
}

const ROUTES = [
  { value: 'SUBCUTANEOUS', label: 'Subcutaneous' },
  { value: 'INTRAMUSCULAR', label: 'Intramuscular' },
  { value: 'ORAL', label: 'Oral' },
  { value: 'VAGINAL', label: 'Vaginal' },
]

function emptyItem(): TemplateItem {
  return { drugName: '', dose: '', route: 'SUBCUTANEOUS', timeOfDay: '21:00', isTrigger: false }
}

export function ProtocolTemplatesManager({ initialTemplates }: { initialTemplates: Template[] }) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <AnkuraButton size="sm" variant={showForm ? 'secondary' : 'primary'} onClick={() => setShowForm((v) => !v)}>
          <IconPlus size={16} /> {showForm ? 'Close' : 'New template'}
        </AnkuraButton>
      </div>

      {showForm ? (
        <AddTemplateForm
          onAdded={(t) => {
            setTemplates((prev) => [t, ...prev])
            setShowForm(false)
          }}
        />
      ) : null}

      {templates.length === 0 ? (
        <AnkuraEmptyState icon={<IconFlask size={26} />} title="No templates yet" body="Build a starting point for your standard protocol — patients can adjust it to their own prescription." />
      ) : (
        <div className="space-y-2.5">
          {templates.map((t) => (
            <AnkuraCard key={t.id}>
              <p className="mb-2 font-a-serif text-base text-a-ink">{t.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {t.items.map((item, i) => (
                  <AnkuraBadge key={i} tone={item.isTrigger ? 'accent' : 'neutral'} icon={item.isTrigger ? <IconSprout size={11} /> : undefined}>
                    {item.drugName} · {item.timeOfDay}
                  </AnkuraBadge>
                ))}
              </div>
            </AnkuraCard>
          ))}
        </div>
      )}
    </div>
  )
}

function AddTemplateForm({ onAdded }: { onAdded: (t: Template) => void }) {
  const [name, setName] = useState('')
  const [items, setItems] = useState<TemplateItem[]>([emptyItem()])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateItem(index: number, patch: Partial<TemplateItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/ankura/clinic/protocol-templates', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, items }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message ?? 'We could not save that template.')
        return
      }
      onAdded(json.data)
    } catch {
      setError('We could not reach Ankura. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AnkuraCard className="mb-4">
      <form onSubmit={submit} className="space-y-4">
        <AnkuraField label="Template name" htmlFor="t-name" required>
          <AnkuraInput id="t-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard antagonist protocol" required />
        </AnkuraField>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-a-border p-3">
              <div className="grid grid-cols-2 gap-2.5">
                <AnkuraInput placeholder="Drug name" value={item.drugName} onChange={(e) => updateItem(i, { drugName: e.target.value })} />
                <AnkuraInput placeholder="Dose" value={item.dose} onChange={(e) => updateItem(i, { dose: e.target.value })} />
                <AnkuraSelect value={item.route} onChange={(e) => updateItem(i, { route: e.target.value })}>
                  {ROUTES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </AnkuraSelect>
                <AnkuraInput type="time" value={item.timeOfDay} onChange={(e) => updateItem(i, { timeOfDay: e.target.value })} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-caption text-a-ink-muted">
                  <input type="checkbox" checked={item.isTrigger} onChange={(e) => updateItem(i, { isTrigger: e.target.checked })} className="h-4 w-4 accent-[var(--a-accent)]" />
                  Trigger shot
                </label>
                {items.length > 1 ? (
                  <button type="button" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} className="text-a-ink-subtle hover:text-a-critical">
                    <IconTrash size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <AnkuraButton type="button" variant="ghost" size="sm" onClick={() => setItems((prev) => [...prev, emptyItem()])}>
          <IconPlus size={14} /> Add another medicine
        </AnkuraButton>

        {error ? <p role="alert" className="text-caption font-medium text-a-critical">{error}</p> : null}

        <AnkuraButton type="submit" fullWidth loading={pending} disabled={!name.trim() || items.some((i) => !i.drugName.trim())}>
          Save template
        </AnkuraButton>
      </form>
    </AnkuraCard>
  )
}
