'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

/**
 * Labels are always visible. A placeholder is not a label — it disappears exactly when
 * the user needs it, and screen readers treat it inconsistently. docs/06 §3.
 */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  htmlFor,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  htmlFor: string
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-body-sm font-semibold text-ink">
        {label}
        {required ? <span className="ml-0.5 text-[var(--critical)]">*</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${htmlFor}-hint`} className="text-caption text-ink-muted">
          {hint}
        </p>
      ) : null}
      {/* Error text carries a glyph as well as colour, so it is not colour-only. */}
      {error ? (
        <p id={`${htmlFor}-error`} className="flex items-start gap-1 text-caption font-medium text-[var(--critical)]">
          <span aria-hidden>⚠</span>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}

const CONTROL =
  'w-full rounded-md border bg-surface px-3.5 text-body text-ink placeholder:text-ink-subtle transition-colors duration-fast disabled:bg-surface-sunken disabled:text-ink-muted'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, id, ...rest }, ref) {
    return (
      <input
        ref={ref}
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : `${id}-hint`}
        {...rest}
        className={cn(CONTROL, 'h-11', invalid ? 'border-[var(--critical)]' : 'border-border-strong', className)}
      />
    )
  },
)

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, id, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        id={id}
        aria-describedby={`${id}-hint`}
        {...rest}
        className={cn(CONTROL, 'min-h-[88px] border-border-strong py-2.5', className)}
      />
    )
  },
)

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, id, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        id={id}
        {...rest}
        className={cn(CONTROL, 'h-11 border-border-strong pr-9', className)}
      >
        {children}
      </select>
    )
  },
)
