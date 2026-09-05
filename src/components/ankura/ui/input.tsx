import * as React from 'react'
import { cn } from '@/lib/cn'

// Never below 16px — the smallest size that doesn't trigger iOS zoom-on-focus and stays
// comfortable for anyone reading through fatigue at 2am. docs/06 §6 makes the same call
// for Clinic 360's patient surfaces; it matters at least as much here.
const FIELD_BASE =
  'w-full rounded-xl border border-a-border-strong bg-a-surface px-3.5 text-body text-a-ink placeholder:text-a-ink-subtle transition-colors duration-fast focus:border-a-brand focus:outline-none focus-visible:shadow-a-focus disabled:opacity-60'

export function AnkuraField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-body-sm font-semibold text-a-ink">
        {label}
        {required ? <span className="text-a-critical"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-caption font-medium text-a-critical">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-caption text-a-ink-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export const AnkuraInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function AnkuraInput({ className, invalid, ...rest }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(FIELD_BASE, 'h-11', invalid && 'border-a-critical', className)}
        {...rest}
      />
    )
  },
)

export function AnkuraTextarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD_BASE, 'min-h-[96px] resize-y py-2.5', className)} {...rest} />
}

export function AnkuraSelect({ className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(FIELD_BASE, 'h-11 appearance-none bg-[right_0.9rem_center] bg-no-repeat', className)} {...rest} />
}
