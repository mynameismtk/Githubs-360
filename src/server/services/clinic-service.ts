import 'server-only'
import { cache } from 'react'
import { db } from '../db'
import { errors } from '@/lib/errors'

/**
 * Clinic configuration.
 *
 * Nothing about the clinic is hardcoded (§42) — name, branding, phone numbers, emergency
 * number and locations all come from here. `cache()` dedupes the lookup within a single
 * render pass so the layout, header and emergency sheet share one query.
 */
export const getClinic = cache(async () => {
  const clinic = await db.clinic.findFirst({
    include: {
      locations: { where: { isActive: true, deletedAt: null }, orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }] },
    },
  })
  if (!clinic) {
    throw errors.internal('The clinic has not been set up yet. Run `npm run db:seed`.')
  }
  return clinic
})

export type ClinicWithLocations = Awaited<ReturnType<typeof getClinic>>

export const getSpecialities = cache(async (clinicId: string) => {
  return db.speciality.findMany({
    where: { clinicId, isActive: true, deletedAt: null },
    include: {
      department: { select: { id: true, name: true } },
      _count: { select: { doctors: { where: { isActive: true, deletedAt: null } } } },
    },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  })
})

export type SpecialityListItem = Awaited<ReturnType<typeof getSpecialities>>[number]
