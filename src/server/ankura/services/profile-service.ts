import 'server-only'
import { db } from '@/server/db'
import { errors } from '@/lib/errors'
import type { AnkuraCycleStage, AnkuraCycleType } from '@prisma/client'

export interface OnboardingInput {
  fullName: string
  cycleType: AnkuraCycleType
  cycleStage: AnkuraCycleStage
  cycleStartedAt?: string | null
  clinicSlug?: string | null
  locale?: string
}

export async function completeOnboarding(userId: string, input: OnboardingInput) {
  const clinic = input.clinicSlug
    ? await db.ankuraClinic.findUnique({ where: { slug: input.clinicSlug }, select: { id: true } })
    : null

  return db.ankuraUser.update({
    where: { id: userId },
    data: {
      fullName: input.fullName.trim(),
      cycleType: input.cycleType,
      cycleStage: input.cycleStage,
      cycleStartedAt: input.cycleStartedAt ? new Date(input.cycleStartedAt) : null,
      clinicId: clinic?.id ?? null,
      locale: input.locale ?? 'en',
      onboardedAt: new Date(),
    },
  })
}

export async function updateCycleStage(userId: string, cycleStage: AnkuraCycleStage) {
  return db.ankuraUser.update({ where: { id: userId }, data: { cycleStage } })
}

export async function getProfile(userId: string) {
  const user = await db.ankuraUser.findUnique({
    where: { id: userId },
    include: { clinic: { select: { name: true, brandPrimary: true, brandAccent: true, logoUrl: true } } },
  })
  if (!user) throw errors.notFound('We could not find your profile.')
  return user
}
