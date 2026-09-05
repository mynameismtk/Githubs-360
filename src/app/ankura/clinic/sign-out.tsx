'use client'
import { useRouter } from 'next/navigation'

export function ClinicSignOut() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch('/api/ankura/auth/logout', { method: 'POST' })
        router.push('/ankura')
        router.refresh()
      }}
      className="rounded-full border border-a-border-strong px-3.5 py-1.5 text-body-sm font-semibold text-a-ink-muted hover:bg-a-surface-sunken"
    >
      Sign out
    </button>
  )
}
