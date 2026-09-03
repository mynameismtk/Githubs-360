'use client'
import { useRef, useEffect } from 'react'
import { cn } from '@/lib/cn'

/** One real input with autocomplete="one-time-code" for SMS autofill; boxes are painted
 *  over it. Same approach as Clinic 360's login form, reimplemented here so Ankura never
 *  imports a Clinic 360 client component. */
export function AnkuraOtpInput({
  value,
  onChange,
  onComplete,
  invalid,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  onComplete: (v: string) => void
  invalid?: boolean
  disabled?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  const submitted = useRef<string | null>(null)

  useEffect(() => {
    if (value.length === 6 && submitted.current !== value) {
      submitted.current = value
      onComplete(value)
    }
    if (value.length < 6) submitted.current = null
  }, [value, onComplete])

  return (
    <div className="relative">
      <label htmlFor="ankura-otp" className="sr-only">
        6-digit verification code
      </label>
      <input
        ref={ref}
        id="ankura-otp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        autoFocus
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        aria-invalid={invalid || undefined}
        className="absolute inset-0 h-14 w-full opacity-0"
      />
      <div aria-hidden className="flex gap-2" onClick={() => ref.current?.focus()}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex h-14 flex-1 items-center justify-center rounded-xl border bg-a-surface font-a-serif text-xl tabular transition-colors duration-fast',
              invalid ? 'border-a-critical' : value.length === i ? 'border-a-brand ring-2 ring-a-brand/20' : 'border-a-border-strong',
            )}
          >
            {value[i] ?? ''}
          </div>
        ))}
      </div>
    </div>
  )
}
