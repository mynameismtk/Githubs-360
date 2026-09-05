'use client'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { IconCheck } from './icons'

/**
 * The completion checkbox for a dose (brief §4: "a checked-off injection should feel
 * like a small exhale, not a gamified win"). Deliberately not a confetti burst — one
 * gentle overshoot-then-settle, then it just... rests, done.
 */
export function AnkuraDoseCheck({
  checked,
  onToggle,
  disabled,
  label,
}: {
  checked: boolean
  onToggle: () => void
  disabled?: boolean
  label: string
}) {
  const [justChecked, setJustChecked] = useState(false)

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={checked}
      aria-label={label}
      onClick={() => {
        if (!checked) {
          setJustChecked(true)
          setTimeout(() => setJustChecked(false), 550)
        }
        onToggle()
      }}
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-slow ease-smooth focus-visible:outline-none focus-visible:shadow-a-focus disabled:opacity-50',
        checked ? 'border-a-brand bg-a-brand text-a-ink-inverse' : 'border-a-border-strong bg-a-surface text-transparent hover:border-a-brand',
        justChecked && 'ankura-exhale',
      )}
    >
      <IconCheck size={20} />
    </button>
  )
}
