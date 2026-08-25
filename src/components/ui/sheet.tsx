'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { IconClose } from './icons'

/**
 * Bottom sheet on mobile, centred dialog on larger screens.
 *
 * Implements the behaviours a modal needs to be usable and accessible, which is the
 * reason this is hand-built rather than a styled <div>: focus is trapped while open,
 * Escape closes, background scroll is locked, and focus returns to whatever opened it.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  tone = 'default',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  tone?: 'default' | 'emergency'
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    // Move focus into the panel so a screen reader lands in the dialog, not behind it.
    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
    focusables()[0]?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]!
      const last = items[items.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      previouslyFocused.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-[#16211F]/40 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative max-h-[85dvh] w-full max-w-patient overflow-y-auto rounded-t-2xl bg-surface p-5 pb-8 shadow-overlay animate-sheet-in sm:rounded-2xl sm:pb-5',
          tone === 'emergency' && 'border-t-4 border-[var(--emergency)]',
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-heading text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface-sunken"
          >
            <IconClose size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
