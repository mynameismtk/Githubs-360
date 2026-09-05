import 'server-only'
import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { ZodError, type ZodType } from 'zod'
import { getAnkuraActor, type AnkuraActor } from './session'
import { toSafeError, errors } from '@/lib/errors'
import { rateLimit, LIMITS } from '@/server/auth/rate-limit'

/**
 * Ankura's API wrapper — the same correlation-id → session → validation → rate-limit →
 * handler → error-mapping shape as src/server/api.ts, kept as its own small module so an
 * Ankura route can never accidentally import a Clinic 360 session type.
 */

export interface AnkuraApiContext<Body> {
  actor: AnkuraActor | null
  body: Body
  correlationId: string
  request: Request
}

interface RouteOptions<Body> {
  /** True requires a signed-in Ankura user; omit for public routes (OTP request/verify). */
  auth?: boolean
  body?: ZodType<Body>
  write?: boolean
}

export function withAnkuraApi<Body = undefined>(
  options: RouteOptions<Body>,
  handler: (ctx: AnkuraApiContext<Body>) => Promise<unknown>,
) {
  return async function route(request: Request): Promise<NextResponse> {
    const correlationId = request.headers.get('x-request-id') ?? randomUUID()

    try {
      const actor = await getAnkuraActor()
      if (options.auth && !actor) throw errors.unauthenticated()

      if (options.write && actor) {
        const limit = rateLimit(
          `ankura:write:${actor.sessionId}`,
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

function fromZod(error: ZodError) {
  const details: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    if (!details[key]) details[key] = issue.message
  }
  return errors.validation('Please check the details you entered.', details)
}
