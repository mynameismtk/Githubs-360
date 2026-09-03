import 'server-only'
import { db } from '@/server/db'
import { errors, AppError } from '@/lib/errors'
import { getSmsProvider } from '@/server/integrations'
import { rateLimit, LIMITS } from '@/server/auth/rate-limit'
import {
  generateOtp,
  hashOtp,
  newSalt,
  verifyOtp,
  normalisePhone,
  maskPhone,
  OTP_TTL_SECONDS,
  OTP_MAX_ATTEMPTS,
} from '@/server/auth/otp'
import { createAnkuraSession } from '../session'

/**
 * Ankura login by mobile + OTP — a consumer self-signup, unlike Clinic 360 where an
 * account must already exist. A first-time number gets an account the moment the code
 * is verified; §7 puts "auth + basic profile" first in the MVP for exactly this reason.
 */

export interface RequestOtpResult {
  challengeId: string
  maskedPhone: string
  expiresInSeconds: number
  /** Development only — hard-gated on NODE_ENV so it can never appear in production. */
  devCode?: string
}

export async function ankuraRequestOtp(rawPhone: string, meta: { ip?: string | null }): Promise<RequestOtpResult> {
  const phone = normalisePhone(rawPhone)
  if (!phone) throw errors.validation('Enter a valid 10-digit mobile number.')

  const perPhone = rateLimit(`ankura:otp:phone:${phone}`, LIMITS.otpRequestPerPhone.limit, LIMITS.otpRequestPerPhone.windowSeconds)
  if (!perPhone.allowed) {
    throw errors.rateLimited(`Too many code requests. Try again in ${Math.ceil(perPhone.retryAfterSeconds / 60)} minute(s).`)
  }
  if (meta.ip) {
    const perIp = rateLimit(`ankura:otp:ip:${meta.ip}`, LIMITS.otpRequestPerIp.limit, LIMITS.otpRequestPerIp.windowSeconds)
    if (!perIp.allowed) throw errors.rateLimited()
  }

  const existing = await db.ankuraUser.findUnique({ where: { phone }, select: { id: true } })

  const code = generateOtp()
  const salt = newSalt()
  const challenge = await db.ankuraOtpChallenge.create({
    data: {
      phone,
      userId: existing?.id ?? null,
      codeHash: await hashOtp(code, salt),
      salt,
      maxAttempts: OTP_MAX_ATTEMPTS,
      expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
    },
    select: { id: true },
  })

  await getSmsProvider().send({
    to: phone,
    body: `${code} is your Ankura verification code. It expires in 5 minutes. Do not share it with anyone.`,
  })

  return {
    challengeId: challenge.id,
    maskedPhone: maskPhone(phone),
    expiresInSeconds: OTP_TTL_SECONDS,
    ...(process.env.NODE_ENV !== 'production' ? { devCode: code } : {}),
  }
}

export interface VerifyOtpResult {
  isNewUser: boolean
  onboardedAt: Date | null
  role: 'PATIENT' | 'SUPPORT' | 'CLINIC_STAFF'
}

export async function ankuraVerifyOtpAndSignIn(
  challengeId: string,
  code: string,
  meta: { ip?: string | null },
): Promise<VerifyOtpResult> {
  if (meta.ip) {
    const perIp = rateLimit(`ankura:otpv:ip:${meta.ip}`, LIMITS.otpVerifyPerIp.limit, LIMITS.otpVerifyPerIp.windowSeconds)
    if (!perIp.allowed) throw errors.rateLimited()
  }

  const challenge = await db.ankuraOtpChallenge.findUnique({ where: { id: challengeId } })
  if (!challenge) throw errors.validation('This code request is no longer valid. Please start again.')
  if (challenge.consumedAt) throw errors.validation('This code has already been used. Please request a new one.')
  if (challenge.expiresAt <= new Date()) throw new AppError('OTP_EXPIRED', 'That code has expired. Please request a new one.')
  if (challenge.attempts >= challenge.maxAttempts) {
    throw new AppError('OTP_ATTEMPTS_EXCEEDED', 'Too many incorrect attempts. Please request a new code.')
  }

  const ok = await verifyOtp(code, challenge.salt, challenge.codeHash)
  if (!ok) {
    const updated = await db.ankuraOtpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true, maxAttempts: true },
    })
    const left = updated.maxAttempts - updated.attempts
    if (left <= 0) {
      await db.ankuraOtpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } })
      throw new AppError('OTP_ATTEMPTS_EXCEEDED', 'Too many incorrect attempts. Please request a new code.')
    }
    throw new AppError('OTP_INVALID', `That code isn't right. ${left} attempt${left === 1 ? '' : 's'} left.`)
  }

  await db.ankuraOtpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } })

  let userId = challenge.userId
  let isNewUser = false
  if (!userId) {
    const created = await db.ankuraUser.create({
      data: { phone: challenge.phone, phoneVerifiedAt: new Date() },
      select: { id: true },
    })
    userId = created.id
    isNewUser = true
  } else {
    await db.ankuraUser.update({ where: { id: userId }, data: { phoneVerifiedAt: new Date() } })
  }

  await createAnkuraSession(userId)

  const user = await db.ankuraUser.findUniqueOrThrow({ where: { id: userId }, select: { onboardedAt: true, role: true } })
  return { isNewUser, onboardedAt: user.onboardedAt, role: user.role }
}
