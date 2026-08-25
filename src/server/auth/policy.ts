import 'server-only'
import { db } from '../db'
import { errors } from '@/lib/errors'
import type { Role } from '@prisma/client'
import type { SessionActor } from './session'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE AUTHORIZATION LAYER
 *
 * This module is the single place that decides whether an actor may touch a patient.
 * Nothing else in the codebase resolves a patient id into readable data. If you find
 * yourself wanting a `getPatient(id)` that skips this, the bug you are about to write is
 * the one that exposes one family member's records to another.
 *
 * docs/03-roles-and-permissions.md is the specification this implements.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * How much of a patient the actor may see. Returning a level rather than a boolean is
 * deliberate: callers are forced to handle the projection, so "allowed" can never quietly
 * become "allowed to see everything".
 */
export type Projection =
  /** Full clinical record. Patient (self/family), treating doctor, break-glass. */
  | 'FULL'
  /** Demographics + only the artefacts this role works on. Lab, pharmacy. */
  | 'RESTRICTED'
  /** Demographics, appointments, invoices. NO clinical content. Reception, admin. */
  | 'OPERATIONAL'

export type PatientAction =
  | 'READ'
  | 'READ_CLINICAL'
  | 'READ_DOCUMENT'
  | 'BOOK'
  | 'UPDATE'
  | 'WRITE_CLINICAL'

export interface PatientAccess {
  patientId: string
  projection: Projection
  /** Why access was granted — recorded in the audit row. */
  basis: string
}

// ── Capability layer ─────────────────────────────────────────────────────────

/** Coarse role gate, checked before scope. Both must pass. */
export function assertRole(actor: SessionActor | null, allowed: Role[]): asserts actor is SessionActor {
  if (!actor) throw errors.unauthenticated()
  if (!allowed.includes(actor.role)) throw errors.forbidden()
}

export function requireActor(actor: SessionActor | null): SessionActor {
  if (!actor) throw errors.unauthenticated()
  return actor
}

/** Which surface a role belongs to. Used by layouts to refuse cross-surface access. */
export function surfaceForRole(role: Role): '/app' | '/console' | '/ops' {
  switch (role) {
    case 'PATIENT':
      return '/app'
    case 'DOCTOR':
    case 'NURSE':
    case 'LAB_TECH':
    case 'PHARMACIST':
      return '/console'
    case 'RECEPTIONIST':
    case 'ADMIN':
      return '/ops'
  }
}

// ── Scope layer ──────────────────────────────────────────────────────────────

/**
 * Every patient id a user may act on, via non-revoked access grants.
 * This is the query behind the family switcher and behind every patient-scoped list.
 */
export async function accessiblePatientIds(actor: SessionActor): Promise<string[]> {
  if (actor.role !== 'PATIENT') return []
  const grants = await db.patientAccessGrant.findMany({
    where: { userId: actor.userId, status: 'ACTIVE', revokedAt: null },
    select: { patientId: true },
  })
  return grants.map((g) => g.patientId)
}

/**
 * THE check. Throws unless the actor may perform `action` on `patientId`.
 *
 * Note that a denial is a 404 rather than a 403 for patient-role actors: telling someone
 * "that patient exists but is not yours" is itself a disclosure. Staff get a 403, because
 * for them the existence of a patient is not the secret — the content is.
 */
export async function assertCanAccessPatient(
  actor: SessionActor | null,
  patientId: string,
  action: PatientAction = 'READ',
): Promise<PatientAccess> {
  const a = requireActor(actor)

  // Patients: access exists only through a grant. No exceptions, no shortcuts.
  if (a.role === 'PATIENT') {
    const grant = await db.patientAccessGrant.findUnique({
      where: { userId_patientId: { userId: a.userId, patientId } },
      select: { level: true, status: true, revokedAt: true, relationship: true },
    })
    if (!grant || grant.revokedAt || grant.status !== 'ACTIVE') throw errors.notFound()

    const writes: PatientAction[] = ['BOOK', 'UPDATE', 'WRITE_CLINICAL']
    if (grant.level === 'VIEW_ONLY' && writes.includes(action)) {
      throw errors.forbidden('You have view-only access to this family member.')
    }
    // A patient never writes clinical content, whatever their grant level says.
    if (action === 'WRITE_CLINICAL') throw errors.forbidden()

    return { patientId, projection: 'FULL', basis: `grant:${grant.relationship}` }
  }

  // Everyone else must belong to the same clinic as the patient.
  const patient = await db.patient.findFirst({
    where: { id: patientId, clinicId: a.clinicId, deletedAt: null },
    select: { id: true },
  })
  if (!patient) throw errors.notFound()

  switch (a.role) {
    case 'DOCTOR': {
      const doctor = await db.doctor.findUnique({ where: { userId: a.userId }, select: { id: true } })
      if (!doctor) throw errors.forbidden()

      // A care relationship is an appointment (past, present or future), which covers
      // the referral and follow-up cases too since both produce an appointment.
      const hasAppointment = await db.appointment.findFirst({
        where: { doctorId: doctor.id, patientId },
        select: { id: true },
      })
      if (hasAppointment) return { patientId, projection: 'FULL', basis: 'care-relationship:appointment' }

      const hasJourney = await db.careJourney.findFirst({
        where: { doctorId: doctor.id, patientId },
        select: { id: true },
      })
      if (hasJourney) return { patientId, projection: 'FULL', basis: 'care-relationship:journey' }

      // No relationship. Break-glass is the documented path (docs/03 §6) and is a
      // separate, audited, reason-carrying action — not a silent fallback here.
      throw errors.forbidden(
        'You do not have a care relationship with this patient. Use emergency access if this is clinically necessary.',
      )
    }

    case 'NURSE': {
      // Scope is today's list. A nurse has no reason to read last year's consultations.
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(startOfDay.getTime() + 86_400_000)
      const onList = await db.appointment.findFirst({
        where: { patientId, startAt: { gte: startOfDay, lt: endOfDay }, status: { not: 'CANCELLED' } },
        select: { id: true },
      })
      if (!onList) throw errors.forbidden('This patient is not on today’s list.')
      if (action === 'READ_CLINICAL') return { patientId, projection: 'RESTRICTED', basis: 'nurse:today' }
      return { patientId, projection: 'RESTRICTED', basis: 'nurse:today' }
    }

    case 'LAB_TECH': {
      const order = await db.labOrder.findFirst({
        where: { patientId, status: { notIn: ['CANCELLED'] } },
        select: { id: true },
      })
      if (!order) throw errors.forbidden('No laboratory order exists for this patient.')
      return { patientId, projection: 'RESTRICTED', basis: 'lab:open-order' }
    }

    case 'PHARMACIST': {
      const rx = await db.prescription.findFirst({
        where: { patientId, status: 'ACTIVE' },
        select: { id: true },
      })
      if (!rx) throw errors.forbidden('No active prescription exists for this patient.')
      return { patientId, projection: 'RESTRICTED', basis: 'pharmacy:active-rx' }
    }

    case 'RECEPTIONIST':
      // Reception runs the front desk. It does not read clinical content — it can see
      // that a report exists and is ready, never what it says.
      if (action === 'READ_CLINICAL' || action === 'WRITE_CLINICAL') throw errors.forbidden()
      return { patientId, projection: 'OPERATIONAL', basis: 'reception:same-clinic' }

    case 'ADMIN':
      // An administrator is not a clinician. Clinical content requires break-glass.
      if (action === 'READ_CLINICAL' || action === 'WRITE_CLINICAL') {
        throw errors.forbidden('Clinical records require emergency access, which is logged and reviewed.')
      }
      return { patientId, projection: 'OPERATIONAL', basis: 'admin:same-clinic' }

    default:
      throw errors.forbidden()
  }
}

/** Convenience for list endpoints: the ids a patient-role actor may see, or throw. */
export async function requireAccessiblePatientIds(actor: SessionActor | null): Promise<string[]> {
  const a = requireActor(actor)
  const ids = await accessiblePatientIds(a)
  if (ids.length === 0) throw errors.notFound('No patient profile is linked to this account yet.')
  return ids
}

/**
 * Resolve which family member the UI should show as selected.
 * Falls back to the account holder's own record if the stored preference is stale or
 * points at a patient the user can no longer see — the tamper case resolves safely.
 */
export async function resolveActivePatientId(actor: SessionActor): Promise<string | null> {
  const ids = await accessiblePatientIds(actor)
  if (ids.length === 0) return null
  if (actor.activePatientId && ids.includes(actor.activePatientId)) return actor.activePatientId

  const self = await db.patientAccessGrant.findFirst({
    where: { userId: actor.userId, status: 'ACTIVE', relationship: 'SELF' },
    select: { patientId: true },
  })
  return self?.patientId ?? ids[0] ?? null
}
