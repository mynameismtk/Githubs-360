import 'server-only'
import { db } from '../db'
import { audit } from '../audit'
import { errors } from '@/lib/errors'
import { assertCanAccessPatient, accessiblePatientIds } from '../auth/policy'
import type { SessionActor } from '../auth/session'
import { Prisma, type Gender, type Relationship } from '@prisma/client'

/**
 * Patient reads and writes.
 *
 * Every exported function that takes a patient id calls `assertCanAccessPatient` before
 * it touches the database. There is no unscoped getter in this module — that absence is
 * the point. docs/03 §4.
 */

export async function getPatientForActor(actor: SessionActor, patientId: string) {
  const access = await assertCanAccessPatient(actor, patientId, 'READ')

  const patient = await db.patient.findUnique({
    where: { id: patientId },
    include: {
      allergies: { where: { isActive: true }, orderBy: { notedAt: 'desc' } },
      insurancePolicies: { where: { isActive: true } },
    },
  })
  if (!patient) throw errors.notFound()

  // Reads of a patient record by anyone who is not the patient's own account are audited.
  if (actor.role !== 'PATIENT') {
    await audit({
      clinicId: actor.clinicId,
      actorId: actor.userId,
      actorRole: actor.role,
      actorName: actor.fullName,
      action: 'patient.record.viewed',
      targetType: 'Patient',
      targetId: patientId,
      patientId,
      severity: 'NORMAL',
      metadata: { projection: access.projection, basis: access.basis },
    })
  }

  // OPERATIONAL actors (reception, admin) never receive clinical fields, even though the
  // row was loaded — the projection is applied here, not left to the UI.
  if (access.projection === 'OPERATIONAL') {
    const { notableHistory: _h, allergies: _a, ...operational } = patient
    return { ...operational, allergies: [], projection: access.projection }
  }

  return { ...patient, projection: access.projection }
}

/** The family list behind the switcher (§11). Grants only — never a phone-number match. */
export async function getFamilyForActor(actor: SessionActor) {
  const grants = await db.patientAccessGrant.findMany({
    where: { userId: actor.userId, status: 'ACTIVE', revokedAt: null },
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
          dateOfBirth: true,
          gender: true,
          avatarUrl: true,
          mrn: true,
          bloodGroup: true,
        },
      },
    },
    orderBy: [{ relationship: 'asc' }, { grantedAt: 'asc' }],
  })

  // "Me" always sorts first — the account holder should never have to hunt for their own
  // record in their own app.
  return grants
    .map((g) => ({
      grantId: g.id,
      relationship: g.relationship,
      level: g.level,
      isSelf: g.relationship === 'SELF',
      patient: g.patient,
    }))
    .sort((a, b) => Number(b.isSelf) - Number(a.isSelf))
}

export interface AddFamilyMemberInput {
  fullName: string
  dateOfBirth: Date
  gender: Gender
  relationship: Relationship
  phone?: string | null
  bloodGroup?: string | null
}

/**
 * Add a family member.
 *
 * A minor is granted immediately with the adder recorded as guardian. An adult must
 * confirm on their own number, so the grant starts PENDING_CONFIRMATION — an adult's
 * medical record is not something another adult may claim by typing their name.
 * docs/03 §5.
 */
export async function addFamilyMember(actor: SessionActor, input: AddFamilyMemberInput) {
  if (actor.role !== 'PATIENT') throw errors.forbidden()

  const ageYears = (Date.now() - input.dateOfBirth.getTime()) / (365.25 * 86_400_000)
  if (ageYears < 0) throw errors.validation('Date of birth cannot be in the future.')
  if (ageYears > 130) throw errors.validation('Please check the date of birth.')

  const isMinor = ageYears < 18
  const eighteenthBirthday = new Date(input.dateOfBirth)
  eighteenthBirthday.setFullYear(eighteenthBirthday.getFullYear() + 18)

  const created = await db.$transaction(async (tx) => {
    const clinic = await tx.clinic.findUniqueOrThrow({ where: { id: actor.clinicId }, select: { id: true } })
    const mrn = await nextMrn(tx)

    const patient = await tx.patient.create({
      data: {
        clinicId: clinic.id,
        mrn,
        fullName: input.fullName.trim(),
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        phone: input.phone?.trim() || null,
        isDependent: true,
      },
    })

    await tx.patientAccessGrant.create({
      data: {
        userId: actor.userId,
        patientId: patient.id,
        relationship: input.relationship,
        level: 'FULL',
        // An adult family member must confirm; a minor is granted to their guardian.
        status: isMinor ? 'ACTIVE' : 'PENDING_CONFIRMATION',
        isGuardian: isMinor,
        reviewDueAt: isMinor ? eighteenthBirthday : null,
        grantedById: actor.userId,
        confirmedAt: isMinor ? new Date() : null,
      },
    })

    return patient
  })

  await audit({
    clinicId: actor.clinicId,
    actorId: actor.userId,
    actorRole: actor.role,
    actorName: actor.fullName,
    action: 'family.member.added',
    targetType: 'Patient',
    targetId: created.id,
    patientId: created.id,
    severity: 'HIGH',
    metadata: { relationship: input.relationship, requiresConfirmation: !isMinor },
  })

  return { patient: created, requiresConfirmation: !isMinor }
}

/**
 * Allocate an MRN from a Postgres sequence.
 *
 * Counting existing rows would race under two concurrent registrations at the front
 * desk. A sequence is atomic and never hands out the same value twice; the unique
 * constraint on (clinicId, mrn) remains the backstop.
 */
async function nextMrn(tx: Prisma.TransactionClient): Promise<string> {
  const rows = await tx.$queryRaw<Array<{ nextval: bigint }>>`SELECT nextval('mrn_seq') AS nextval`
  const value = rows[0]?.nextval ?? BigInt(Date.now())
  return `C360-${String(value).padStart(5, '0')}`
}

/** Patient-facing search across the family the actor may see. Never clinic-wide. */
export async function searchAccessiblePatients(actor: SessionActor, query: string) {
  const ids = await accessiblePatientIds(actor)
  if (ids.length === 0) return []
  return db.patient.findMany({
    where: { id: { in: ids }, fullName: { contains: query, mode: 'insensitive' } },
    select: { id: true, fullName: true, mrn: true, dateOfBirth: true, gender: true, avatarUrl: true },
    take: 10,
  })
}

/** Staff-side directory search. Scoped to the clinic and audited as a search. */
export async function searchClinicPatients(actor: SessionActor, query: string) {
  if (actor.role === 'PATIENT') throw errors.forbidden()
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const results = await db.patient.findMany({
    where: {
      clinicId: actor.clinicId,
      deletedAt: null,
      OR: [
        { fullName: { contains: trimmed, mode: 'insensitive' } },
        { mrn: { contains: trimmed, mode: 'insensitive' } },
        { phone: { contains: trimmed } },
      ],
    },
    select: { id: true, fullName: true, mrn: true, dateOfBirth: true, gender: true, phone: true, avatarUrl: true },
    orderBy: { fullName: 'asc' },
    take: 25,
  })

  await audit({
    clinicId: actor.clinicId,
    actorId: actor.userId,
    actorRole: actor.role,
    actorName: actor.fullName,
    action: 'patient.searched',
    severity: 'LOW',
    metadata: { queryLength: trimmed.length, resultCount: results.length },
  })

  return results
}
