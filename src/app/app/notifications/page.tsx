import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/session'
import { listNotifications } from '@/server/services/notification-service'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/states'
import { IconBell, IconChevronLeft } from '@/components/ui/icons'
import { formatDateTime } from '@/lib/dates'
import { cn } from '@/lib/cn'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const actor = await getActor()
  if (!actor) redirect('/login')

  const notifications = await listNotifications(actor.userId, 40)

  return (
    <div className="space-y-5">
      <Link
        href="/app"
        className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full pl-1 pr-3 text-body-sm font-semibold text-ink-muted"
      >
        <IconChevronLeft size={18} />
        Home
      </Link>

      <h1 className="text-title text-ink">Notifications</h1>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<IconBell size={28} />}
          title="Nothing to catch up on"
          body="Reminders about appointments, reports and follow-ups will appear here."
        />
      ) : (
        <ul className="space-y-2.5">
          {notifications.map((n) => {
            const content = (
              <Card className={cn(!n.readAt && 'border-brand/30 bg-brand-wash/40')}>
                <div className="flex items-start gap-2.5">
                  {!n.readAt ? (
                    <span aria-label="Unread" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  ) : (
                    <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-ink">{n.title}</p>
                    <p className="mt-0.5 text-body-sm text-ink-muted">{n.body}</p>
                    <p className="mt-1.5 text-caption text-ink-subtle tabular">
                      {formatDateTime(n.sentAt ?? n.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            )
            return (
              <li key={n.id}>
                {n.actionUrl ? <Link href={n.actionUrl}>{content}</Link> : content}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
