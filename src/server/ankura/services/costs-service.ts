import 'server-only'
import { db } from '@/server/db'
import type { AnkuraCostCategory } from '@prisma/client'

export { COST_CATEGORY_LABELS } from '@/lib/ankura/cost-categories'

/** Cost tracker (brief §3.4) — non-judgemental framing, no guilt-driven copy anywhere. */

export interface CostEntryInput {
  category: AnkuraCostCategory
  label: string
  amount: number
  incurredAt: string
  notes?: string | null
}

export async function listCostEntries(userId: string) {
  return db.ankuraCostEntry.findMany({ where: { userId }, orderBy: { incurredAt: 'desc' } })
}

export async function createCostEntry(userId: string, input: CostEntryInput) {
  return db.ankuraCostEntry.create({
    data: {
      userId,
      category: input.category,
      label: input.label.trim(),
      amount: Math.round(input.amount),
      incurredAt: new Date(input.incurredAt),
      notes: input.notes?.trim() || null,
    },
  })
}

export async function deleteCostEntry(userId: string, id: string) {
  await db.ankuraCostEntry.deleteMany({ where: { id, userId } })
}

export async function getBudget(userId: string) {
  return db.ankuraBudget.findUnique({ where: { userId } })
}

export async function setBudget(userId: string, amount: number) {
  return db.ankuraBudget.upsert({
    where: { userId },
    create: { userId, amount: Math.round(amount) },
    update: { amount: Math.round(amount) },
  })
}
