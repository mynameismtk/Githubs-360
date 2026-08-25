import 'server-only'
import { db } from '../db'
import { errors } from '@/lib/errors'
import { getNextAvailableByDoctor } from './availability-service'

/** Doctor directory and profile reads. Public within the clinic — no patient data here. */

export interface DoctorListFilters {
  specialityId?: string
  /** Only doctors with a free slot in the next N days. Drives the "Available today" chip. */
  availableWithinDays?: number
  search?: string
}

export async function listDoctors(clinicId: string, filters: DoctorListFilters = {}) {
  const doctors = await db.doctor.findMany({
    where: {
      clinicId,
      isActive: true,
      deletedAt: null,
      ...(filters.specialityId ? { specialityId: filters.specialityId } : {}),
      ...(filters.search
        ? {
            OR: [
              { user: { fullName: { contains: filters.search, mode: 'insensitive' as const } } },
              { speciality: { name: { contains: filters.search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      qualifications: true,
      yearsExperience: true,
      languages: true,
      photoUrl: true,
      consultationFee: true,
      followUpFee: true,
      slotDurationMins: true,
      bio: true,
      acceptsNewPatients: true,
      user: { select: { fullName: true } },
      speciality: { select: { id: true, name: true, slug: true, iconKey: true } },
    },
    orderBy: [{ displayOrder: 'asc' }, { user: { fullName: 'asc' } }],
  })

  const nextAvailable = await getNextAvailableByDoctor(
    doctors.map((d) => d.id),
    filters.availableWithinDays ?? 14,
  )

  const withAvailability = doctors.map((d) => ({
    ...d,
    name: d.user.fullName,
    nextAvailableAt: nextAvailable.get(d.id) ?? null,
  }))

  if (filters.availableWithinDays !== undefined) {
    return withAvailability.filter((d) => d.nextAvailableAt !== null)
  }
  return withAvailability
}

export type DoctorListItem = Awaited<ReturnType<typeof listDoctors>>[number]

export async function getDoctor(clinicId: string, doctorId: string) {
  const doctor = await db.doctor.findFirst({
    where: { id: doctorId, clinicId, isActive: true, deletedAt: null },
    select: {
      id: true,
      qualifications: true,
      registrationNo: true,
      yearsExperience: true,
      languages: true,
      bio: true,
      photoUrl: true,
      consultationFee: true,
      followUpFee: true,
      slotDurationMins: true,
      bookingHorizonDays: true,
      acceptsNewPatients: true,
      user: { select: { fullName: true } },
      speciality: {
        select: { id: true, name: true, slug: true, iconKey: true, preparationNotes: true, patientBlurb: true },
      },
      scheduleRules: {
        where: { isActive: true },
        select: { dayOfWeek: true, startTime: true, endTime: true, location: { select: { id: true, name: true } } },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      },
    },
  })
  if (!doctor) throw errors.notFound('We could not find that doctor.')
  return { ...doctor, name: doctor.user.fullName }
}

export type DoctorDetail = Awaited<ReturnType<typeof getDoctor>>

/** Resolve the Doctor row for a signed-in doctor user. */
export async function getDoctorByUserId(userId: string) {
  const doctor = await db.doctor.findUnique({
    where: { userId },
    select: {
      id: true,
      clinicId: true,
      slotDurationMins: true,
      user: { select: { fullName: true } },
      speciality: { select: { id: true, name: true } },
    },
  })
  if (!doctor) throw errors.forbidden('This account is not linked to a doctor profile.')
  return doctor
}
