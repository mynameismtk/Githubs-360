import 'server-only'
import { db } from '../db'
import { assertCanAccessPatient } from '../auth/policy'
import type { SessionActor } from '../auth/session'
import { getNextAppointment, type AppointmentView } from './appointment-service'

/**
 * The patient home screen (§4).
 *
 * This is the most latency-sensitive read in the product, so it is deliberately ONE
 * function issuing a bounded set of parallel queries rather than a dozen components each
 * fetching for themselves. The scope check happens once, up front, for all of it.
 */

export interface HealthTodayItem {
  key: 'medicines' | 'lab-report' | 'follow-up' | 'payment'
  label: string
  detail: string
  href: string
  tone: 'brand' | 'positive' | 'caution' | 'critical'
}

export interface JourneyView {
  id: string
  name: string
  steps: Array<{ id: string; name: string; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' }>
}

export interface PatientHome {
  patient: { id: string; fullName: string; mrn: string; avatarUrl: string | null }
  nextAppointment: AppointmentView | null
  healthToday: HealthTodayItem[]
  journeys: JourneyView[]
  updates: Array<{ id: string; title: string; body: string; publishedAt: Date | null }>
}

export async function getPatientHome(actor: SessionActor, patientId: string): Promise<PatientHome> {
  await assertCanAccessPatient(actor, patientId, 'READ')

  const [patient, nextAppointment, activeRx, readyReports, dueFollowUps, outstanding, journeys, updates] =
    await Promise.all([
      db.patient.findUniqueOrThrow({
        where: { id: patientId },
        select: { id: true, fullName: true, mrn: true, avatarUrl: true },
      }),
      getNextAppointment(actor, patientId),
      db.prescription.count({ where: { patientId, status: 'ACTIVE' } }),
      db.labOrder.findMany({
        where: { patientId, status: 'VERIFIED', patientNotifiedAt: null },
        select: { id: true, number: true, verifiedAt: true, items: { select: { testName: true } } },
        orderBy: { verifiedAt: 'desc' },
        take: 3,
      }),
      db.followUp.findMany({
        where: { patientId, status: 'PENDING', dueFrom: { lte: new Date(Date.now() + 14 * 86_400_000) } },
        select: {
          id: true,
          reason: true,
          dueFrom: true,
          doctor: { select: { id: true, user: { select: { fullName: true } } } },
        },
        orderBy: { dueFrom: 'asc' },
        take: 3,
      }),
      db.invoice.aggregate({
        where: { patientId, status: { in: ['ISSUED', 'PARTIALLY_PAID'] } },
        _sum: { amountDue: true },
      }),
      db.careJourney.findMany({
        where: { patientId, status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          steps: { select: { id: true, name: true, status: true }, orderBy: { displayOrder: 'asc' } },
        },
        take: 3,
      }),
      db.announcement.findMany({
        where: {
          clinicId: actor.clinicId,
          publishedAt: { not: null, lte: new Date() },
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
        select: { id: true, title: true, body: true, publishedAt: true },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        take: 3,
      }),
    ])

  const healthToday: HealthTodayItem[] = []

  if (activeRx > 0) {
    healthToday.push({
      key: 'medicines',
      label: 'Medicines',
      detail: `${activeRx} active prescription${activeRx === 1 ? '' : 's'}`,
      href: '/app/records/prescriptions',
      tone: 'brand',
    })
  }

  const report = readyReports[0]
  if (report) {
    healthToday.push({
      key: 'lab-report',
      label: 'New lab report',
      detail: report.items.map((i) => i.testName).join(', ') || report.number,
      href: `/app/records/lab-reports/${report.id}`,
      tone: 'positive',
    })
  }

  const followUp = dueFollowUps[0]
  if (followUp) {
    healthToday.push({
      key: 'follow-up',
      label: 'Follow-up due',
      detail: `Dr. ${followUp.doctor.user.fullName} — ${followUp.reason}`,
      href: `/app/book?followUpId=${followUp.id}&doctorId=${followUp.doctor.id}`,
      tone: 'caution',
    })
  }

  const due = outstanding._sum.amountDue ?? 0
  if (due > 0) {
    healthToday.push({
      key: 'payment',
      label: 'Pending payment',
      detail: `₹${(due / 100).toLocaleString('en-IN')} outstanding`,
      href: '/app/records/bills',
      tone: 'critical',
    })
  }

  return {
    patient,
    nextAppointment,
    healthToday,
    journeys: journeys as JourneyView[],
    updates,
  }
}
