import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-a-brand text-a-ink-inverse hover:bg-a-brand-hover active:bg-a-brand-hover disabled:opacity-50',
  secondary: 'bg-a-surface text-a-ink border border-a-border-strong hover:bg-a-surface-sunken',
  ghost: 'bg-transparent text-a-brand-ink hover:bg-a-brand-wash',
  danger: 'bg-a-critical text-a-ink-inverse hover:opacity-90',
  accent: 'bg-a-accent text-a-ink-inverse hover:bg-a-accent-hover',
}

// Touch targets follow the same accessibility floor as Clinic 360 (docs/06 §6): md is
// 44px, lg is 52px for primary actions — this matters more here, not less, given how
// often this app is used one-handed, post-procedure, at 2am.
const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-body-sm gap-1.5',
  md: 'h-11 px-4 text-body gap-2',
  lg: 'h-[52px] px-5 text-body gap-2',
}

const BASE =
  'inline-flex items-center justify-center rounded-full font-semibold font-a-sans transition-colors duration-slow ease-smooth select-none disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:shadow-a-focus'

export interface AnkuraButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

export function AnkuraButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...rest
}: AnkuraButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
    >
      {loading ? <AnkuraSpinner /> : children}
    </button>
  )
}

export function AnkuraLinkButton({
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...rest
}: {
  href: string
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'className'>) {
  return (
    <Link href={href} {...rest} className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}>
      {children}
    </Link>
  )
}

export function AnkuraSpinner({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4 animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
