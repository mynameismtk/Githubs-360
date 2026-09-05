'use client'

import { useState } from 'react'
import { AnkuraCard } from '@/components/ankura/ui/card'
import { AnkuraButton } from '@/components/ankura/ui/button'
import { AnkuraField, AnkuraInput, AnkuraTextarea } from '@/components/ankura/ui/input'
import { AnkuraBadge } from '@/components/ankura/ui/badge'
import { AnkuraEmptyState } from '@/components/ankura/ui/states'
import { IconBell, IconPlus, IconPin } from '@/components/ankura/ui/icons'

interface Announcement {
  id: string
  title: string
  body: string
  isPinned: boolean
  publishedAt: string
}

export function AnnouncementsManager({ initialAnnouncements }: { initialAnnouncements: Announcement[] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <AnkuraButton size="sm" variant={showForm ? 'secondary' : 'primary'} onClick={() => setShowForm((v) => !v)}>
          <IconPlus size={16} /> {showForm ? 'Close' : 'New announcement'}
        </AnkuraButton>
      </div>

      {showForm ? (
        <AddAnnouncementForm
          onAdded={(a) => {
            setAnnouncements((prev) => [a, ...prev])
            setShowForm(false)
          }}
        />
      ) : null}

      {announcements.length === 0 ? (
        <AnkuraEmptyState icon={<IconBell size={26} />} title="No announcements yet" body="Broadcast clinic hours, camp dates, or a reminder about reports." />
      ) : (
        <div className="space-y-2.5">
          {announcements.map((a) => (
            <AnkuraCard key={a.id}>
              <div className="mb-1 flex items-center gap-1.5">
                {a.isPinned ? <AnkuraBadge tone="accent" icon={<IconPin size={11} />}>Pinned</AnkuraBadge> : null}
                <p className="font-a-serif text-base text-a-ink">{a.title}</p>
              </div>
              <p className="text-body-sm text-a-ink-muted">{a.body}</p>
              <p className="mt-1.5 text-caption text-a-ink-subtle">
                {new Date(a.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </AnkuraCard>
          ))}
        </div>
      )}
    </div>
  )
}

function AddAnnouncementForm({ onAdded }: { onAdded: (a: Announcement) => void }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/ankura/clinic/announcements', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, body, isPinned }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error?.message ?? 'We could not publish that.')
        return
      }
      onAdded(json.data)
    } catch {
      setError('We could not reach Ankura. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AnkuraCard className="mb-4">
      <form onSubmit={submit} className="space-y-4">
        <AnkuraField label="Title" htmlFor="a-title" required>
          <AnkuraInput id="a-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
        </AnkuraField>
        <AnkuraField label="Message" htmlFor="a-body" required>
          <AnkuraTextarea id="a-body" value={body} onChange={(e) => setBody(e.target.value)} required maxLength={2000} />
        </AnkuraField>
        <label className="flex items-center gap-2.5">
          <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="h-4.5 w-4.5 accent-[var(--a-brand)]" />
          <span className="text-body-sm text-a-ink">Pin to the top</span>
        </label>
        {error ? <p role="alert" className="text-caption font-medium text-a-critical">{error}</p> : null}
        <AnkuraButton type="submit" fullWidth loading={pending} disabled={!title.trim() || !body.trim()}>
          Publish
        </AnkuraButton>
      </form>
    </AnkuraCard>
  )
}
