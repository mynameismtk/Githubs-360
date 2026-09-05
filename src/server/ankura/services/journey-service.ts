import 'server-only'
import { db } from '@/server/db'
import { errors } from '@/lib/errors'

/**
 * Day-by-day embryo journey (brief §3.2) — data-driven content, editable without a
 * redeploy. Only reviewed content is ever shown to a patient; see AnkuraJourneyDay.isReviewed.
 */

export async function listJourneyDays() {
  return db.ankuraJourneyDay.findMany({
    where: { isReviewed: true },
    orderBy: { displayOrder: 'asc' },
  })
}

export async function getJourneyDay(slug: string) {
  const day = await db.ankuraJourneyDay.findUnique({ where: { slug } })
  if (!day || !day.isReviewed) throw errors.notFound("We couldn't find that day.")
  return day
}
