import Link from 'next/link'
import { getAnkuraActor } from '@/server/ankura/session'
import { listJourneyDays } from '@/server/ankura/services/journey-service'
import { AnkuraCard, AnkuraSectionTitle } from '@/components/ankura/ui/card'
import { AnkuraJourneyArt } from '@/components/ankura/ui/illustrations'
import { IconChevronRight, IconWallet, IconBook } from '@/components/ankura/ui/icons'
import { TodayDosesCard } from '@/components/ankura/today-doses-card'

const STAGE_LABEL: Record<string, string> = {
  STIMULATION: 'stimulation',
  RETRIEVAL: 'around retrieval',
  TRANSFER: 'around transfer',
  TWO_WEEK_WAIT: 'the two-week wait',
  BETA_RESULT: 'waiting on your beta result',
  PREGNANT: 'early pregnancy',
  NOT_PREGNANT: 'between cycles',
  PAUSED: 'a pause',
}

export default async function AnkuraHomePage() {
  const actor = await getAnkuraActor()
  const firstName = actor?.fullName?.split(' ')[0] || 'there'
  const days = await listJourneyDays()
  const phaseForStage: Partial<Record<string, string>> = {
    STIMULATION: 'STIMULATION',
    RETRIEVAL: 'RETRIEVAL',
    TRANSFER: 'TRANSFER',
    TWO_WEEK_WAIT: 'TWO_WEEK_WAIT',
    BETA_RESULT: 'BETA_DAY',
  }
  const targetPhase = actor?.cycleStage ? phaseForStage[actor.cycleStage] : undefined
  const featured = days.find((d) => d.phase === targetPhase) ?? days[0]

  return (
    <div className="space-y-7">
      <div>
        <p className="text-body-sm text-a-ink-muted">
          {actor?.cycleStage ? `You're in ${STAGE_LABEL[actor.cycleStage] ?? 'your cycle'}.` : 'Good to see you.'}
        </p>
        <h1 className="font-a-serif text-2xl text-a-ink">Hi {firstName} 🌱</h1>
      </div>

      <section>
        <AnkuraSectionTitle
          eyebrow="Today"
          title="Your meds"
          action={
            <Link href="/ankura/reminders" className="flex items-center gap-0.5 text-body-sm font-semibold text-a-brand-ink">
              All reminders <IconChevronRight size={16} />
            </Link>
          }
        />
        <TodayDosesCard compact />
      </section>

      {featured ? (
        <section>
          <AnkuraSectionTitle eyebrow="Your journey" title="What's happening today" />
          <Link href={`/ankura/journey/${featured.slug}`}>
            <AnkuraCard interactive className="flex items-center gap-4">
              <AnkuraJourneyArt illustrationKey={featured.illustrationKey} size={64} />
              <div className="min-w-0 flex-1">
                <p className="text-caption font-semibold uppercase tracking-wide text-a-brand-ink">{featured.dayLabel}</p>
                <p className="font-a-serif text-lg text-a-ink">{featured.title}</p>
                <p className="mt-0.5 line-clamp-2 text-body-sm text-a-ink-muted">{featured.feelingsEn}</p>
              </div>
              <IconChevronRight size={20} className="shrink-0 text-a-ink-subtle" />
            </AnkuraCard>
          </Link>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-3">
        <Link href="/ankura/glossary">
          <AnkuraCard interactive className="flex h-full flex-col items-start gap-2">
            <IconBook size={22} className="text-a-brand-ink" />
            <p className="font-a-serif text-base text-a-ink">Jargon decoder</p>
            <p className="text-caption text-a-ink-muted">Any term, decoded gently</p>
          </AnkuraCard>
        </Link>
        <Link href="/ankura/costs">
          <AnkuraCard interactive className="flex h-full flex-col items-start gap-2">
            <IconWallet size={22} className="text-a-brand-ink" />
            <p className="font-a-serif text-base text-a-ink">Cost tracker</p>
            <p className="text-caption text-a-ink-muted">See where it's going</p>
          </AnkuraCard>
        </Link>
      </section>
    </div>
  )
}
