import 'server-only'
import { Prisma, type AppointmentStatus, type ConsultationType } from '@prisma/client'
import { db } from '../db'
import { audit } from '../audit'
import { errors } from '@/lib/errors'
import { assertCanAccessPatient, requireActor } from '../auth/policy'
import type { SessionActor } from '../auth/session'
import { addMinutes, clinicDateKey } from '@/lib/dates'
import { notify } from './notification-service'

/** Booking, rescheduling, cancelling, and the day views built on them. */

const APPOINTMENT_SELECT = {
  id: true,
  startAt: true,
  endAt: true,
  status: true,
  consultationType: true,
  reasonForVisit: true,
  isFollowUp: true,
  checkedInAt: true,
  cancelledAt: true,
  cancellationReason: true,
  createdAt: true,
  patient: { select: { id: true, fullName: true, mrn: true, dateOfBirth: true, gender: true, avatarUrl: true } },
  doctor: {
    select: {
      id: true,
      photoUrl: true,
      qualifications: true,
      consultationFee: true,
      followUpFee: true,
      user: { select: { fullName: true } },
    },
  },
  speciality: { select: { id: true, name: true, slug: true, iconKey: true, preparationNotes: true } },
  location: { select: { id: true, name: true, addressLine1: true, city: true, mapsUrl: true, phone: true } },
} satisfies Prisma.AppointmentSelect

export type AppointmentView = Prisma.AppointmentGetPayload<{ select: typeof APPOINTMENT_SELECT }>

/** The slot lock value — see docs/04 §4. Null once the appointment stops occupying a slot. */
function slotLockFor(doctorId: string, startAt: Date): string {
  return `${doctorId}|${startAt.toISOString()}`
}

const RELEASES_SLOT: AppointmentStatus[] = ['CANCELLED', 'NO_SHOW']

export interface BookAppointmentInput {
  patientId: string
  doctorId: string
  startAt: Date
  consultationType: ConsultationType
  reasonForVisit?: string | null
  followUpId?: string | null
}

/**
 * Book an appointment.
 *
 * The double-booking race is closed by the database, not by a read-then-write check: the
 * unique index on `slotLock` rejects the second concurrent insert with P2002, which we
 * translate into a friendly "that slot was just taken". Two patients tapping Confirm in
 * the same second is a real scenario and application-level checking loses it.
 */
export async function bookAppointment(
  actor: SessionActor | null,
  input: BookAppointmentInput,
): Promise<AppointmentView> {
  const a = requireActor(actor)
  await assertCanAccessPatient(a, input.patientId, 'BOOK')

  if (input.startAt.getTime() <= Date.now()) {
    throw errors.unprocessable('That time has already passed. Please choose another slot.')
  }

  const doctor = await db.doctor.findFirst({
    where: { id: input.doctorId, clinicId: a.clinicId, isActive: true, deletedAt: null },
    select: {
      id: true,
      specialityId: true,
      slotDurationMins: true,
      acceptsNewPatients: true,
      user: { select: { fullName: true } },
      scheduleRules: { where: { isActive: true }, select: { locationId: true }, take: 1 },
    },
  })
  if (!doctor) throw errors.notFound('We could not find that doctor.')
  if (!doctor.acceptsNewPatients) {
    throw errors.unprocessable('This doctor is not accepting new appointments at the moment.')
  }

  // A patient with two appointments at the same time is always a mistake, whichever
  // doctor each is with.
  const clash = await db.appointment.findFirst({
    where: {
      patientId: input.patientId,
      startAt: input.startAt,
      status: { notIn: RELEASES_SLOT },
    },
    select: { id: true },
  })
  if (clash) throw errors.conflict('This patient already has an appointment at that time.')

  const endAt = addMinutes(input.startAt, doctor.slotDurationMins)

  try {
    const appointment = await db.appointment.create({
      data: {
        clinicId: a.clinicId,
        patientId: input.patientId,
        doctorId: doctor.id,
        specialityId: doctor.specialityId,
        locationId: doctor.scheduleRules[0]?.locationId ?? null,
        startAt: input.startAt,
        endAt,
        consultationType: input.consultationType,
        status: 'CONFIRMED',
        reasonForVisit: input.reasonForVisit?.trim() || null,
        isFollowUp: Boolean(input.followUpId),
        followUpId: input.followUpId ?? null,
        slotLock: slotLockFor(doctor.id, input.startAt),
        bookedById: a.userId,
        bookedByRole: a.role,
      },
      select: APPOINTMENT_SELECT,
    })

    if (input.followUpId) {
      await db.followUp.update({ where: { id: input.followUpId }, data: { status: 'SCHEDULED' } })
    }

    await audit({
      clinicId: a.clinicId,
      actorId: a.userId,
      actorRole: a.role,
      actorName: a.fullName,
      action: 'appointment.booked',
      targetType: 'Appointment',
      targetId: appointment.id,
      patientId: input.patientId,
      metadata: { doctorId: doctor.id, startAt: input.startAt.toISOString() },
    })

    await notify({
      clinicId: a.clinicId,
      userId: a.userId,
      patientId: input.patientId,
      kind: 'APPOINTMENT_CONFIRMED',
      title: 'Appointment confirmed',
      body: `${appointment.patient.fullName} with Dr. ${doctor.user.fullName} — ${new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(input.startAt)}`,
      actionUrl: `/app/appointments/${appointment.id}`,
    })

    return appointment
  } catch (e) {
    // P2002 on slotLock means another booking won the race for this exact slot.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw errors.slotTaken()
    }
    throw e
  }
}

export async function getAppointment(actor: SessionActor | null, appointmentId: string): Promise<AppointmentView> {
  const a = requireActor(actor)
  const appointment = await db.appointment.findFirst({
    where: { id: appointmentId, clinicId: a.clinicId },
    select: APPOINTMENT_SELECT,
  })
  if (!appointment) throw errors.notFound('We could not find that appointment.')
  await assertCanAccessPatient(a, appointment.patient.id, 'READ')
  return appointment
}

export async function listPatientAppointments(
  actor: SessionActor | null,
  patientId: string,
  scope: 'upcoming' | 'past' | 'all' = 'all',
): Promise<AppointmentView[]> {
  const a = requireActor(actor)
  await assertCanAccessPatient(a, patientId, 'READ')

  const now = new Date()
  const where: Prisma.AppointmentWhereInput = { patientId, clinicId: a.clinicId }
  if (scope === 'upcoming') {
    where.startAt = { gte: now }
    where.status = { notIn: ['CANCELLED', 'COMPLETED', 'NO_SHOW'] }
  } else if (scope === 'past') {
    where.OR = [{ startAt: { lt: now } }, { status: { in: ['CANCELLED', 'COMPLETED', 'NO_SHOW'] } }]
  }

  return db.appointment.findMany({
    where,
    select: APPOINTMENT_SELECT,
    orderBy: { startAt: scope === 'past' ? 'desc' : 'asc' },
    take: 50,
  })
}

/** The single most important query in the product: what is next for this patient. */
export async function getNextAppointment(
  actor: SessionActor | null,
  patientId: string,
): Promise<AppointmentView | null> {
  const a = requireActor(actor)
  await assertCanAccessPatient(a, patientId, 'READ')
  return db.appointment.findFirst({
    where: {
      patientId,
      clinicId: a.clinicId,
      startAt: { gte: new Date(Date.now() - 30 * 60_000) }, // still "next" for 30 min after
      status: { notIn: ['CANCELLED', 'COMPLETED', 'NO_SHOW'] },
    },
    select: APPOINTMENT_SELECT,
    orderBy: { startAt: 'asc' },
  })
}

export async function cancelAppointment(
  actor: SessionActor | null,
  appointmentId: string,
  reason?: string,
): Promise<AppointmentView> {
  const a = requireActor(actor)
  const existing = await db.appointment.findFirst({
    where: { id: appointmentId, clinicId: a.clinicId },
    select: { id: true, patientId: true, status: true, startAt: true, doctorId: true },
  })
  if (!existing) throw errors.notFound('We could not find that appointment.')
  await assertCanAccessPatient(a, existing.patientId, 'BOOK')

  if (existing.status === 'CANCELLED') throw errors.conflict('This appointment is already cancelled.')
  if (existing.status === 'COMPLETED') throw errors.conflict('This appointment has already taken place.')

  const updated = await db.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelledBy: a.role === 'PATIENT' ? 'PATIENT' : 'CLINIC',
      cancellationReason: reason?.trim() || null,
      // Releasing the lock is what frees the slot for someone else to book.
      slotLock: null,
    },
    select: APPOINTMENT_SELECT,
  })

  await audit({
    clinicId: a.clinicId,
    actorId: a.userId,
    actorRole: a.role,
    actorName: a.fullName,
    action: 'appointment.cancelled',
    targetType: 'Appointment',
    targetId: appointmentId,
    patientId: existing.patientId,
    reason: reason?.trim(),
    metadata: { startAt: existing.startAt.toISOString() },
  })

  await notify({
    clinicId: a.clinicId,
    userId: a.userId,
    patientId: existing.patientId,
    kind: 'APPOINTMENT_CANCELLED',
    title: 'Appointment cancelled',
    body: `Your appointment on ${new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(existing.startAt)} has been cancelled.`,
    actionUrl: '/app/appointments',
  })

  return updated
}

/**
 * Reschedule = cancel + rebook, linked.
 *
 * Modelled as two rows rather than an in-place update so the history of "this was moved"
 * survives. Wrapped in a transaction so a patient can never end up with neither slot.
 */
export async function rescheduleAppointment(
  actor: SessionActor | null,
  appointmentId: string,
  newStartAt: Date,
): Promise<AppointmentView> {
  const a = requireActor(actor)
  const existing = await db.appointment.findFirst({
    where: { id: appointmentId, clinicId: a.clinicId },
    select: {
      id: true,
      patientId: true,
      doctorId: true,
      specialityId: true,
      locationId: true,
      consultationType: true,
      reasonForVisit: true,
      isFollowUp: true,
      status: true,
      startAt: true,
      doctor: { select: { slotDurationMins: true } },
    },
  })
  if (!existing) throw errors.notFound('We could not find that appointment.')
  await assertCanAccessPatient(a, existing.patientId, 'BOOK')
  if (existing.status === 'CANCELLED' || existing.status === 'COMPLETED') {
    throw errors.conflict('This appointment can no longer be changed.')
  }
  if (newStartAt.getTime() <= Date.now()) {
    throw errors.unprocessable('That time has already passed. Please choose another slot.')
  }

  try {
    const created = await db.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: a.role === 'PATIENT' ? 'PATIENT' : 'CLINIC',
          cancellationReason: 'Rescheduled',
          slotLock: null,
        },
      })

      return tx.appointment.create({
        data: {
          clinicId: a.clinicId,
          patientId: existing.patientId,
          doctorId: existing.doctorId,
          specialityId: existing.specialityId,
          locationId: existing.locationId,
          startAt: newStartAt,
          endAt: addMinutes(newStartAt, existing.doctor.slotDurationMins),
          consultationType: existing.consultationType,
          status: 'CONFIRMED',
          reasonForVisit: existing.reasonForVisit,
          isFollowUp: existing.isFollowUp,
          rescheduledFromId: existing.id,
          slotLock: slotLockFor(existing.doctorId, newStartAt),
          bookedById: a.userId,
          bookedByRole: a.role,
        },
        select: APPOINTMENT_SELECT,
      })
    })

    await audit({
      clinicId: a.clinicId,
      actorId: a.userId,
      actorRole: a.role,
      actorName: a.fullName,
      action: 'appointment.rescheduled',
      targetType: 'Appointment',
      targetId: created.id,
      patientId: existing.patientId,
      metadata: { from: existing.startAt.toISOString(), to: newStartAt.toISOString(), previousId: existing.id },
    })

    await notify({
      clinicId: a.clinicId,
      userId: a.userId,
      patientId: existing.patientId,
      kind: 'APPOINTMENT_RESCHEDULED',
      title: 'Appointment moved',
      body: `Your appointment is now on ${new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(newStartAt)}.`,
      actionUrl: `/app/appointments/${created.id}`,
    })

    return created
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw errors.slotTaken()
    throw e
  }
}

/** Check-in (reception). Phase 1 records the state; Phase 3 hangs the live queue off it. */
export async function checkInAppointment(actor: SessionActor | null, appointmentId: string) {
  const a = requireActor(actor)
  if (!['RECEPTIONIST', 'ADMIN'].includes(a.role)) throw errors.forbidden()

  const appointment = await db.appointment.findFirst({
    where: { id: appointmentId, clinicId: a.clinicId },
    select: { id: true, patientId: true, doctorId: true, status: true, startAt: true, checkedInAt: true },
  })
  if (!appointment) throw errors.notFound()
  if (appointment.status === 'CANCELLED') throw errors.conflict('This appointment was cancelled.')
  if (appointment.checkedInAt) throw errors.conflict('This patient is already checked in.')

  const updated = await db.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CHECKED_IN', checkedInAt: new Date() },
    select: APPOINTMENT_SELECT,
  })

  await audit({
    clinicId: a.clinicId,
    actorId: a.userId,
    actorRole: a.role,
    actorName: a.fullName,
    action: 'appointment.checked_in',
    targetType: 'Appointment',
    targetId: appointmentId,
    patientId: appointment.patientId,
  })

  return updated
}

/** The doctor's day and reception's day board share this query. */
export async function listDayAppointments(
  actor: SessionActor | null,
  options: { doctorId?: string; dateKey?: string },
): Promise<AppointmentView[]> {
  const a = requireActor(actor)
  if (a.role === 'PATIENT') throw errors.forbidden()

  const dateKey = options.dateKey ?? clinicDateKey(new Date())
  const dayStart = new Date(`${dateKey}T00:00:00.000Z`)
  // Widened by a day either side then filtered, so clinic-local midnight is respected
  // regardless of the server's own timezone.
  const from = new Date(dayStart.getTime() - 86_400_000)
  const to = new Date(dayStart.getTime() + 2 * 86_400_000)

  const appointments = await db.appointment.findMany({
    where: {
      clinicId: a.clinicId,
      startAt: { gte: from, lt: to },
      ...(options.doctorId ? { doctorId: options.doctorId } : {}),
    },
    select: APPOINTMENT_SELECT,
    orderBy: { startAt: 'asc' },
  })

  return appointments.filter((appt) => clinicDateKey(appt.startAt) === dateKey)
}
