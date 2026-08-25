'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/cn'

export interface NavItem {
  href: string
  label: string
  exact?: boolean
}

/**
 * The staff shell.
 *
 * Deliberately NOT the patient shell at a wider breakpoint (§30). Staff sit at a desk
 * looking at a large screen all day: this is dense, keyboard-reachable, has a persistent
 * side rail instead of a bottom bar, and uses 14px body text where the patient app never
 * goes below 16px.
 */
export function StaffShell({
  productLabel, clinicName, user, nav, children,
}: {
  productLabel: string
  clinicName: string
  user: { fullName: string; roleLabel: string }
  nav: NavItem[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)

  return (
    <div className="min-h-dvh bg-bg">
      <a href="#main" className="skip-link">Skip to content</a>

      <div className="flex min-h-dvh">
        <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
          <div className="border-b border-border px-5 py-4">
            <p className="text-body font-bold text-ink">{clinicName}</p>
            <p className="text-caption text-ink-muted">{productLabel}</p>
          </div>
          <nav aria-label="Main" className="flex-1 p-3">
            <ul className="space-y-0.5">
              {nav.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex h-9 items-center rounded-md px-3 text-body-sm font-medium transition-colors duration-fast',
                        active ? 'bg-brand-wash text-brand-ink' : 'text-ink-muted hover:bg-surface-sunken',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2.5 px-2 py-2">
              <Avatar name={user.fullName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-semibold text-ink">{user.fullName}</p>
                <p className="text-caption text-ink-muted">{user.roleLabel}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                setSigningOut(true)
                await fetch('/api/auth/logout', { method: 'POST' })
                window.location.href = '/login'
              }}
              className="mt-1 flex h-9 w-full items-center rounded-md px-3 text-body-sm font-medium text-ink-muted hover:bg-surface-sunken"
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Horizontal nav on tablet, where a fixed side rail would eat too much width. */}
          <header className="border-b border-border bg-surface lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-body-sm font-bold text-ink">{clinicName}</p>
                <p className="text-caption text-ink-muted">{productLabel}</p>
              </div>
              <Avatar name={user.fullName} size="sm" />
            </div>
            <nav aria-label="Main" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
              {nav.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-9 shrink-0 items-center rounded-md px-3 text-body-sm font-medium',
                      active ? 'bg-brand-wash text-brand-ink' : 'text-ink-muted',
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </header>

          <main id="main" className="flex-1 p-5 lg:p-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
