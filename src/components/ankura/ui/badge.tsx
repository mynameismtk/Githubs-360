import * as React from 'react'
import { cn } from '@/lib/cn'

type Tone = 'brand' | 'accent' | 'rose' | 'positive' | 'caution' | 'critical' | 'neutral'

const TONES: Record<Tone, string> = {
  brand: 'bg-a-brand-wash text-a-brand-ink',
  accent: 'bg-a-accent-wash text-[color-mix(in_srgb,var(--a-accent)_75%,black)]',
  rose: 'bg-a-rose-wash text-[color-mix(in_srgb,var(--a-rose)_65%,black)]',
  positive: 'bg-a-positive-wash text-a-positive',
  caution: 'bg-a-caution-wash text-a-caution',
  critical: 'bg-a-critical-wash text-a-critical',
  neutral: 'bg-a-surface-sunken text-a-ink-muted',
}

export function AnkuraBadge({
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
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-semibold',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
