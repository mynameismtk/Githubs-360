import * as React from 'react'
import { cn } from '@/lib/cn'

export function AnkuraCard({
  className,
  interactive = false,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      {...rest}
      className={cn(
        'rounded-2xl border border-a-border bg-a-surface p-5 shadow-a-raised',
        interactive && 'transition-transform duration-slow ease-smooth active:scale-[0.99]',
        className,
      )}
    />
  )
}

export function AnkuraSectionTitle({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string
  title: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-3', className)}>
      <div>
        {eyebrow ? (
          <p className="mb-0.5 text-overline uppercase tracking-[0.08em] text-a-brand-ink">{eyebrow}</p>
        ) : null}
        <h2 className="font-a-serif text-[1.375rem] leading-snug text-a-ink">{title}</h2>
      </div>
      {action}
    </div>
  )
}
