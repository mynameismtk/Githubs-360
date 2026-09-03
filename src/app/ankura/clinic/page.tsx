import { getAnkuraActor } from '@/server/ankura/session'
import {
  getClinicById,
  getClinicStats,
  listAnnouncements,
  listProtocolTemplates,
} from '@/server/ankura/services/clinic-service'
import { AnkuraCard, AnkuraSectionTitle } from '@/components/ankura/ui/card'
import { AnnouncementsManager } from './announcements-manager'
import { ProtocolTemplatesManager } from './protocol-templates-manager'

const STAGE_LABEL: Record<string, string> = {
  STIMULATION: 'Stimulation',
  RETRIEVAL: 'Retrieval',
  TRANSFER: 'Transfer',
  TWO_WEEK_WAIT: 'Two-week wait',
  BETA_RESULT: 'Beta result',
  PREGNANT: 'Pregnant',
  NOT_PREGNANT: 'Between cycles',
  PAUSED: 'Paused',
}

export default async function AnkuraClinicDashboard() {
  const actor = await getAnkuraActor()
  const clinicId = actor!.clinicId!
  const [clinic, stats, announcements, templates] = await Promise.all([
    getClinicById(clinicId),
    getClinicStats(clinicId),
    listAnnouncements(clinicId),
    listProtocolTemplates(clinicId),
  ])

  return (
    <div className="space-y-8">
      <section>
        <AnkuraSectionTitle eyebrow="White-label preview" title={clinic.name} />
        <AnkuraCard className="flex items-center gap-4">
          <div className="flex gap-2">
            <span className="h-10 w-10 rounded-full border border-a-border" style={{ background: clinic.brandPrimary }} />
            <span className="h-10 w-10 rounded-full border border-a-border" style={{ background: clinic.brandAccent }} />
          </div>
          <div>
            <p className="text-body-sm text-a-ink">{clinic.tagline ?? 'Patients see your name and colours throughout their app.'}</p>
            <p className="text-caption text-a-ink-subtle">{clinic.city}</p>
          </div>
        </AnkuraCard>
      </section>

      <section>
        <AnkuraSectionTitle eyebrow="Aggregate only — never individual without consent" title="Engagement" />
        <div className="grid grid-cols-3 gap-3">
          <AnkuraCard className="text-center">
            <p className="font-a-serif text-2xl text-a-ink tabular">{stats.patientCount}</p>
            <p className="text-caption text-a-ink-muted">Patients</p>
          </AnkuraCard>
          <AnkuraCard className="text-center">
            <p className="font-a-serif text-2xl text-a-ink tabular">{stats.activeReminderCount}</p>
            <p className="text-caption text-a-ink-muted">Active reminders</p>
          </AnkuraCard>
          <AnkuraCard className="text-center">
            <p className="font-a-serif text-2xl text-a-ink tabular">{stats.journeyEngagedCount}</p>
            <p className="text-caption text-a-ink-muted">Onboarded</p>
          </AnkuraCard>
        </div>
        {stats.byStage.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.byStage.map((s) => (
              <span key={s.cycleStage} className="rounded-full bg-a-surface-sunken px-3 py-1 text-caption text-a-ink-muted">
                {STAGE_LABEL[s.cycleStage ?? ''] ?? s.cycleStage} · {s._count}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <section>
        <AnkuraSectionTitle eyebrow="Broadcast" title="Announcements" />
        <AnnouncementsManager initialAnnouncements={announcements.map((a) => ({ ...a, publishedAt: a.publishedAt.toISOString() }))} />
      </section>

      <section>
        <AnkuraSectionTitle eyebrow="Suggested starting points" title="Protocol templates" />
        <p className="mb-3 -mt-2 text-caption text-a-ink-muted">
          Patients see these as suggestions only — their own prescription always wins.
        </p>
        <ProtocolTemplatesManager initialTemplates={templates as unknown as TemplateRow[]} />
      </section>
    </div>
  )
}

interface TemplateRow {
  id: string
  name: string
  items: Array<{ drugName: string; dose: string; route: string; timeOfDay: string; isTrigger: boolean }>
}
