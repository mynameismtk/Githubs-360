'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArtSprout } from './illustrations'

export function AnkuraTopBar({ fullName }: { fullName: string | null }) {
  const router = useRouter()
  const firstName = fullName?.split(' ')[0] || 'there'

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-a-border/70 bg-a-bg/90 px-4 py-3 backdrop-blur">
      <Link href="/ankura/home" className="flex items-center gap-2">
        <ArtSprout size={30} />
        <span className="font-a-serif text-lg text-a-ink">Ankura</span>
      </Link>
      <button
        type="button"
        onClick={async () => {
          await fetch('/api/ankura/auth/logout', { method: 'POST' })
          router.push('/ankura')
          router.refresh()
        }}
        className="rounded-full px-3 py-1.5 text-body-sm font-semibold text-a-ink-muted hover:bg-a-surface-sunken"
      >
        Hi, {firstName}
      </button>
    </header>
  )
}
