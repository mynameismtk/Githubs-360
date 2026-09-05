import * as React from 'react'
import { cn } from '@/lib/cn'
import { AnkuraButton } from './button'

/** Skeletons shaped like the real content — never a bare spinner. Same reasoning as
 *  Clinic 360's docs/06 §4: "your reminder card is arriving" is calmer than "loading". */
export function AnkuraSkeleton({ className }: { className?: string }) {
  return <div className={cn('relative overflow-hidden rounded-xl bg-a-surface-sunken', className)}>
    <span className="shimmer absolute inset-0" />
  </div>
}

export function AnkuraEmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode
  title: string
  body?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-a-border-strong px-6 py-10 text-center">
      {icon ? <div className="text-a-brand-ink/60">{icon}</div> : null}
      <div>
        <p className="font-a-serif text-lg text-a-ink">{title}</p>
        {body ? <p className="mt-1 text-body-sm text-a-ink-muted">{body}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function AnkuraErrorState({ title = "That didn't load", onRetry }: { title?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-a-border bg-a-surface px-6 py-10 text-center">
      <p className="font-a-serif text-lg text-a-ink">{title}</p>
      <p className="text-body-sm text-a-ink-muted">Please try again — your information is safe.</p>
      {onRetry ? (
        <AnkuraButton variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </AnkuraButton>
      ) : null}
    </div>
  )
}
