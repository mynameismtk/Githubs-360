import 'server-only'
import { db } from '@/server/db'
import { errors } from '@/lib/errors'
import type { AnkuraDoseOutcome, AnkuraRoute } from '@prisma/client'

export { COMMON_DRUGS } from '@/lib/ankura/common-drugs'

/**
 * Injection & trigger reminders (brief §3.1). The highest-stakes reminder here is the
 * trigger shot — mistimed by even an hour it can affect a retrieval — so `isTrigger`
 * reminders are surfaced with distinct urgency everywhere they're rendered, never mixed
 * anonymously into a generic med list.
 */

export interface ReminderInput {
  drugName: string
  dose: string
  route: AnkuraRoute
  isTrigger: boolean
  timeOfDay: string // "HH:mm"
  startDate: string // ISO date
  endDate?: string | null
  notes?: string | null
}

export async function listReminders(userId: string) {
  return db.ankuraReminder.findMany({
    where: { userId, isActive: true },
    orderBy: [{ isTrigger: 'desc' }, { timeOfDay: 'asc' }],
  })
}

export interface TodayDose {
  reminderId: string
  drugName: string
  dose: string
  route: AnkuraRoute
  isTrigger: boolean
  timeOfDay: string
  notes: string | null
  scheduledFor: string
  outcome: AnkuraDoseOutcome | null
}

/** Today's meds card — the emotional centrepiece of Home. */
export async function listTodayDoses(userId: string): Promise<TodayDose[]> {
  const today = new Date()
  const dateKey = today.toISOString().slice(0, 10)
  const dayStart = new Date(`${dateKey}T00:00:00.000Z`)
  const dayEnd = new Date(`${dateKey}T23:59:59.999Z`)

  const reminders = await db.ankuraReminder.findMany({
    where: {
      userId,
      isActive: true,
      startDate: { lte: dayEnd },
      OR: [{ endDate: null }, { endDate: { gte: dayStart } }],
    },
    include: {
      logs: { where: { scheduledFor: { gte: dayStart, lte: dayEnd } } },
    },
    orderBy: [{ isTrigger: 'desc' }, { timeOfDay: 'asc' }],
  })

  return reminders.map((r) => {
    const scheduledFor = `${dateKey}T${r.timeOfDay}:00`
    const log = r.logs.find((l) => l.scheduledFor.toISOString().slice(0, 16) === scheduledFor.slice(0, 16))
    return {
      reminderId: r.id,
      drugName: r.drugName,
      dose: r.dose,
      route: r.route,
      isTrigger: r.isTrigger,
      timeOfDay: r.timeOfDay,
      notes: r.notes,
      scheduledFor,
      outcome: log?.outcome ?? null,
    }
  })
}

export async function createReminder(userId: string, input: ReminderInput) {
  return db.ankuraReminder.create({
    data: {
      userId,
      drugName: input.drugName.trim(),
      dose: input.dose.trim(),
      route: input.route,
      isTrigger: input.isTrigger,
      timeOfDay: input.timeOfDay,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      notes: input.notes?.trim() || null,
    },
  })
}

export async function deactivateReminder(userId: string, reminderId: string) {
  const reminder = await db.ankuraReminder.findUnique({ where: { id: reminderId }, select: { userId: true } })
  if (!reminder || reminder.userId !== userId) throw errors.notFound('We could not find that reminder.')
  return db.ankuraReminder.update({ where: { id: reminderId }, data: { isActive: false } })
}

export async function logDose(
  userId: string,
  reminderId: string,
  scheduledFor: string,
  outcome: AnkuraDoseOutcome,
) {
  const reminder = await db.ankuraReminder.findUnique({ where: { id: reminderId }, select: { userId: true } })
  if (!reminder || reminder.userId !== userId) throw errors.notFound('We could not find that reminder.')

  return db.ankuraDoseLog.upsert({
    where: { reminderId_scheduledFor: { reminderId, scheduledFor: new Date(scheduledFor) } },
    create: { reminderId, scheduledFor: new Date(scheduledFor), outcome },
    update: { outcome, recordedAt: new Date() },
  })
}
