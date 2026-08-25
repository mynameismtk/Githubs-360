import 'server-only'
import { db } from './db'
import type { AuditSeverity, Role } from '@prisma/client'

/**
 * Append-only audit writer (§39).
 *
 * Two rules this module enforces by being the only way to write an audit row:
 *   1. Auditing must never break the request it is auditing. A failed audit write is
 *      logged and swallowed — refusing to show a patient their report because the audit
 *      table is full would be the worse failure.
 *   2. Metadata is allow-listed by the caller. We never spread an entire entity into the
 *      audit row, because that is how clinical text ends up in a log. Risk register R-6.
 */

export interface AuditInput {
  clinicId: string
  actorId?: string | null
  actorRole?: Role | null
  actorName?: string | null
  /** Verb-noun, e.g. "appointment.booked", "patient.record.viewed". */
  action: string
  targetType?: string
  targetId?: string
  patientId?: string | null
  severity?: AuditSeverity
  reason?: string
  ipAddress?: string | null
  userAgent?: string | null
  metadata?: Record<string, string | number | boolean | null>
}

export async function audit(input: AuditInput): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        clinicId: input.clinicId,
        actorId: input.actorId ?? null,
        actorRole: input.actorRole ?? null,
        actorName: input.actorName ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        patientId: input.patientId ?? null,
        severity: input.severity ?? 'NORMAL',
        reason: input.reason ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        metadata: input.metadata ?? {},
      },
    })
  } catch (e) {
    console.error('[audit] failed to write audit row', { action: input.action, error: e })
  }
}
