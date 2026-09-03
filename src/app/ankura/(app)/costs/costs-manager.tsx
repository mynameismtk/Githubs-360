'use client'

import { useState, useMemo } from 'react'
import { AnkuraCard, AnkuraSectionTitle } from '@/components/ankura/ui/card'
import { AnkuraButton } from '@/components/ankura/ui/button'
import { AnkuraField, AnkuraInput, AnkuraSelect } from '@/components/ankura/ui/input'
import { AnkuraEmptyState } from '@/components/ankura/ui/states'
import { IconWallet, IconPlus, IconTrash } from '@/components/ankura/ui/icons'
import { COST_CATEGORY_LABELS } from '@/lib/ankura/cost-categories'

interface CostEntry {
  id: string
  category: keyof typeof COST_CATEGORY_LABELS
  label: string
  amount: number
  incurredAt: string
  notes: string | null
}

function inr(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function CostsManager({ initialEntries, initialBudget }: { initialEntries: CostEntry[]; initialBudget: number | null }) {
  const [entries, setEntries] = useState(initialEntries)
  const [budget, setBudgetState] = useState(initialBudget)
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(String(initialBudget ?? ''))

  const total = useMemo(() => entries.reduce((sum, e) => sum + e.amount, 0), [entries])
  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of entries) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [entries])

  async function saveBudget() {
    const amount = Math.max(0, Math.round(Number(budgetInput) || 0))
    setBudgetState(amount)
    setEditingBudget(false)
    await fetch('/api/ankura/costs/budget', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
  }

  async function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    await fetch(`/api/ankura/costs/${id}`, { method: 'DELETE' })
  }

  const progress = budget && budget > 0 ? Math.min(100, Math.round((total / budget) * 100)) : null

  return (
    <div className="space-y-6 print:space-y-3">
      <AnkuraCard className="print:border-0 print:shadow-none">
        <p className="text-caption font-semibold uppercase tracking-wide text-a-ink-subtle">Tracked so far</p>
        <p className="mt-1 font-a-serif text-3xl text-a-ink tabular">{inr(total)}</p>

        {editingBudget ? (
          <div className="mt-3 flex items-center gap-2 print:hidden">
            <AnkuraInput
              type="number"
              min={0}
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="Set an optional budget"
              className="h-9"
            />
            <AnkuraButton size="sm" onClick={saveBudget}>Save</AnkuraButton>
          </div>
        ) : budget ? (
          <div className="mt-3 print:hidden">
            <div className="mb-1 flex items-center justify-between text-caption text-a-ink-muted">
              <span>of your {inr(budget)} budget</span>
              <button type="button" onClick={() => setEditingBudget(true)} className="font-semibold text-a-brand-ink">
                Edit
              </button>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-a-surface-sunken">
              <div
                className="h-full rounded-full bg-a-brand transition-[width] duration-slow ease-smooth"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setEditingBudget(true)} className="mt-2 text-body-sm font-semibold text-a-brand-ink print:hidden">
            Set an optional budget
          </button>
        )}
      </AnkuraCard>

      <section className="print:hidden">
        <AnkuraSectionTitle
          eyebrow="Log an expense"
          title="Add expense"
          action={
            <AnkuraButton size="sm" variant={showForm ? 'secondary' : 'primary'} onClick={() => setShowForm((v) => !v)}>
              <IconPlus size={16} /> {showForm ? 'Close' : 'Add'}
            </AnkuraButton>
          }
        />
        {showForm ? (
          <AddCostForm
            onAdded={(entry) => {
              setEntries((prev) => [entry, ...prev])
              setShowForm(false)
            }}
          />
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <AnkuraSectionTitle title="By category" className="mb-0" />
          <button type="button" onClick={() => window.print()} className="text-body-sm font-semibold text-a-brand-ink print:hidden">
            Export / print
          </button>
        </div>
        {byCategory.length === 0 ? (
          <AnkuraEmptyState icon={<IconWallet size={28} />} title="Nothing logged yet" body="Add your first expense whenever you're ready — there's no rush." />
        ) : (
          <div className="space-y-2">
            {byCategory.map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between rounded-xl bg-a-surface-sunken px-3.5 py-2.5">
                <span className="text-body-sm text-a-ink">{COST_CATEGORY_LABELS[category as keyof typeof COST_CATEGORY_LABELS]}</span>
                <span className="text-body-sm font-semibold tabular text-a-ink">{inr(amount)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <AnkuraSectionTitle title="All entries" />
        <div className="space-y-2">
          {entries.map((e) => (
            <AnkuraCard key={e.id} className="flex items-center gap-3 print:border-0 print:px-0 print:shadow-none">
              <div className="min-w-0 flex-1">
                <p className="text-body-sm font-semibold text-a-ink">{e.label}</p>
                <p className="text-caption text-a-ink-subtle">
                  {COST_CATEGORY_LABELS[e.category]} · {new Date(e.incurredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <p className="shrink-0 font-a-serif tabular text-a-ink">{inr(e.amount)}</p>
              <button
                type="button"
                aria-label={`Remove ${e.label}`}
                onClick={() => void remove(e.id)}
                className="shrink-0 rounded-full p-2 text-a-ink-subtle hover:bg-a-critical-wash hover:text-a-critical print:hidden"
              >
                <IconTrash size={16} />
              </button>
            </AnkuraCard>
          ))}
        </div>
      </section>
    </div>
  )
}

function AddCostForm({ onAdded }: { onAdded: (entry: CostEntry) => void }) {
  const [category, setCategory] = useState<keyof typeof COST_CATEGORY_LABELS>('MEDICATION')
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [incurredAt, setIncurredAt] = useState(todayIso())
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/ankura/costs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ category, label, amount: Math.round(Number(amount)), incurredAt }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message ?? 'We could not save that.')
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
        <AnkuraField label="What was it for?" htmlFor="label" required>
          <AnkuraInput id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Day 10 scan" required />
        </AnkuraField>
        <div className="grid grid-cols-2 gap-3">
          <AnkuraField label="Amount (₹)" htmlFor="amount" required>
            <AnkuraInput id="amount" type="number" min={1} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </AnkuraField>
          <AnkuraField label="Category" htmlFor="category">
            <AnkuraSelect id="category" value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
              {Object.entries(COST_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </AnkuraSelect>
          </AnkuraField>
        </div>
        <AnkuraField label="Date" htmlFor="incurredAt">
          <AnkuraInput id="incurredAt" type="date" value={incurredAt} onChange={(e) => setIncurredAt(e.target.value)} />
        </AnkuraField>
        {error ? <p role="alert" className="text-caption font-medium text-a-critical">{error}</p> : null}
        <AnkuraButton type="submit" fullWidth loading={pending} disabled={!label.trim() || !amount}>
          Save expense
        </AnkuraButton>
      </form>
    </AnkuraCard>
  )
}
