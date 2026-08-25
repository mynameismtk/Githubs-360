import 'server-only'
import { randomInt, randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(_scrypt) as (p: string, s: string, k: number) => Promise<Buffer>

/**
 * OTP generation and verification.
 *
 * The code is never stored, never logged in production, and never returned by the API.
 * We store a scrypt hash with a per-challenge salt. docs/02 TD-3.
 */

export const OTP_LENGTH = 6
export const OTP_TTL_SECONDS = 5 * 60
export const OTP_MAX_ATTEMPTS = 5

/** `randomInt` is CSPRNG-backed; `Math.random` would make codes predictable. */
export function generateOtp(): string {
  return String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0')
}

export function newSalt(): string {
  return randomBytes(16).toString('hex')
}

export async function hashOtp(code: string, salt: string): Promise<string> {
  const derived = await scrypt(code, salt, 32)
  return derived.toString('hex')
}

/**
 * Constant-time comparison. A naive `===` on hashes leaks timing information that can, in
 * principle, be used to narrow a code — cheap to avoid, so we avoid it.
 */
export async function verifyOtp(code: string, salt: string, expectedHash: string): Promise<boolean> {
  const actual = await hashOtp(code, salt)
  const a = Buffer.from(actual, 'hex')
  const b = Buffer.from(expectedHash, 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Normalise an Indian mobile number to E.164.
 * Accepts "98765 43210", "+91 98765-43210", "09876543210".
 */
export function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) return `+91${digits.slice(1)}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  if (digits.length >= 10 && digits.length <= 15 && raw.trim().startsWith('+')) return `+${digits}`
  return null
}

/** "+919876543210" → "+91 98765 43210" for display; never used as a key. */
export function formatPhone(e164: string): string {
  if (e164.startsWith('+91') && e164.length === 13) {
    return `+91 ${e164.slice(3, 8)} ${e164.slice(8)}`
  }
  return e164
}

/** Masked for display in "we sent a code to …" copy. */
export function maskPhone(e164: string): string {
  if (e164.length < 4) return '••••'
  return `${e164.slice(0, 3)} •••• ${e164.slice(-3)}`
}
