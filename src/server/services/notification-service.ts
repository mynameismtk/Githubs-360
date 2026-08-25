import 'server-only'
import { db } from '../db'
import { getPushProvider, getSmsProvider, getEmailProvider } from '../integrations'
import type { NotificationKind } from '@prisma/client'

/**
 * Notification fan-out.
 *
 * Two rules encoded here:
 *   1. Preferences are respected. A notification the user has turned off is recorded as
 *      SUPPRESSED rather than sent — so "we didn't spam them" is provable (§22).
 *   2. Push and SMS bodies are non-clinical. A lock-screen preview is visible to anyone
 *      holding the phone, so "Your report is ready" — never the result. Risk R-16.
 */

export interface NotifyInput {
  clinicId: string
  userId: string
  patientId?: string | null
  kind: NotificationKind
  title: string
  /** Shown in-app. May be specific, but never contains a clinical finding. */
  body: string
  actionUrl?: string
  /** Overrides the in-app body for push/SMS, where it must be even less revealing. */
  externalBody?: string
  metadata?: Record<string, unknown>
}

const DEFAULTS: Record<string, { push: boolean; sms: boolean; email: boolean }> = {
  APPOINTMENT_CONFIRMED: { push: true, sms: true, email: false },
  APPOINTMENT_REMINDER: { push: true, sms: true, email: false },
  APPOINTMENT_CANCELLED: { push: true, sms: true, email: false },
  APPOINTMENT_RESCHEDULED: { push: true, sms: true, email: false },
  QUEUE_APPROACHING: { push: true, sms: false, email: false },
  LAB_REPORT_READY: { push: true, sms: true, email: false },
  PAYMENT_DUE: { push: true, sms: false, email: false },
  FOLLOW_UP_DUE: { push: true, sms: false, email: false },
  ANNOUNCEMENT: { push: false, sms: false, email: false },
}

/**
 * Always writes the in-app row first, then attempts external channels. The in-app record
 * is the durable one; a failed push must never mean the patient has no record of it.
 */
export async function notify(input: NotifyInput): Promise<void> {
  const prefs = await db.notificationPreference.findUnique({
    where: { userId_kind: { userId: input.userId, kind: input.kind } },
  })
  const fallback = DEFAULTS[input.kind] ?? { push: true, sms: false, email: false }

  const inApp = prefs?.inApp ?? true
  await db.notification.create({
    data: {
      clinicId: input.clinicId,
      userId: input.userId,
      patientId: input.patientId ?? null,
      kind: input.kind,
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl ?? null,
      channel: 'IN_APP',
      status: inApp ? 'SENT' : 'SUPPRESSED',
      sentAt: inApp ? new Date() : null,
      metadata: (input.metadata ?? {}) as object,
    },
  })

  // Push/SMS text stays non-clinical (risk R-16). When no external body is supplied we
  // send the title alone rather than repeating it — "Your report is ready. Your report is
  // ready" is what a duplicated template produces, and patients read these.
  const externalBody = input.externalBody ?? null
  const wantsPush = prefs?.push ?? fallback.push
  const wantsSms = prefs?.sms ?? fallback.sms
  const wantsEmail = prefs?.email ?? fallback.email

  if (wantsPush) {
    await deliver(input, 'PUSH', async () => {
      const result = await getPushProvider().send({
        userId: input.userId,
        title: input.title,
        body: externalBody ?? input.title,
        deepLink: input.actionUrl,
      })
      return 'skipped' in result ? null : result.providerRef
    })
  }

  if (wantsSms) {
    const [user, clinic] = await Promise.all([
      db.user.findUnique({ where: { id: input.userId }, select: { phone: true } }),
      // The clinic name is configuration, not a constant (§42) — an SMS signed with the
      // wrong clinic's name is the most visible way to break white-labelling.
      db.clinic.findUnique({ where: { id: input.clinicId }, select: { name: true } }),
    ])
    if (user?.phone) {
      await deliver(input, 'SMS', async () => {
        const detail = externalBody && externalBody !== input.title ? `. ${externalBody}` : ''
        const { providerRef } = await getSmsProvider().send({
          to: user.phone,
          body: `${input.title}${detail} — ${clinic?.name ?? 'Your clinic'}`,
        })
        return providerRef
      })
    }
  }

  if (wantsEmail) {
    const user = await db.user.findUnique({ where: { id: input.userId }, select: { email: true } })
    if (user?.email) {
      await deliver(input, 'EMAIL', async () => {
        const { providerRef } = await getEmailProvider().send({
          to: user.email!,
          subject: input.title,
          body: externalBody ?? input.title,
        })
        return providerRef
      })
    }
  }
}

/**
 * A delivery failure is recorded, not thrown. Failing a booking because an SMS gateway
 * is down would be the wrong trade — the appointment is the thing that matters.
 */
async function deliver(
  input: NotifyInput,
  channel: 'PUSH' | 'SMS' | 'EMAIL',
  send: () => Promise<string | null>,
): Promise<void> {
  try {
    const providerRef = await send()
    await db.notification.create({
      data: {
        clinicId: input.clinicId,
        userId: input.userId,
        patientId: input.patientId ?? null,
        kind: input.kind,
        title: input.title,
        body: input.externalBody ?? input.title,
        actionUrl: input.actionUrl ?? null,
        channel,
        status: providerRef ? 'SENT' : 'SUPPRESSED',
        providerRef,
        sentAt: providerRef ? new Date() : null,
      },
    })
  } catch (e) {
    console.error(`[notify] ${channel} delivery failed`, e)
    await db.notification
      .create({
        data: {
          clinicId: input.clinicId,
          userId: input.userId,
          patientId: input.patientId ?? null,
          kind: input.kind,
          title: input.title,
          body: input.externalBody ?? input.title,
          channel,
          status: 'FAILED',
        },
      })
      .catch(() => undefined)
  }
}

export async function listNotifications(userId: string, limit = 20) {
  return db.notification.findMany({
    where: { userId, channel: 'IN_APP', status: { in: ['SENT', 'DELIVERED'] } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await db.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  })
}

export async function unreadCount(userId: string): Promise<number> {
  return db.notification.count({
    where: { userId, channel: 'IN_APP', readAt: null, status: { in: ['SENT', 'DELIVERED'] } },
  })
}
