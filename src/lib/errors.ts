/**
 * One error vocabulary for the whole application.
 *
 * The rule (docs/05 §2): a patient never sees a technical error. Every failure that can
 * reach a user carries a `message` written in plain language that is safe to render
 * directly, and a stable `code` the UI can branch on.
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SLOT_TAKEN'
  | 'UNPROCESSABLE'
  | 'RATE_LIMITED'
  | 'OTP_INVALID'
  | 'OTP_EXPIRED'
  | 'OTP_ATTEMPTS_EXCEEDED'
  | 'INTERNAL'

const STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SLOT_TAKEN: 409,
  UNPROCESSABLE: 422,
  RATE_LIMITED: 429,
  OTP_INVALID: 400,
  OTP_EXPIRED: 410,
  OTP_ATTEMPTS_EXCEEDED: 429,
  INTERNAL: 500,
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: Record<string, unknown>

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = STATUS[code]
    this.details = details
  }
}

/** Convenience constructors so call sites read as prose. */
export const errors = {
  validation: (message = 'Please check the details you entered.', details?: Record<string, unknown>) =>
    new AppError('VALIDATION_ERROR', message, details),
  unauthenticated: (message = 'Please sign in to continue.') => new AppError('UNAUTHENTICATED', message),
  forbidden: (message = "You don't have access to this.") => new AppError('FORBIDDEN', message),
  notFound: (message = "We couldn't find what you were looking for.") => new AppError('NOT_FOUND', message),
  conflict: (message: string, details?: Record<string, unknown>) => new AppError('CONFLICT', message, details),
  slotTaken: () =>
    new AppError('SLOT_TAKEN', 'That time was just booked by someone else. Please pick another slot.'),
  unprocessable: (message: string) => new AppError('UNPROCESSABLE', message),
  rateLimited: (message = 'Too many attempts. Please wait a moment and try again.') =>
    new AppError('RATE_LIMITED', message),
  internal: (message = 'Something went wrong on our side. Please try again.') =>
    new AppError('INTERNAL', message),
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError
}

/**
 * Last line of defence. Anything that is not an AppError is assumed to contain detail we
 * must not leak (SQL text, file paths, provider responses), so it becomes an opaque 500.
 * The real error is logged server-side against a correlation id.
 */
export function toSafeError(e: unknown, correlationId: string): AppError {
  if (isAppError(e)) return e
  console.error(`[${correlationId}] unhandled error:`, e)
  return errors.internal()
}
