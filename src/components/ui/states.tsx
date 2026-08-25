import * as React from 'react'
import { Button, LinkButton } from './button'
import { cn } from '@/lib/cn'

/**
 * The four states every screen must have (§31, §32). Making them components rather than
 * a convention is what stops them being skipped under deadline pressure.
 */

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  body?: string
  action?: { label: string; href: string }
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center rounded-lg border border-dashed border-border bg-surface/60 px-6 py-10 text-center', className)}>
      {icon ? <div className="mb-3 text-ink-subtle">{icon}</div> : null}
      <p className="text-subheading text-ink">{title}</p>
      {body ? <p className="mt-1 max-w-xs text-body-sm text-ink-muted">{body}</p> : null}
      {action ? (
        <LinkButton href={action.href} size="md" className="mt-5">
          {action.label}
        </LinkButton>
      ) : null}
    </div>
  )
}

/**
 * Errors shown to patients never carry a status code, a stack trace or a provider
 * message. They say what failed in plain language and offer two ways forward, one of
 * which is always a human being. docs/06 §4.
 */
export function ErrorState({
  title = 'Something went wrong',
  body,
  onRetry,
  clinicPhone,
  className,
}: {
  title?: string
  body?: string
  onRetry?: () => void
  clinicPhone?: string
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn('rounded-lg border border-[var(--critical)]/25 bg-[var(--critical-wash)] px-5 py-6 text-center', className)}
    >
      <p className="text-subheading text-ink">{title}</p>
      {body ? <p className="mt-1 text-body-sm text-ink-muted">{body}</p> : null}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        {clinicPhone ? (
          <a
            href={`tel:${clinicPhone}`}
            className="inline-flex h-9 items-center rounded-md border border-border-strong bg-surface px-3 text-body-sm font-semibold text-ink"
          >
            Contact clinic
          </a>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Skeletons are shaped like the content they replace, so nothing reflows when data
 * arrives. A full-page spinner is never used on a patient screen.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('relative overflow-hidden rounded-md bg-surface-sunken shimmer', className)}
    />
  )
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-5 w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="mt-2.5 h-3.5" />
      ))}
    </div>
  )
}

/** Announced politely so a screen reader hears the confirmation without interrupting. */
export function SuccessNote({ title, body }: { title: string; body?: string }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-[var(--positive)]/25 bg-[var(--positive-wash)] px-4 py-3"
    >
      <p className="text-subheading text-[var(--positive)]">{title}</p>
      {body ? <p className="mt-0.5 text-body-sm text-ink-muted">{body}</p> : null}
    </div>
  )
}
