import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'emergency'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-hover disabled:bg-brand/50',
  secondary: 'bg-surface text-ink border border-border-strong hover:bg-surface-sunken',
  ghost: 'bg-transparent text-brand-ink hover:bg-brand-wash',
  danger: 'bg-critical text-white hover:opacity-90',
  emergency: 'bg-[var(--emergency)] text-white hover:opacity-90',
}

// Patient-facing sizes are deliberately large: md is 44px, the accessibility floor for a
// touch target, and lg is 52px for primary actions. docs/06 §6.
const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-body-sm gap-1.5',
  md: 'h-11 px-4 text-body gap-2',
  lg: 'h-[52px] px-5 text-body gap-2',
}

const BASE =
  'inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-fast ease-smooth select-none disabled:cursor-not-allowed disabled:opacity-60'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
    >
      {/* The spinner replaces the label in place, so the button keeps its width and the
          surrounding layout never shifts while a request is in flight. */}
      {loading ? <Spinner /> : children}
    </button>
  )
}

export function LinkButton({
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
    <Link
      href={href}
      {...rest}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
    >
      {children}
    </Link>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
