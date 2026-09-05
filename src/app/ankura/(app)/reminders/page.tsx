import { AnkuraSectionTitle } from '@/components/ankura/ui/card'
import { TodayDosesCard } from '@/components/ankura/today-doses-card'
import { RemindersManager } from './reminders-manager'

export default function AnkuraRemindersPage() {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-a-serif text-2xl text-a-ink">Reminders</h1>
        <p className="text-body-sm text-a-ink-muted">Sourced from your own prescription — we never suggest a dose.</p>
      </div>

      <section>
        <AnkuraSectionTitle eyebrow="Today" title="Your schedule" />
        <TodayDosesCard />
      </section>

      <RemindersManager />
    </div>
  )
}
