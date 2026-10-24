import * as React from 'react'
import { cn } from '@/lib/cn'

export type Tone = 'neutral' | 'brand' | 'positive' | 'caution' | 'critical' | 'accent'

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-ink-muted border-border',
  brand: 'bg-brand-wash text-brand-ink border-transparent',
  positive: 'bg-[var(--positive-wash)] text-[var(--positive)] border-transparent',
  caution: 'bg-[var(--caution-wash)] text-[var(--caution)] border-transparent',
  critical: 'bg-[var(--critical-wash)] text-[var(--critical)] border-transparent',
  accent: 'bg-accent-wash text-ink border-transparent',
}

/**
 * Status is never communicated by colour alone (§24). A badge always renders its label
 * as text, and callers pass an icon for anything clinically meaningful — so the meaning
 * survives colour-blindness, greyscale printing and a low-quality screen.
 */
export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: Tone
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-caption font-semibold',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

export function Dot({ tone = 'neutral', className }: { tone?: Tone; className?: string }) {
  const color: Record<Tone, string> = {
    neutral: 'bg-ink-subtle',
    brand: 'bg-brand',
    positive: 'bg-[var(--positive)]',
    caution: 'bg-[var(--caution)]',
    critical: 'bg-[var(--critical)]',
    accent: 'bg-accent',
  }
  return <span aria-hidden className={cn('inline-block h-2 w-2 rounded-full', color[tone], className)} />
}
