import Link from 'next/link'
import { listJourneyDays } from '@/server/ankura/services/journey-service'
import { AnkuraCard, AnkuraSectionTitle } from '@/components/ankura/ui/card'
import { AnkuraJourneyArt } from '@/components/ankura/ui/illustrations'
import { AnkuraEmptyState } from '@/components/ankura/ui/states'
import { IconSprout, IconChevronRight } from '@/components/ankura/ui/icons'
import { GradeDecoderTool } from '@/components/ankura/grade-decoder-tool'

const PHASE_LABEL: Record<string, string> = {
  STIMULATION: 'Stimulation',
  RETRIEVAL: 'Retrieval',
  FERTILIZATION: 'Fertilisation',
  CLEAVAGE: 'Cleavage stage',
  MORULA: 'Morula',
  BLASTOCYST: 'Blastocyst',
  TRANSFER: 'Transfer',
  TWO_WEEK_WAIT: 'The two-week wait',
  BETA_DAY: 'Beta day',
}

export default async function AnkuraJourneyPage() {
  const days = await listJourneyDays()
  const grouped = new Map<string, typeof days>()
  for (const day of days) {
    const list = grouped.get(day.phase) ?? []
    list.push(day)
    grouped.set(day.phase, list)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-a-serif text-2xl text-a-ink">Your journey</h1>
        <p className="text-body-sm text-a-ink-muted">Stimulation, through to the wait for your beta result — day by day.</p>
      </div>

      {days.length === 0 ? (
        <AnkuraEmptyState icon={<IconSprout size={28} />} title="Content is on its way" body="Check back soon." />
      ) : (
        Array.from(grouped.entries()).map(([phase, entries]) => (
          <section key={phase}>
            <AnkuraSectionTitle title={PHASE_LABEL[phase] ?? phase} />
            <div className="space-y-2.5">
              {entries.map((day) => (
                <Link key={day.id} href={`/ankura/journey/${day.slug}`}>
                  <AnkuraCard interactive className="flex items-center gap-3.5">
                    <AnkuraJourneyArt illustrationKey={day.illustrationKey} size={52} />
                    <div className="min-w-0 flex-1">
                      <p className="text-caption font-semibold uppercase tracking-wide text-a-brand-ink">{day.dayLabel}</p>
                      <p className="font-a-serif text-base text-a-ink">{day.title}</p>
                    </div>
                    <IconChevronRight size={18} className="shrink-0 text-a-ink-subtle" />
                  </AnkuraCard>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}

      <section>
        <AnkuraSectionTitle eyebrow="Tool" title="Grading decoder" />
        <GradeDecoderTool />
      </section>
    </div>
  )
}
