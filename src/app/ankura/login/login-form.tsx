'use client'

import { useState, useEffect } from 'react'
import { AnkuraButton } from '@/components/ankura/ui/button'
import { AnkuraField, AnkuraInput } from '@/components/ankura/ui/input'
import { AnkuraOtpInput } from '@/components/ankura/ui/otp-input'

type Step = 'phone' | 'code'

export function AnkuraLoginForm() {
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
      const res = await fetch('/api/ankura/auth/request-otp', {
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
      setError('We could not reach Ankura. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  async function verify(submitted: string) {
    setError(null)
    setPending(true)
    try {
      const res = await fetch('/api/ankura/auth/verify-otp', {
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
      window.location.href = json.data.redirectTo
    } catch {
      setError('We could not reach Ankura. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  if (step === 'phone') {
    return (
      <form onSubmit={requestCode} className="space-y-5">
        <AnkuraField label="Mobile number" htmlFor="phone" hint="We'll send a 6-digit code by SMS." error={error ?? undefined} required>
          <div className="flex items-stretch gap-2">
            <span className="inline-flex h-11 items-center rounded-xl border border-a-border-strong bg-a-surface-sunken px-3 text-body font-medium text-a-ink-muted">
              +91
            </span>
            <AnkuraInput
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
        </AnkuraField>
        <AnkuraButton type="submit" size="lg" fullWidth loading={pending} disabled={phone.replace(/\D/g, '').length < 10}>
          Send code
        </AnkuraButton>
        <p className="text-center text-caption text-a-ink-subtle">
          New here? Entering your number for the first time creates your account.
        </p>
      </form>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-body text-a-ink">
          Enter the code we sent to <span className="font-semibold tabular">{maskedPhone}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setStep('phone')
            setError(null)
          }}
          className="mt-1 text-body-sm font-semibold text-a-brand-ink"
        >
          Use a different number
        </button>
      </div>

      <AnkuraOtpInput value={code} onChange={setCode} onComplete={verify} invalid={Boolean(error)} disabled={pending} />

      {error ? (
        <p role="alert" className="text-caption font-medium text-a-critical">
          {error}
        </p>
      ) : null}

      {devCode ? (
        <div className="rounded-xl border border-dashed border-a-caution/50 bg-a-caution-wash px-3 py-2.5">
          <p className="text-caption text-a-ink-muted">
            Development mode — no SMS gateway is configured. Your code is{' '}
            <span className="font-bold tabular text-a-ink">{devCode}</span>
          </p>
        </div>
      ) : null}

      <AnkuraButton size="lg" fullWidth loading={pending} disabled={code.length !== 6} onClick={() => verify(code)}>
        Verify and continue
      </AnkuraButton>

      <div className="text-center">
        {secondsLeft > 0 ? (
          <p className="text-caption text-a-ink-subtle tabular">
            Resend available in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
          </p>
        ) : (
          <button type="button" onClick={() => requestCode()} className="text-body-sm font-semibold text-a-brand-ink">
            Send a new code
          </button>
        )}
      </div>
    </div>
  )
}
