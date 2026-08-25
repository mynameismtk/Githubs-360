import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { getDoctorByUserId, getDoctor } from '@/server/services/doctor-service'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/states'

export const dynamic = 'force-dynamic'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default async function SchedulePage() {
  const actor = await getActor()
  if (!actor) redirect('/login')
  if (actor.role !== 'DOCTOR') redirect('/console')

  const base = await getDoctorByUserId(actor.userId)
  const doctor = await getDoctor(base.clinicId, base.id)

  const byDay = new Map<number, typeof doctor.scheduleRules>()
  for (const rule of doctor.scheduleRules) {
    const list = byDay.get(rule.dayOfWeek) ?? []
    list.push(rule)
    byDay.set(rule.dayOfWeek, list)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-title text-ink">My schedule</h1>
        <p className="mt-1 text-body-sm text-ink-muted">
          {doctor.slotDurationMins}-minute slots · booking open {doctor.bookingHorizonDays} days ahead
        </p>
      </header>

      {doctor.scheduleRules.length === 0 ? (
        <EmptyState title="No clinics set up" body="Ask the clinic administrator to add your consulting hours." />
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-border">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => {
              const rules = byDay.get(day) ?? []
              return (
                <li key={day} className="flex items-start gap-4 px-4 py-3">
                  <span className="w-28 shrink-0 text-body-sm font-semibold text-ink">{DAYS[day]}</span>
                  {rules.length === 0 ? (
                    <span className="text-body-sm text-ink-subtle">No clinic</span>
                  ) : (
                    <ul className="space-y-1">
                      {rules.map((r, i) => (
                        <li key={i} className="text-body-sm text-ink tabular">
                          {r.startTime} – {r.endTime}
                          <span className="ml-2 text-caption font-normal text-ink-muted">
                            {r.location.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <Card>
        <p className="text-overline uppercase text-ink-muted">Arriving in the next release</p>
        <p className="mt-2 text-body-sm text-ink">
          Editing your own hours and marking leave ships with the operations release. Leave already
          affects patient booking — the availability engine honours schedule exceptions today.
        </p>
      </Card>
    </div>
  )
}
