import 'server-only'
import { db } from '@/server/db'
import { errors } from '@/lib/errors'
import type { Prisma } from '@prisma/client'

/**
 * Clinic portal (brief §3.7) — the licensing product. Staff can white-label the app,
 * broadcast announcements and see AGGREGATE engagement only; no per-patient detail is
 * ever exposed here without consent, by construction — these queries never select an
 * individual patient row.
 */

export async function getClinicBySlug(slug: string) {
  const clinic = await db.ankuraClinic.findUnique({
    where: { slug },
    include: { packages: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } } },
  })
  if (!clinic) throw errors.notFound("We couldn't find that clinic.")
  return clinic
}

export async function requireStaffClinic(userClinicId: string | null) {
  if (!userClinicId) throw errors.forbidden('This account is not linked to a clinic.')
  return getClinicById(userClinicId)
}

export async function getClinicById(id: string) {
  const clinic = await db.ankuraClinic.findUnique({ where: { id } })
  if (!clinic) throw errors.notFound("We couldn't find that clinic.")
  return clinic
}

export async function getClinicStats(clinicId: string) {
  const [patientCount, activeReminderCount, journeyEngagedCount] = await Promise.all([
    db.ankuraUser.count({ where: { clinicId, role: 'PATIENT' } }),
    db.ankuraReminder.count({ where: { isActive: true, user: { clinicId } } }),
    db.ankuraUser.count({ where: { clinicId, role: 'PATIENT', onboardedAt: { not: null } } }),
  ])
  const byStage = await db.ankuraUser.groupBy({
    by: ['cycleStage'],
    where: { clinicId, role: 'PATIENT', cycleStage: { not: null } },
    _count: true,
  })
  return { patientCount, activeReminderCount, journeyEngagedCount, byStage }
}

export async function listAnnouncements(clinicId: string) {
  return db.ankuraAnnouncement.findMany({ where: { clinicId }, orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }] })
}

export async function createAnnouncement(clinicId: string, title: string, body: string, isPinned: boolean) {
  return db.ankuraAnnouncement.create({ data: { clinicId, title: title.trim(), body: body.trim(), isPinned } })
}

export async function listProtocolTemplates(clinicId: string) {
  return db.ankuraProtocolTemplate.findMany({ where: { clinicId, isActive: true }, orderBy: { createdAt: 'desc' } })
}

export interface ProtocolTemplateItem {
  drugName: string
  dose: string
  route: string
  timeOfDay: string
  isTrigger: boolean
}

export async function createProtocolTemplate(clinicId: string, name: string, items: ProtocolTemplateItem[]) {
  return db.ankuraProtocolTemplate.create({
    data: { clinicId, name: name.trim(), items: items as unknown as Prisma.InputJsonValue },
  })
}
