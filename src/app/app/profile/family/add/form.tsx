'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Field, Input, Select } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { SuccessNote, ErrorState } from '@/components/ui/states'
import { IconChevronLeft, IconShield } from '@/components/ui/icons'

export function AddFamilyForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('FEMALE')
  const [relationship, setRelationship] = useState('CHILD')
  const [phone, setPhone] = useState('')
  const [pending, setPending] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState<{ name: string; mrn: string; requiresConfirmation: boolean } | null>(null)

  const isAdult =
    dateOfBirth !== '' && Date.now() - new Date(dateOfBirth).getTime() > 18 * 365.25 * 86_400_000

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setFieldErrors({})
    setFormError(null)
    try {
      const res = await fetch('/api/family', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName,
          dateOfBirth,
          gender,
          relationship,
          phone: phone.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.error?.details && Object.keys(json.error.details).length > 0) {
          setFieldErrors(json.error.details)
        } else {
          setFormError(json.error?.message ?? 'We could not add this family member.')
        }
        return
      }
      setDone({
        name: json.data.fullName,
        mrn: json.data.mrn,
        requiresConfirmation: json.data.requiresConfirmation,
      })
      router.refresh()
    } catch {
      setFormError('We could not reach the clinic. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <div className="space-y-5">
        <SuccessNote
          title={`${done.name} has been added`}
          body={`Their patient ID is ${done.mrn}.`}
        />
        {done.requiresConfirmation ? (
          <Card className="border-[var(--caution)]/25 bg-[var(--caution-wash)]">
            <p className="flex items-start gap-2 text-body-sm text-ink">
              <IconShield size={16} className="mt-0.5 shrink-0 text-[var(--caution)]" />
              <span>
                Because {done.name} is an adult, they need to confirm on their own mobile number before
                you can see their records. We&apos;ve asked them to confirm.
              </span>
            </p>
          </Card>
        ) : null}
        <Link
          href="/app/profile"
          className="flex h-11 items-center justify-center rounded-md bg-brand font-semibold text-white"
        >
          Back to profile
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Link
        href="/app/profile"
        className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full pl-1 pr-3 text-body-sm font-semibold text-ink-muted"
      >
        <IconChevronLeft size={18} />
        Profile
      </Link>

      <div>
        <h1 className="text-title text-ink">Add a family member</h1>
        <p className="mt-1.5 text-body text-ink-muted">
          They get their own records, appointments and reports — kept separate from yours.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <Field label="Full name" htmlFor="fullName" error={fieldErrors.fullName} required>
          <Input
            id="fullName"
            value={fullName}
            autoComplete="off"
            invalid={Boolean(fieldErrors.fullName)}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="As it should appear on their records"
          />
        </Field>

        <Field label="Date of birth" htmlFor="dateOfBirth" error={fieldErrors.dateOfBirth} required>
          <Input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            max={new Date().toISOString().slice(0, 10)}
            invalid={Boolean(fieldErrors.dateOfBirth)}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </Field>

        <Field label="Sex" htmlFor="gender" required>
          <Select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
            <option value="UNDISCLOSED">Prefer not to say</option>
          </Select>
        </Field>

        <Field label="Relationship to you" htmlFor="relationship" required>
          <Select id="relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
            <option value="CHILD">Child</option>
            <option value="SPOUSE">Spouse</option>
            <option value="PARENT">Parent</option>
            <option value="SIBLING">Sibling</option>
            <option value="GRANDPARENT">Grandparent</option>
            <option value="OTHER">Other</option>
          </Select>
        </Field>

        <Field
          label="Their mobile number"
          htmlFor="phone"
          hint={isAdult ? 'Required so they can confirm — an adult must approve access to their own records.' : 'Optional.'}
        >
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d\s+]/g, ''))}
            placeholder="98765 43210"
            className="tabular"
          />
        </Field>

        {/*
          The consent rule made visible. An adult's medical record is not something another
          adult may claim by typing their name. docs/03 §5.
        */}
        {isAdult ? (
          <Card className="border-brand/25 bg-brand-wash">
            <p className="flex items-start gap-2 text-body-sm text-brand-ink">
              <IconShield size={16} className="mt-0.5 shrink-0" />
              <span>
                They&apos;re an adult, so we&apos;ll ask them to confirm on their own number before their
                records become visible to you.
              </span>
            </p>
          </Card>
        ) : null}

        {formError ? <ErrorState title="We couldn't add them" body={formError} /> : null}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={pending}
          disabled={fullName.trim().length < 2 || !dateOfBirth}
        >
          Add family member
        </Button>
      </form>
    </div>
  )
}
