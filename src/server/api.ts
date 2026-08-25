import 'server-only'
import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { ZodError, type ZodType } from 'zod'
import { getActor, type SessionActor } from './auth/session'
import { toSafeError, errors } from '@/lib/errors'
import { rateLimit, LIMITS } from './auth/rate-limit'
import { audit } from './audit'
import type { Role } from '@prisma/client'

/**
 * The API wrapper (docs/05 §4).
 *
 * Composes correlation id → session → role check → validation → rate limit → handler →
 * audit → error mapping. Handlers therefore contain only the interesting part, and none
 * of them can forget a cross-cutting concern by omission.
 */

export interface ApiContext<Body> {
  actor: SessionActor | null
  body: Body
  correlationId: string
  request: Request
}

interface RouteOptions<Body> {
  /** Roles permitted to call this route. Omit for public routes (auth only). */
  roles?: Role[]
  /** Zod schema for the JSON body. The handler receives parsed, typed data or nothing. */
  body?: ZodType<Body>
  /** Counts against the per-session write budget. */
  write?: boolean
  /** Written after a successful response, and on a denied authorization. */
  auditAction?: string
}

export function withApi<Body = undefined>(
  options: RouteOptions<Body>,
  handler: (ctx: ApiContext<Body>) => Promise<unknown>,
) {
  return async function route(request: Request): Promise<NextResponse> {
    const correlationId = request.headers.get('x-request-id') ?? randomUUID()

    try {
      const actor = await getActor()

      if (options.roles) {
        if (!actor) throw errors.unauthenticated()
        if (!options.roles.includes(actor.role)) {
          // A denied authorization is one of the most interesting things to log.
          await audit({
            clinicId: actor.clinicId,
            actorId: actor.userId,
            actorRole: actor.role,
            actorName: actor.fullName,
            action: options.auditAction ? `${options.auditAction}.denied` : 'api.forbidden',
            severity: 'HIGH',
            metadata: { path: new URL(request.url).pathname },
          })
          throw errors.forbidden()
        }
      }

      if (options.write && actor) {
        const limit = rateLimit(
          `write:${actor.sessionId}`,
          LIMITS.writePerSession.limit,
          LIMITS.writePerSession.windowSeconds,
        )
        if (!limit.allowed) throw errors.rateLimited()
      }

      let body = undefined as Body
      if (options.body) {
        const json = await request.json().catch(() => {
          throw errors.validation('We could not read that request.')
        })
        const parsed = options.body.safeParse(json)
        if (!parsed.success) throw fromZod(parsed.error)
        body = parsed.data
      }

      const data = await handler({ actor, body, correlationId, request })
      return NextResponse.json({ data }, { headers: { 'x-request-id': correlationId } })
    } catch (e) {
      const error = toSafeError(e, correlationId)
      return NextResponse.json(
        { error: { code: error.code, message: error.message, details: error.details ?? {} } },
        { status: error.status, headers: { 'x-request-id': correlationId } },
      )
    }
  }
}

/** Turns Zod's field errors into something a form can render inline. */
function fromZod(error: ZodError) {
  const details: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    if (!details[key]) details[key] = issue.message
  }
  return errors.validation('Please check the details you entered.', details)
}
