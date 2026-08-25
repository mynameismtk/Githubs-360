import 'server-only'
import { db } from '../db'
import { audit } from '../audit'
import { errors } from '@/lib/errors'
import { getSmsProvider } from '../integrations'
import { rateLimit, LIMITS } from '../auth/rate-limit'
import {
  generateOtp,
  hashOtp,
  newSalt,
  verifyOtp,
  normalisePhone,
  maskPhone,
  OTP_TTL_SECONDS,
  OTP_MAX_ATTEMPTS,
} from '../auth/otp'
import { createSession } from '../auth/session'

/**
 * Login by mobile + OTP.
 *
 * The two properties that matter most here:
 *   1. This endpoint must not reveal whether a phone number is registered. The response
 *      is byte-identical for a known and an unknown number.
 *   2. The code is never returned, never logged in production, and only ever leaves the
 *      server through the SMS provider.
 */

export interface RequestOtpResult {
  challengeId: string
  maskedPhone: string
  expiresInSeconds: number
  /**
   * Development only. Lets the demo be driven without an SMS gateway, and is hard-gated
   * on NODE_ENV so it can never appear in a production response.
   */
  devCode?: string
}

export async function requestOtp(
  clinicId: string,
  rawPhone: string,
  meta: { ip?: string | null },
): Promise<RequestOtpResult> {
  const phone = normalisePhone(rawPhone)
  if (!phone) throw errors.validation('Enter a valid 10-digit mobile number.')

  const perPhone = rateLimit(`otp:phone:${phone}`, LIMITS.otpRequestPerPhone.limit, LIMITS.otpRequestPerPhone.windowSeconds)
  if (!perPhone.allowed) {
    throw errors.rateLimited(`Too many code requests. Try again in ${Math.ceil(perPhone.retryAfterSeconds / 60)} minute(s).`)
  }
  if (meta.ip) {
    const perIp = rateLimit(`otp:ip:${meta.ip}`, LIMITS.otpRequestPerIp.limit, LIMITS.otpRequestPerIp.windowSeconds)
    if (!perIp.allowed) throw errors.rateLimited()
  }

  const [user, clinic] = await Promise.all([
    db.user.findUnique({
      where: { clinicId_phone: { clinicId, phone } },
      select: { id: true, isActive: true, deletedAt: true },
    }),
    // The clinic name is configuration, not a constant (§42). This is the first message a
    // patient ever receives from us, so signing it with the wrong name is the worst place
    // to leak a hardcoded brand.
    db.clinic.findUnique({ where: { id: clinicId }, select: { name: true } }),
  ])

  const code = generateOtp()
  const salt = newSalt()
  const challenge = await db.otpChallenge.create({
    data: {
      clinicId,
      phone,
      userId: user && user.isActive && !user.deletedAt ? user.id : null,
      codeHash: await hashOtp(code, salt),
      salt,
      purpose: 'LOGIN',
      maxAttempts: OTP_MAX_ATTEMPTS,
      expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
      ipAddress: meta.ip ?? null,
    },
    select: { id: true },
  })

  // Send only to a real account. An unknown number gets an identical response and no
  // SMS — enumeration resistance without a different code path the timing could reveal.
  if (user && user.isActive && !user.deletedAt) {
    await getSmsProvider().send({
      to: phone,
      body: `${code} is your ${clinic?.name ?? 'clinic'} verification code. It expires in 5 minutes. Do not share it with anyone.`,
    })
  }

  return {
    challengeId: challenge.id,
    maskedPhone: maskPhone(phone),
    expiresInSeconds: OTP_TTL_SECONDS,
    ...(process.env.NODE_ENV !== 'production' && user ? { devCode: code } : {}),
  }
}

export async function verifyOtpAndSignIn(
  challengeId: string,
  code: string,
  meta: { ip?: string | null; userAgent?: string | null },
): Promise<{ userId: string; role: string }> {
  if (meta.ip) {
    const perIp = rateLimit(`otpv:ip:${meta.ip}`, LIMITS.otpVerifyPerIp.limit, LIMITS.otpVerifyPerIp.windowSeconds)
    if (!perIp.allowed) throw errors.rateLimited()
  }

  const challenge = await db.otpChallenge.findUnique({ where: { id: challengeId } })
  if (!challenge) throw errors.validation('This code request is no longer valid. Please start again.')
  if (challenge.consumedAt) throw errors.validation('This code has already been used. Please request a new one.')
  if (challenge.expiresAt <= new Date()) {
    throw new (await import('@/lib/errors')).AppError('OTP_EXPIRED', 'That code has expired. Please request a new one.')
  }
  if (challenge.attempts >= challenge.maxAttempts) {
    throw new (await import('@/lib/errors')).AppError(
      'OTP_ATTEMPTS_EXCEEDED',
      'Too many incorrect attempts. Please request a new code.',
    )
  }

  const ok = await verifyOtp(code, challenge.salt, challenge.codeHash)
  if (!ok) {
    const updated = await db.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true, maxAttempts: true },
    })
    const left = updated.maxAttempts - updated.attempts
    // Burn the challenge on the last failure so it cannot be retried further.
    if (left <= 0) {
      await db.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } })
      await audit({
        clinicId: challenge.clinicId,
        action: 'auth.otp.attempts_exceeded',
        severity: 'HIGH',
        ipAddress: meta.ip ?? null,
        metadata: { phone: maskPhone(challenge.phone) },
      })
      throw new (await import('@/lib/errors')).AppError(
        'OTP_ATTEMPTS_EXCEEDED',
        'Too many incorrect attempts. Please request a new code.',
      )
    }
    throw new (await import('@/lib/errors')).AppError(
      'OTP_INVALID',
      `That code isn't right. ${left} attempt${left === 1 ? '' : 's'} left.`,
    )
  }

  // A valid code against a challenge with no user means the number is not registered.
  // We only reveal that here, after proving control of the phone.
  if (!challenge.userId) {
    await db.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } })
    throw errors.notFound('We could not find an account for this number. Please contact the clinic to register.')
  }

  await db.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } })

  const user = await db.user.findUnique({
    where: { id: challenge.userId },
    select: { id: true, role: true, clinicId: true, fullName: true, phoneVerifiedAt: true },
  })
  if (!user) throw errors.notFound('We could not find an account for this number.')

  if (!user.phoneVerifiedAt) {
    await db.user.update({ where: { id: user.id }, data: { phoneVerifiedAt: new Date() } })
  }

  await createSession(user.id, meta)
  await audit({
    clinicId: user.clinicId,
    actorId: user.id,
    actorRole: user.role,
    actorName: user.fullName,
    action: 'auth.signed_in',
    severity: 'NORMAL',
    ipAddress: meta.ip ?? null,
    userAgent: meta.userAgent ?? null,
  })

  return { userId: user.id, role: user.role }
}
