import 'server-only'
import { cookies, headers } from 'next/headers'
import { randomBytes, createHash } from 'node:crypto'
import { db } from '../db'
import type { AnkuraRole, AnkuraCycleStage, AnkuraCycleType } from '@prisma/client'

/**
 * Ankura's own server-side sessions.
 *
 * Deliberately a sibling of src/server/auth/session.ts rather than a reuse of it: Ankura
 * is a separate product with its own login table (AnkuraUser), so its session cookie,
 * token hashing and actor shape all live here, isolated from Clinic 360's auth. Same
 * security shape though — a random token in the cookie, only its SHA-256 stored, server
 * side revocation.
 */

export const ANKURA_SESSION_COOKIE = 'ankura_session'
const SESSION_TTL_DAYS = 60

export interface AnkuraActor {
  sessionId: string
  userId: string
  clinicId: string | null
  role: AnkuraRole
  fullName: string | null
  phone: string
  locale: string
  onboardedAt: Date | null
  cycleType: AnkuraCycleType | null
  cycleStage: AnkuraCycleStage | null
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createAnkuraSession(userId: string): Promise<{ expiresAt: Date }> {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000)

  await db.ankuraSession.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  })

  const jar = await cookies()
  jar.set(ANKURA_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })

  await db.ankuraUser.update({ where: { id: userId }, data: { lastLoginAt: new Date() } })
  return { expiresAt }
}

/** Returns null rather than throwing — layouts decide between redirecting and a signed-out view. */
export async function getAnkuraActor(): Promise<AnkuraActor | null> {
  const jar = await cookies()
  const token = jar.get(ANKURA_SESSION_COOKIE)?.value
  if (!token) return null

  const session = await db.ankuraSession.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          id: true,
          clinicId: true,
          role: true,
          fullName: true,
          phone: true,
          locale: true,
          onboardedAt: true,
          cycleType: true,
          cycleStage: true,
        },
      },
    },
  })

  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null

  void touchSession(session.id)

  return {
    sessionId: session.id,
    userId: session.user.id,
    clinicId: session.user.clinicId,
    role: session.user.role,
    fullName: session.user.fullName,
    phone: session.user.phone,
    locale: session.user.locale,
    onboardedAt: session.user.onboardedAt,
    cycleType: session.user.cycleType,
    cycleStage: session.user.cycleStage,
  }
}

export async function requireAnkuraActor(): Promise<AnkuraActor> {
  const actor = await getAnkuraActor()
  if (!actor) throw new Error('UNAUTHENTICATED')
  return actor
}

const lastTouch = new Map<string, number>()
async function touchSession(sessionId: string) {
  const now = Date.now()
  const previous = lastTouch.get(sessionId) ?? 0
  if (now - previous < 60_000) return
  lastTouch.set(sessionId, now)
  await db.ankuraSession.update({ where: { id: sessionId }, data: { lastSeenAt: new Date() } }).catch(() => undefined)
}

export async function destroyAnkuraSession(): Promise<void> {
  const jar = await cookies()
  const token = jar.get(ANKURA_SESSION_COOKIE)?.value
  if (token) {
    await db.ankuraSession
      .updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } })
      .catch(() => undefined)
  }
  jar.delete(ANKURA_SESSION_COOKIE)
}

export async function ankuraRequestMeta() {
  const h = await headers()
  return { ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null, userAgent: h.get('user-agent') }
}
