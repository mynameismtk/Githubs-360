'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { IconHome, IconDrop, IconSprout, IconBook, IconWallet } from './icons'

const ITEMS = [
  { href: '/ankura/home', label: 'Home', icon: IconHome },
  { href: '/ankura/reminders', label: 'Reminders', icon: IconDrop },
  { href: '/ankura/journey', label: 'Journey', icon: IconSprout },
  { href: '/ankura/glossary', label: 'Glossary', icon: IconBook },
  { href: '/ankura/costs', label: 'Costs', icon: IconWallet },
] as const

export function AnkuraBottomNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Ankura"
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-a-border bg-a-surface/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-patient items-stretch justify-between px-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.6875rem] font-semibold transition-colors duration-fast',
                active ? 'text-a-brand-ink' : 'text-a-ink-subtle',
              )}
            >
              <Icon size={22} className={active ? 'text-a-brand' : undefined} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
