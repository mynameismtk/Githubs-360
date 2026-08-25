import 'server-only'
import { db } from '../db'
import { errors } from '@/lib/errors'
import { assertCanAccessPatient } from '../auth/policy'
import { audit } from '../audit'
import type { SessionActor } from '../auth/session'

/** Read paths for lab reports, prescriptions and bills. All patient-scoped. */

export async function listLabReports(actor: SessionActor, patientId: string) {
  await assertCanAccessPatient(actor, patientId, 'READ_CLINICAL')
  return db.labOrder.findMany({
    where: { patientId, status: { in: ['VERIFIED', 'RESULTS_UPLOADED', 'IN_PROGRESS', 'SAMPLE_COLLECTED', 'ORDERED', 'SAMPLE_PENDING'] } },
    select: {
      id: true, number: true, status: true, orderedAt: true, verifiedAt: true,
      items: { select: { testName: true } },
      results: { select: { flag: true } },
      doctor: { select: { user: { select: { fullName: true } } } },
    },
    orderBy: { orderedAt: 'desc' },
    take: 50,
  })
}

export async function getLabReport(actor: SessionActor, patientId: string, labOrderId: string) {
  await assertCanAccessPatient(actor, patientId, 'READ_CLINICAL')

  const order = await db.labOrder.findFirst({
    where: { id: labOrderId, patientId },
    select: {
      id: true, number: true, status: true, orderedAt: true, verifiedAt: true,
      verifiedByName: true, clinicalNotes: true,
      items: { select: { testName: true } },
      doctor: { select: { user: { select: { fullName: true } } } },
      results: {
        select: {
          id: true, analyteName: true, unit: true, valueNumeric: true, valueText: true,
          refLow: true, refHigh: true, refText: true, flag: true, comment: true,
          labAnalyteId: true, measuredAt: true,
        },
        orderBy: { displayOrder: 'asc' },
      },
    },
  })
  if (!order) throw errors.notFound('We could not find that report.')

  // A patient may not see a result before a clinician has released it.
  if (actor.role === 'PATIENT' && order.status !== 'VERIFIED') {
    throw errors.notFound('That report is not ready yet.')
  }

  // The previous value for each analyte, so the report can show movement over time (§8).
  const analyteIds = order.results.map((r) => r.labAnalyteId).filter((id): id is string => Boolean(id))
  const history = analyteIds.length
    ? await db.labResult.findMany({
        where: {
          labAnalyteId: { in: analyteIds },
          labOrder: { patientId, status: 'VERIFIED' },
          measuredAt: { lt: order.results[0]?.measuredAt ?? new Date() },
        },
        select: { labAnalyteId: true, valueNumeric: true, measuredAt: true },
        orderBy: { measuredAt: 'desc' },
      })
    : []

  const previousByAnalyte = new Map<string, { value: number | null; measuredAt: Date }>()
  for (const h of history) {
    if (h.labAnalyteId && !previousByAnalyte.has(h.labAnalyteId)) {
      previousByAnalyte.set(h.labAnalyteId, { value: h.valueNumeric, measuredAt: h.measuredAt })
    }
  }

  if (actor.role !== 'PATIENT') {
    await audit({
      clinicId: actor.clinicId, actorId: actor.userId, actorRole: actor.role, actorName: actor.fullName,
      action: 'lab.report.viewed', targetType: 'LabOrder', targetId: order.id, patientId,
    })
  }

  return {
    ...order,
    results: order.results.map((r) => ({
      ...r,
      previous: r.labAnalyteId ? (previousByAnalyte.get(r.labAnalyteId) ?? null) : null,
    })),
  }
}

export async function listPrescriptions(actor: SessionActor, patientId: string) {
  await assertCanAccessPatient(actor, patientId, 'READ_CLINICAL')
  return db.prescription.findMany({
    where: { patientId },
    select: {
      id: true, number: true, issuedAt: true, status: true, diagnosisSummary: true,
      generalInstructions: true, validUntil: true, dispenseStatus: true,
      doctor: { select: { user: { select: { fullName: true } }, speciality: { select: { name: true } } } },
      items: {
        select: {
          id: true, medicineName: true, strength: true, form: true,
          morning: true, afternoon: true, evening: true, night: true,
          timing: true, durationDays: true, instructions: true, isSos: true,
        },
        orderBy: { displayOrder: 'asc' },
      },
    },
    orderBy: { issuedAt: 'desc' },
    take: 30,
  })
}

export async function listInvoices(actor: SessionActor, patientId: string) {
  await assertCanAccessPatient(actor, patientId, 'READ')
  const [invoices, outstanding] = await Promise.all([
    db.invoice.findMany({
      where: { patientId },
      select: {
        id: true, number: true, category: true, status: true, total: true,
        amountPaid: true, amountDue: true, issuedAt: true, dueAt: true, paidAt: true,
        lines: { select: { id: true, description: true, lineTotal: true } },
        payments: { select: { id: true, method: true, status: true, paidAt: true, receiptNumber: true } },
      },
      orderBy: { issuedAt: 'desc' },
      take: 50,
    }),
    db.invoice.aggregate({
      where: { patientId, status: { in: ['ISSUED', 'PARTIALLY_PAID'] } },
      _sum: { amountDue: true },
    }),
  ])
  return { invoices, outstandingPaise: outstanding._sum.amountDue ?? 0 }
}
