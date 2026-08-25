import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { getClinic } from '@/server/services/clinic-service'
import { db } from '@/server/db'
import { Card, SectionHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/states'
import { IconMessage, IconPhone } from '@/components/ui/icons'
import { formatDate } from '@/lib/dates'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')

  const [clinic, announcements] = await Promise.all([
    getClinic(),
    db.announcement.findMany({
      where: {
        clinicId: actor.clinicId,
        publishedAt: { not: null, lte: new Date() },
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: 20,
    }),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-title text-ink">Messages</h1>

      <section>
        <SectionHeader title="Talk to the clinic" />
        {/*
          Secure messaging and the AI assistant are Phase 3/4. Saying so and giving the
          patient a phone number is better than an inbox that nobody is reading.
        */}
        <Card>
          <p className="text-body text-ink">
            Secure messaging with the clinic is coming soon. For now, the fastest way to reach us is
            by phone — we&apos;re happy to help with appointments, reports and bills.
          </p>
          <a
            href={`tel:${clinic.supportPhone}`}
            className="mt-4 flex h-11 items-center justify-center gap-2 rounded-md bg-brand font-semibold text-white"
          >
            <IconPhone size={18} />
            Call {clinic.name}
          </a>
        </Card>
      </section>

      <section>
        <SectionHeader title="Clinic announcements" />
        {announcements.length === 0 ? (
          <EmptyState
            icon={<IconMessage size={28} />}
            title="Nothing new right now"
            body="Clinic announcements will appear here."
          />
        ) : (
          <ul className="space-y-2.5">
            {announcements.map((a) => (
              <li key={a.id}>
                <Card>
                  <p className="text-subheading text-ink">{a.title}</p>
                  <p className="mt-1 text-body-sm text-ink-muted">{a.body}</p>
                  {a.publishedAt ? (
                    <p className="mt-2 text-caption text-ink-subtle tabular">{formatDate(a.publishedAt)}</p>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
