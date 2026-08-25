import { NextResponse } from 'next/server'
import { getActor } from '@/server/auth/session'
import { searchClinicPatients } from '@/server/services/patient-service'
import { rateLimit, LIMITS } from '@/server/auth/rate-limit'
import { errors, toSafeError } from '@/lib/errors'
import { randomUUID } from 'node:crypto'

/** Staff patient search. Clinic-scoped, rate-limited, and audited by the service. */
export async function GET(request: Request) {
  const correlationId = randomUUID()
  try {
    const actor = await getActor()
    if (!actor) throw errors.unauthenticated()
    if (actor.role === 'PATIENT') throw errors.forbidden()

    const limit = rateLimit(
      `search:${actor.sessionId}`,
      LIMITS.searchPerSession.limit,
      LIMITS.searchPerSession.windowSeconds,
    )
    if (!limit.allowed) throw errors.rateLimited()

    const q = new URL(request.url).searchParams.get('q') ?? ''
    const results = await searchClinicPatients(actor, q)
    return NextResponse.json({
      data: results.map((p) => ({
        id: p.id,
        fullName: p.fullName,
        mrn: p.mrn,
        dateOfBirth: p.dateOfBirth.toISOString(),
        gender: p.gender,
        phone: p.phone,
      })),
    })
  } catch (e) {
    const error = toSafeError(e, correlationId)
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status })
  }
}
