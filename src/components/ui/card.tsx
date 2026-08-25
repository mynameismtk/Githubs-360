import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'

export function Card({
  className,
  children,
  padded = true,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return (
    <div
      {...rest}
      className={cn('rounded-lg border border-border bg-surface shadow-raised', padded && 'p-5', className)}
    >
      {children}
    </div>
  )
}

/**
 * A tappable card renders as a real anchor so it is keyboard-reachable, announced as a
 * link, and openable in a new tab — none of which a div with an onClick provides.
 */
export function CardLink({
  href,
  className,
  children,
  padded = true,
}: {
  href: string
  className?: string
  children: React.ReactNode
  padded?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'block rounded-lg border border-border bg-surface shadow-raised transition-colors duration-fast ease-smooth hover:border-border-strong hover:bg-surface-sunken/40',
        padded && 'p-5',
        className,
      )}
    >
      {children}
    </Link>
  )
}

export function SectionHeader({
  title,
  action,
  className,
}: {
  title: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-3 flex items-baseline justify-between gap-3', className)}>
      <h2 className="text-overline uppercase text-ink-muted">{title}</h2>
      {action}
    </div>
  )
}
