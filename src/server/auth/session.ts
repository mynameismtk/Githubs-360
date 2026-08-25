import 'server-only'
import { cookies, headers } from 'next/headers'
import { randomBytes, createHash } from 'node:crypto'
import { db } from '../db'
import type { Role } from '@prisma/client'

/**
 * Server-side sessions.
 *
 * The cookie carries a 256-bit random token. We store only its SHA-256, so a database
 * read cannot be replayed as a login. Sessions are revocable server-side, which is what
 * makes "sign out on all devices" and a compromised-phone response actually work.
 */

export const SESSION_COOKIE = 'c360_session'
const SESSION_TTL_DAYS = 30

export interface SessionActor {
  sessionId: string
  userId: string
  clinicId: string
  role: Role
  fullName: string
  phone: string
  locale: string
  avatarUrl: string | null
  /** UI convenience only — never trusted for authorization. See docs/04 §2. */
  activePatientId: string | null
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(userId: string, meta: { ip?: string | null; userAgent?: string | null }) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000)

  await db.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      ipAddress: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
    },
  })

  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })

  await db.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } })
  return { expiresAt }
}

/**
 * Resolve the current actor, or null.
 *
 * Deliberately returns null rather than throwing, so layouts can decide between
 * redirecting and rendering a signed-out view. Callers that require an actor use
 * `requireActor()`.
 */
export async function getActor(): Promise<SessionActor | null> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      expiresAt: true,
      revokedAt: true,
      activePatientId: true,
      user: {
        select: {
          id: true,
          clinicId: true,
          role: true,
          fullName: true,
          phone: true,
          locale: true,
          avatarUrl: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  })

  if (!session) return null
  if (session.revokedAt) return null
  if (session.expiresAt <= new Date()) return null
  if (!session.user.isActive || session.user.deletedAt) return null

  // `lastSeenAt` is throttled to once a minute — a write on every request would turn
  // every page view into a database write for no operational benefit.
  void touchSession(session.id)

  return {
    sessionId: session.id,
    userId: session.user.id,
    clinicId: session.user.clinicId,
    role: session.user.role,
    fullName: session.user.fullName,
    phone: session.user.phone,
    locale: session.user.locale,
    avatarUrl: session.user.avatarUrl,
    activePatientId: session.activePatientId,
  }
}

const lastTouch = new Map<string, number>()
async function touchSession(sessionId: string) {
  const now = Date.now()
  const previous = lastTouch.get(sessionId) ?? 0
  if (now - previous < 60_000) return
  lastTouch.set(sessionId, now)
  await db.session.update({ where: { id: sessionId }, data: { lastSeenAt: new Date() } }).catch(() => undefined)
}

export async function destroySession(): Promise<void> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (token) {
    await db.session
      .updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } })
      .catch(() => undefined)
  }
  jar.delete(SESSION_COOKIE)
}

/** Persist the family-switcher selection. A UI preference, re-validated on every read. */
export async function setActivePatient(sessionId: string, patientId: string): Promise<void> {
  await db.session.update({ where: { id: sessionId }, data: { activePatientId: patientId } })
}

export async function requestMeta() {
  const h = await headers()
  return {
    ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    userAgent: h.get('user-agent'),
  }
}
