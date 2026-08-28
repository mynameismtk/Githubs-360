'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { IconAuraMark, IconClose, IconMenu } from './icons'

const LINKS = [
  { href: '#specialities', label: 'Specialities' },
  { href: '#why-aura', label: 'Why Aura' },
  { href: '#doctors', label: 'Doctors' },
  { href: '#testimonials', label: 'Patients' },
  { href: '#visit', label: 'Visit us' },
]

export function SiteNav() {
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-base ease-smooth',
        scrolled || open ? 'bg-surface/80 backdrop-blur-xl border-b border-border' : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8" aria-label="Primary">
        <Link href="#top" className="flex items-center gap-2 font-semibold text-ink" onClick={() => setOpen(false)}>
          <IconAuraMark className="text-brand" size={26} />
          <span className="text-[1.05rem] tracking-tight">Aura Medical Centre</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-body-sm font-medium text-ink-muted transition-colors duration-fast hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/onboarding" className="text-body-sm font-medium text-ink-muted transition-colors duration-fast hover:text-ink">
            Patient login
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-body-sm font-semibold text-white transition-colors duration-fast hover:bg-brand-hover"
          >
            Book appointment
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink md:hidden"
        >
          {open ? <IconClose size={22} /> : <IconMenu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-surface px-5 pb-8 pt-2 md:hidden">
          <ul className="flex flex-col">
            {LINKS.map((l) => (
              <li key={l.href} className="border-b border-border">
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 text-heading text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/onboarding"
              onClick={() => setOpen(false)}
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand text-body font-semibold text-white"
            >
              Book appointment
            </Link>
            <Link
              href="/onboarding"
              onClick={() => setOpen(false)}
              className="inline-flex h-12 items-center justify-center rounded-full border border-border-strong text-body font-semibold text-ink"
            >
              Patient login
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
