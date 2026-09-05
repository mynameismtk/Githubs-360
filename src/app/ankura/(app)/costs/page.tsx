import { listCostEntries, getBudget } from '@/server/ankura/services/costs-service'
import { getAnkuraActor } from '@/server/ankura/session'
import { CostsManager } from './costs-manager'

export default async function AnkuraCostsPage() {
  const actor = await getAnkuraActor()
  const [entries, budget] = actor
    ? await Promise.all([listCostEntries(actor.userId), getBudget(actor.userId)])
    : [[], null]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-a-serif text-2xl text-a-ink">Cost tracker</h1>
        <p className="text-body-sm text-a-ink-muted">See where it's going — no guilt, just clarity.</p>
      </div>
      <CostsManager
        initialEntries={entries.map((e) => ({ ...e, incurredAt: e.incurredAt.toISOString() }))}
        initialBudget={budget?.amount ?? null}
      />
    </div>
  )
}
