import 'server-only'
import { db } from '../db'
import { errors } from '@/lib/errors'
import { getDoctorByUserId } from './doctor-service'
import { listDayAppointments } from './appointment-service'
import { clinicDateKey } from '@/lib/dates'
import type { SessionActor } from '../auth/session'

/** Aggregations behind the clinical console dashboards. */

export async function getDoctorDay(actor: SessionActor, dateKey?: string) {
  if (actor.role !== 'DOCTOR') throw errors.forbidden()
  const doctor = await getDoctorByUserId(actor.userId)
  const key = dateKey ?? clinicDateKey(new Date())

  const [appointments, pendingReports, followUpsDue] = await Promise.all([
    listDayAppointments(actor, { doctorId: doctor.id, dateKey: key }),
    db.labOrder.count({
      where: { doctorId: doctor.id, status: { in: ['RESULTS_UPLOADED', 'IN_PROGRESS', 'SAMPLE_COLLECTED'] } },
    }),
    db.followUp.count({
      where: { doctorId: doctor.id, status: 'PENDING', dueTo: { gte: new Date() }, dueFrom: { lte: new Date() } },
    }),
  ])

  return {
    doctor,
    dateKey: key,
    appointments,
    stats: {
      total: appointments.length,
      waiting: appointments.filter((a) => a.status === 'CHECKED_IN').length,
      completed: appointments.filter((a) => a.status === 'COMPLETED').length,
      upcoming: appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'SCHEDULED').length,
      pendingReports,
      followUpsDue,
    },
  }
}

/** Nurse's list — today's checked-in patients across the clinic, with vitals status. */
export async function getNurseDay(actor: SessionActor) {
  if (actor.role !== 'NURSE') throw errors.forbidden()
  const key = clinicDateKey(new Date())
  const appointments = await listDayAppointments(actor, { dateKey: key })

  const ids = appointments.map((a) => a.id)
  const vitals = ids.length
    ? await db.vitalsRecord.findMany({
        where: { appointmentId: { in: ids } },
        select: { appointmentId: true, recordedAt: true },
      })
    : []
  const withVitals = new Set(vitals.map((v) => v.appointmentId))

  return {
    dateKey: key,
    patients: appointments
      .filter((a) => a.status !== 'CANCELLED')
      .map((a) => ({ appointment: a, hasVitals: withVitals.has(a.id) })),
  }
}

export async function getLabWorklist(actor: SessionActor) {
  if (actor.role !== 'LAB_TECH') throw errors.forbidden()
  return db.labOrder.findMany({
    where: { clinicId: actor.clinicId, status: { notIn: ['VERIFIED', 'CANCELLED'] } },
    select: {
      id: true, number: true, status: true, priority: true, orderedAt: true, clinicalNotes: true,
      patient: { select: { id: true, fullName: true, mrn: true, dateOfBirth: true, gender: true } },
      doctor: { select: { user: { select: { fullName: true } } } },
      items: { select: { testName: true } },
    },
    orderBy: [{ priority: 'desc' }, { orderedAt: 'asc' }],
    take: 100,
  })
}

export async function getPharmacyWorklist(actor: SessionActor) {
  if (actor.role !== 'PHARMACIST') throw errors.forbidden()
  return db.prescription.findMany({
    where: { clinicId: actor.clinicId, dispenseStatus: { in: ['PENDING', 'PARTIALLY_DISPENSED'] } },
    select: {
      id: true, number: true, issuedAt: true, dispenseStatus: true,
      patient: { select: { id: true, fullName: true, mrn: true, allergies: { where: { isActive: true }, select: { substance: true } } } },
      doctor: { select: { user: { select: { fullName: true } } } },
      items: { select: { id: true, medicineName: true, strength: true, quantity: true } },
    },
    orderBy: { issuedAt: 'asc' },
    take: 100,
  })
}

/** Reception / admin day board. */
export async function getOpsOverview(actor: SessionActor, dateKey?: string) {
  if (!['RECEPTIONIST', 'ADMIN'].includes(actor.role)) throw errors.forbidden()
  const key = dateKey ?? clinicDateKey(new Date())
  const appointments = await listDayAppointments(actor, { dateKey: key })

  const [patientCount, doctorCount, outstanding, pendingLabs] = await Promise.all([
    db.patient.count({ where: { clinicId: actor.clinicId, deletedAt: null } }),
    db.doctor.count({ where: { clinicId: actor.clinicId, isActive: true, deletedAt: null } }),
    db.invoice.aggregate({
      where: { clinicId: actor.clinicId, status: { in: ['ISSUED', 'PARTIALLY_PAID'] } },
      _sum: { amountDue: true },
      _count: true,
    }),
    db.labOrder.count({ where: { clinicId: actor.clinicId, status: { notIn: ['VERIFIED', 'CANCELLED'] } } }),
  ])

  const revenueToday = await db.payment.aggregate({
    where: {
      clinicId: actor.clinicId,
      status: 'SUCCEEDED',
      paidAt: { gte: new Date(`${key}T00:00:00.000Z`), lt: new Date(`${key}T23:59:59.999Z`) },
    },
    _sum: { amount: true },
  })

  return {
    dateKey: key,
    appointments,
    stats: {
      appointmentsToday: appointments.length,
      checkedIn: appointments.filter((a) => a.status === 'CHECKED_IN').length,
      completed: appointments.filter((a) => a.status === 'COMPLETED').length,
      cancelled: appointments.filter((a) => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length,
      patientCount,
      doctorCount,
      outstandingPaise: outstanding._sum.amountDue ?? 0,
      outstandingCount: outstanding._count,
      pendingLabs,
      revenueTodayPaise: revenueToday._sum.amount ?? 0,
    },
  }
}
