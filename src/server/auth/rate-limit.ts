import 'server-only'

/**
 * Fixed-window rate limiter.
 *
 * KNOWN LIMITATION (risk register R-15): this counts in process memory, so it is correct
 * for a single instance and becomes per-instance the moment the app is scaled out. That
 * is acceptable for a single-clinic deployment and must be replaced with Redis before
 * horizontal scaling. It is stated here rather than left to be discovered.
 */

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

/** Opportunistic sweep so a long-running process does not accumulate dead keys. */
function sweep(now: number) {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now()
  sweep(now)
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  existing.count += 1
  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }
  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds: 0 }
}

export const LIMITS = {
  otpRequestPerPhone: { limit: 3, windowSeconds: 600 },
  otpRequestPerIp: { limit: 20, windowSeconds: 3600 },
  otpVerifyPerIp: { limit: 20, windowSeconds: 600 },
  writePerSession: { limit: 60, windowSeconds: 60 },
  searchPerSession: { limit: 30, windowSeconds: 60 },
} as const
