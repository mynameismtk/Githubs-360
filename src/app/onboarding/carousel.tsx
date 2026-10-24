'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, LinkButton } from '@/components/ui/button'
import { IconCalendar, IconRecords, IconHeart, IconShield } from '@/components/ui/icons'
import { cn } from '@/lib/cn'

/**
 * Four screens, then straight to sign-in (§33). Onboarding is skippable from the first
 * screen — a returning patient reinstalling the app should not have to swipe through it.
 */
const slides = (clinicName: string) => [
  {
    icon: IconShield,
    title: `Welcome to ${clinicName}`,
    body: 'Your appointments, prescriptions, reports and bills — all in one place, always with you.',
  },
  {
    icon: IconCalendar,
    title: 'Book in under a minute',
    body: 'See who is available today, pick a time that suits you, and skip the phone call.',
  },
  {
    icon: IconRecords,
    title: 'Keep your records together',
    body: 'Every consultation, lab report and prescription, saved in order. Nothing to carry, nothing to lose.',
  },
  {
    icon: IconHeart,
    title: 'Stay on top of your care',
    body: "We'll remind you about follow-ups, medicines and reports — for you and for your family.",
  },
]

export function OnboardingCarousel({ clinicName }: { clinicName: string }) {
  const [index, setIndex] = useState(0)
  const SLIDES = slides(clinicName)
  const slide = SLIDES[index]!
  const Icon = slide.icon
  const isLast = index === SLIDES.length - 1

  return (
    <main className="mx-auto flex min-h-dvh max-w-patient flex-col px-6 pb-10 pt-6">
      <div className="flex items-center justify-between">
        <span className="text-caption font-semibold text-ink-muted">{clinicName}</span>
        {!isLast ? (
          <Link href="/login" className="text-body-sm font-semibold text-brand-ink">
            Skip
          </Link>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div
          key={index}
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-wash text-brand animate-fade-in"
        >
          <Icon size={44} />
        </div>
        {/* Keyed so the text re-animates on each step, which makes the change legible. */}
        <h1 key={`t-${index}`} className="text-title text-ink animate-slide-up">
          {slide.title}
        </h1>
        <p key={`b-${index}`} className="mt-3 max-w-xs text-body text-ink-muted animate-slide-up">
          {slide.body}
        </p>
      </div>

      <div className="mb-8 flex justify-center gap-2" role="tablist" aria-label="Onboarding steps">
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            role="tab"
            aria-selected={i === index}
            aria-label={`Step ${i + 1}: ${s.title}`}
            onClick={() => setIndex(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-base ease-smooth',
              i === index ? 'w-6 bg-brand' : 'w-2 bg-border-strong',
            )}
          />
        ))}
      </div>

      {isLast ? (
        <div className="space-y-3">
          <LinkButton href="/login" size="lg" fullWidth>
            Get started
          </LinkButton>
          <p className="text-center text-caption text-ink-subtle">
            You will sign in with your mobile number.
          </p>
        </div>
      ) : (
        <Button size="lg" fullWidth onClick={() => setIndex((i) => i + 1)}>
          Continue
        </Button>
      )}
    </main>
  )
}
