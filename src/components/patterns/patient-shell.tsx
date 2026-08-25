'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/avatar'
import { Sheet } from '@/components/ui/sheet'
import {
  IconHome, IconCalendar, IconRecords, IconMessage, IconUser,
  IconAlert, IconPhone, IconPin, IconChevronRight, IconCheck, IconBell,
} from '@/components/ui/icons'
import { cn } from '@/lib/cn'

export interface FamilyMemberSummary {
  patientId: string
  name: string
  relationship: string
  isSelf: boolean
  avatarUrl: string | null
}

export interface ClinicSummary {
  name: string
  supportPhone: string
  emergencyPhone: string
  brandPrimary: string
  brandAccent: string
  locations: Array<{ id: string; name: string; mapsUrl: string | null; latitude: number | null; longitude: number | null; phone: string | null }>
}

const NAV: ReadonlyArray<{ href: string; label: string; icon: (p: { size?: number; className?: string }) => React.JSX.Element; exact?: boolean }> = [
  { href: '/app', label: 'Home', icon: IconHome, exact: true },
  { href: '/app/appointments', label: 'Appointments', icon: IconCalendar },
  { href: '/app/records', label: 'Records', icon: IconRecords },
  { href: '/app/messages', label: 'Messages', icon: IconMessage },
  { href: '/app/profile', label: 'Profile', icon: IconUser },
]

const RELATIONSHIP_LABEL: Record<string, string> = {
  SELF: 'You', SPOUSE: 'Spouse', CHILD: 'Child', PARENT: 'Parent',
  SIBLING: 'Sibling', GRANDPARENT: 'Grandparent', GUARDIAN: 'Guardian', OTHER: 'Family',
}

export function PatientShell({
  clinic, family, active, unreadCount, children,
}: {
  clinic: ClinicSummary
  family: FamilyMemberSummary[]
  active: FamilyMemberSummary
  unreadCount: number
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [emergencyOpen, setEmergencyOpen] = useState(false)

  return (
    <div
      className="min-h-dvh bg-bg"
      // Clinic branding is applied at runtime from the database, so the whole product
      // re-skins per clinic without a rebuild (§42).
      style={{ ['--brand' as string]: clinic.brandPrimary, ['--accent' as string]: clinic.brandAccent }}
    >
      <a href="#main" className="skip-link">Skip to content</a>

      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-patient items-center gap-3 px-5 py-3">
          <button
            onClick={() => setSwitcherOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
            aria-label={`Viewing ${active.name}. Change patient.`}
          >
            <Avatar name={active.name} src={active.avatarUrl} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-body-sm font-semibold text-ink">{active.name}</span>
              <span className="block text-caption text-ink-muted">
                {RELATIONSHIP_LABEL[active.relationship] ?? 'Family'} · Switch
              </span>
            </span>
          </button>

          <Link
            href="/app/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-muted"
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          >
            <IconBell size={20} />
            {unreadCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white tabular">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </Link>

          {/*
            Emergency is reachable in one tap from every patient screen and is never behind
            a menu, a chatbot or a triage question (§15).
          */}
          <button
            onClick={() => setEmergencyOpen(true)}
            className="flex h-10 items-center gap-1.5 rounded-full bg-[var(--emergency)] px-3 font-semibold text-white"
            aria-label="Emergency help"
          >
            <IconAlert size={16} />
            <span className="text-caption">SOS</span>
          </button>
        </div>

        {/*
          When the account holder is looking at someone else's records, this band is
          always present. It is the single strongest defence against the "whose report am
          I reading?" failure. docs/06 §5.
        */}
        {!active.isSelf ? (
          <div className="border-t border-brand/15 bg-brand-wash px-5 py-2">
            <p className="mx-auto max-w-patient text-caption text-brand-ink">
              Viewing <span className="font-bold">{active.name}</span>&apos;s records ·{' '}
              {RELATIONSHIP_LABEL[active.relationship] ?? 'Family'}
            </p>
          </div>
        ) : null}
      </header>

      <main id="main" className="mx-auto max-w-patient px-5 pb-28 pt-5">
        {children}
      </main>

      <nav
        aria-label="Main"
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur"
      >
        <ul className="mx-auto flex max-w-patient">
          {NAV.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex h-14 flex-col items-center justify-center gap-0.5 transition-colors duration-fast',
                    isActive ? 'text-brand' : 'text-ink-subtle',
                  )}
                >
                  <Icon size={22} />
                  <span className="text-[11px] font-semibold">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <FamilySwitcher
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        family={family}
        activeId={active.patientId}
      />
      <EmergencySheet open={emergencyOpen} onClose={() => setEmergencyOpen(false)} clinic={clinic} />
    </div>
  )
}

function FamilySwitcher({
  open, onClose, family, activeId,
}: {
  open: boolean
  onClose: () => void
  family: FamilyMemberSummary[]
  activeId: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [switching, setSwitching] = useState<string | null>(null)

  async function select(patientId: string) {
    if (patientId === activeId) return onClose()
    setSwitching(patientId)
    await fetch('/api/family/active', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ patientId }),
    })
    // A visible reload is intentional: switching patient must never look like a no-op.
    startTransition(() => {
      router.refresh()
      onClose()
      setSwitching(null)
    })
  }

  return (
    <Sheet open={open} onClose={onClose} title="Who are you here for?">
      <ul className="space-y-2">
        {family.map((member) => {
          const isActive = member.patientId === activeId
          return (
            <li key={member.patientId}>
              <button
                onClick={() => select(member.patientId)}
                disabled={pending}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors duration-fast',
                  isActive ? 'border-brand bg-brand-wash' : 'border-border bg-surface',
                )}
              >
                <Avatar name={member.name} src={member.avatarUrl} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-semibold text-ink">{member.name}</span>
                  <span className="block text-caption text-ink-muted">
                    {RELATIONSHIP_LABEL[member.relationship] ?? 'Family'}
                  </span>
                </span>
                {isActive ? <IconCheck size={20} className="text-brand" /> : null}
                {switching === member.patientId ? <span className="text-caption text-ink-muted">…</span> : null}
              </button>
            </li>
          )
        })}
      </ul>
      <Link
        href="/app/profile/family/add"
        onClick={onClose}
        className="mt-4 flex items-center justify-between rounded-md border border-dashed border-border-strong p-3.5"
      >
        <span className="text-body font-semibold text-brand-ink">Add a family member</span>
        <IconChevronRight size={18} className="text-ink-subtle" />
      </Link>
    </Sheet>
  )
}

/**
 * Emergency (§15). Phone numbers and directions, nothing between the patient and help.
 * No AI, no triage, no form.
 */
function EmergencySheet({
  open, onClose, clinic,
}: {
  open: boolean
  onClose: () => void
  clinic: ClinicSummary
}) {
  const primary = clinic.locations[0]
  const [shared, setShared] = useState<string | null>(null)

  function shareLocation() {
    if (!('geolocation' in navigator)) {
      setShared('Location sharing is not available on this device.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const text = `My location: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`
        if (navigator.share) void navigator.share({ text }).catch(() => undefined)
        else void navigator.clipboard?.writeText(text)
        setShared('Location copied — send it to whoever is helping you.')
      },
      () => setShared('We could not get your location. Please allow location access.'),
    )
  }

  return (
    <Sheet open={open} onClose={onClose} title="Emergency" tone="emergency">
      <p className="mb-4 text-body text-ink-muted">
        If this is a medical emergency, call for help now.
      </p>
      <div className="space-y-2.5">
        <a
          href={`tel:${clinic.emergencyPhone}`}
          className="flex h-[52px] items-center justify-center gap-2 rounded-md bg-[var(--emergency)] text-body font-semibold text-white"
        >
          <IconPhone size={20} />
          Call emergency services ({clinic.emergencyPhone})
        </a>
        <a
          href={`tel:${clinic.supportPhone}`}
          className="flex h-[52px] items-center justify-center gap-2 rounded-md border border-border-strong bg-surface text-body font-semibold text-ink"
        >
          <IconPhone size={20} />
          Call {clinic.name}
        </a>
        {primary ? (
          <a
            href={
              primary.mapsUrl ??
              `https://maps.google.com/?q=${primary.latitude ?? ''},${primary.longitude ?? ''}`
            }
            target="_blank"
            rel="noreferrer"
            className="flex h-[52px] items-center justify-center gap-2 rounded-md border border-border-strong bg-surface text-body font-semibold text-ink"
          >
            <IconPin size={20} />
            Directions to the clinic
          </a>
        ) : null}
        <button
          onClick={shareLocation}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-md border border-border-strong bg-surface text-body font-semibold text-ink"
        >
          <IconPin size={20} />
          Share my location
        </button>
      </div>
      {shared ? (
        <p role="status" className="mt-3 text-caption text-ink-muted">
          {shared}
        </p>
      ) : null}
    </Sheet>
  )
}
