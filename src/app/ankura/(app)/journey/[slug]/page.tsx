import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getJourneyDay, listJourneyDays } from '@/server/ankura/services/journey-service'
import { isAppError } from '@/lib/errors'
import { AnkuraCard } from '@/components/ankura/ui/card'
import { AnkuraJourneyArt, AnkuraBackdropBlobs } from '@/components/ankura/ui/illustrations'
import { IconArrowLeft, IconChevronRight, IconHeart } from '@/components/ankura/ui/icons'

export default async function AnkuraJourneyDayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const day = await getJourneyDay(slug).catch((e) => {
    if (isAppError(e) && e.code === 'NOT_FOUND') return null
    throw e
  })
  if (!day) notFound()

  const all = await listJourneyDays()
  const index = all.findIndex((d) => d.slug === slug)
  const prev = index > 0 ? all[index - 1] : null
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null

  return (
    <div className="space-y-6">
      <Link href="/ankura/journey" className="inline-flex items-center gap-1 text-body-sm font-semibold text-a-brand-ink">
        <IconArrowLeft size={16} /> Your journey
      </Link>

      <div className="relative flex flex-col items-center py-2 text-center">
        <div className="relative mb-3 h-28 w-28">
          <AnkuraBackdropBlobs />
          <div className="relative flex h-full items-center justify-center">
            <AnkuraJourneyArt illustrationKey={day.illustrationKey} size={110} />
          </div>
        </div>
        <p className="text-overline uppercase tracking-[0.1em] text-a-brand-ink">{day.dayLabel}</p>
        <h1 className="mt-1 font-a-serif text-2xl italic text-a-ink">{day.title}</h1>
      </div>

      <AnkuraCard>
        <p className="whitespace-pre-line text-body leading-relaxed text-a-ink">{day.bodyEn}</p>
      </AnkuraCard>

      <AnkuraCard className="bg-a-rose-wash/50">
        <div className="mb-2 flex items-center gap-2 text-a-rose">
          <IconHeart size={18} />
          <p className="text-body-sm font-semibold text-a-ink">What you might be feeling</p>
        </div>
        <p className="text-body-sm leading-relaxed text-a-ink-muted">{day.feelingsEn}</p>
      </AnkuraCard>

      <div className="flex items-center justify-between gap-3 pt-2">
        {prev ? (
          <Link href={`/ankura/journey/${prev.slug}`} className="flex-1 rounded-xl border border-a-border px-3.5 py-2.5 text-caption text-a-ink-muted">
            <span className="mb-0.5 block text-a-ink-subtle">← Previous</span>
            {prev.dayLabel}
          </Link>
        ) : <div className="flex-1" />}
        {next ? (
          <Link href={`/ankura/journey/${next.slug}`} className="flex flex-1 items-center justify-between rounded-xl bg-a-brand-wash px-3.5 py-2.5 text-caption text-a-brand-ink">
            <span>
              <span className="mb-0.5 block text-a-brand-ink/70">Next →</span>
              {next.dayLabel}
            </span>
            <IconChevronRight size={16} />
          </Link>
        ) : <div className="flex-1" />}
      </div>
    </div>
  )
}
