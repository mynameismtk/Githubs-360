'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { cn } from '@/lib/cn'

type Step = 'phone' | 'code'

export function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [maskedPhone, setMaskedPhone] = useState('')
  const [devCode, setDevCode] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [secondsLeft])

  async function requestCode(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message ?? 'We could not send the code. Please try again.')
        return
      }
      setChallengeId(json.data.challengeId)
      setMaskedPhone(json.data.maskedPhone)
      setDevCode(json.data.devCode ?? null)
      setSecondsLeft(json.data.expiresInSeconds)
      setCode('')
      setStep('code')
    } catch {
      setError('We could not reach the clinic. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  async function verify(submitted: string) {
    setError(null)
    setPending(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ challengeId, code: submitted }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message ?? 'That code did not work. Please try again.')
        setCode('')
        return
      }
      // A full navigation rather than router.push: the session cookie was just set and
      // every subsequent render must see it.
      window.location.href = json.data.redirectTo
    } catch {
      setError('We could not reach the clinic. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  if (step === 'phone') {
    return (
      <form onSubmit={requestCode} className="space-y-5">
        <Field label="Mobile number" htmlFor="phone" hint="We will send a 6-digit code by SMS." error={error ?? undefined} required>
          <div className="flex items-stretch gap-2">
            <span className="inline-flex h-11 items-center rounded-md border border-border-strong bg-surface-sunken px-3 text-body font-medium text-ink-muted">
              +91
            </span>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              autoFocus
              placeholder="98765 43210"
              value={phone}
              invalid={Boolean(error)}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, '').slice(0, 11))}
              className="tabular"
            />
          </div>
        </Field>
        <Button type="submit" size="lg" fullWidth loading={pending} disabled={phone.replace(/\D/g, '').length < 10}>
          Send code
        </Button>
      </form>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-body text-ink">
          Enter the code we sent to <span className="font-semibold tabular">{maskedPhone}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setStep('phone')
            setError(null)
          }}
          className="mt-1 text-body-sm font-semibold text-brand-ink"
        >
          Use a different number
        </button>
      </div>

      <OtpInput value={code} onChange={setCode} onComplete={verify} invalid={Boolean(error)} disabled={pending} />

      {error ? (
        <p role="alert" className="flex items-start gap-1 text-caption font-medium text-[var(--critical)]">
          <span aria-hidden>⚠</span>
          <span>{error}</span>
        </p>
      ) : null}

      {/* Development affordance: the seed has no SMS gateway, so the code is surfaced
          here. The server only includes it outside production. */}
      {devCode ? (
        <div className="rounded-md border border-dashed border-[var(--caution)]/40 bg-[var(--caution-wash)] px-3 py-2.5">
          <p className="text-caption text-ink-muted">
            Development mode — no SMS gateway is configured. Your code is{' '}
            <span className="font-bold tabular text-ink">{devCode}</span>
          </p>
        </div>
      ) : null}

      <Button size="lg" fullWidth loading={pending} disabled={code.length !== 6} onClick={() => verify(code)}>
        Verify and continue
      </Button>

      <div className="text-center">
        {secondsLeft > 0 ? (
          <p className="text-caption text-ink-subtle tabular">
            Resend available in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
          </p>
        ) : (
          <button type="button" onClick={() => requestCode()} className="text-body-sm font-semibold text-brand-ink">
            Send a new code
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Six boxes backed by one input.
 *
 * A per-digit input array is the common approach and it fights the platform: paste
 * breaks, autofill breaks, and backspace behaviour has to be reimplemented. One real
 * input with `autocomplete="one-time-code"` gets iOS/Android SMS autofill for free, and
 * the boxes are painted over it.
 */
function OtpInput({
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
      <label htmlFor="otp" className="sr-only">
        6-digit verification code
      </label>
      <input
        ref={ref}
        id="otp"
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
              'flex h-14 flex-1 items-center justify-center rounded-md border bg-surface text-title tabular transition-colors duration-fast',
              invalid
                ? 'border-[var(--critical)]'
                : value.length === i
                  ? 'border-brand ring-2 ring-brand/20'
                  : 'border-border-strong',
            )}
          >
            {value[i] ?? ''}
          </div>
        ))}
      </div>
    </div>
  )
}
