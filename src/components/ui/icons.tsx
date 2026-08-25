import * as React from 'react'

/**
 * A small, hand-drawn icon set on a 24px grid with a 1.75 stroke.
 *
 * First-party rather than an icon package: it keeps the visual language consistent with
 * the rest of the identity, avoids the cartoon-medical look the brief rejects, and means
 * the bundle carries only the glyphs actually used.
 */
type P = { className?: string; size?: number }

function Svg({ children, className, size = 20 }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}

export const IconHome = (p: P) => (
  <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V20h13V9.5" /><path d="M9.5 20v-6h5v6" /></Svg>
)
export const IconCalendar = (p: P) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /></Svg>
)
export const IconRecords = (p: P) => (
  <Svg {...p}><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /><path d="M9 12h7M9 16h5" /></Svg>
)
export const IconMessage = (p: P) => (
  <Svg {...p}><path d="M4 5h16v11H9l-5 4z" /><path d="M8.5 10h7" /></Svg>
)
export const IconUser = (p: P) => (
  <Svg {...p}><circle cx="12" cy="8" r="3.75" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></Svg>
)
export const IconStethoscope = (p: P) => (
  <Svg {...p}><path d="M6 3v5a4 4 0 0 0 8 0V3" /><path d="M10 15v1a5 5 0 0 0 10 0v-2" /><path d="M10 12v3" /><circle cx="20" cy="12" r="2" /></Svg>
)
export const IconPill = (p: P) => (
  <Svg {...p}><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-45 12 12)" /><path d="M8.8 8.8 15.2 15.2" /></Svg>
)
export const IconFlask = (p: P) => (
  <Svg {...p}><path d="M10 3v6.5L4.8 18A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-3L14 9.5V3" /><path d="M8.5 3h7" /><path d="M7 15h10" /></Svg>
)
export const IconCard = (p: P) => (
  <Svg {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 15h4" /></Svg>
)
export const IconClock = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5.5l3.5 2" /></Svg>
)
export const IconPin = (p: P) => (
  <Svg {...p}><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></Svg>
)
export const IconChevronRight = (p: P) => <Svg {...p}><path d="M9 5l7 7-7 7" /></Svg>
export const IconChevronLeft = (p: P) => <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>
export const IconCheck = (p: P) => <Svg {...p}><path d="M4 12.5l5.5 5.5L20 7" /></Svg>
export const IconClose = (p: P) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>
export const IconPlus = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
export const IconPhone = (p: P) => (
  <Svg {...p}><path d="M5 3.5h4l1.5 4.5-2.2 1.6a12 12 0 0 0 6.1 6.1l1.6-2.2 4.5 1.5v4a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.7 2 2 0 0 1 5 3.5z" /></Svg>
)
export const IconAlert = (p: P) => (
  <Svg {...p}><path d="M12 3.5 21.5 20h-19z" /><path d="M12 9.5v4.5" /><circle cx="12" cy="17" r=".6" fill="currentColor" /></Svg>
)
export const IconRoute = (p: P) => (
  <Svg {...p}><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.5 6H14a3.5 3.5 0 0 1 0 7h-4a3.5 3.5 0 0 0 0 7h5.5" /></Svg>
)
export const IconSearch = (p: P) => <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></Svg>
export const IconBell = (p: P) => (
  <Svg {...p}><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9z" /><path d="M10 18a2 2 0 0 0 4 0" /></Svg>
)
export const IconHeart = (p: P) => (
  <Svg {...p}><path d="M12 20s-7.5-4.7-7.5-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 3c0 4.9-7.5 9.6-7.5 9.6z" /></Svg>
)
export const IconScan = (p: P) => (
  <Svg {...p}><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" /><path d="M4 12h16" /></Svg>
)
export const IconUsers = (p: P) => (
  <Svg {...p}><circle cx="9" cy="8" r="3.25" /><path d="M3 19a6 6 0 0 1 12 0" /><path d="M16 5.5a3.25 3.25 0 0 1 0 6.5M17 15.5a6 6 0 0 1 4 3.5" /></Svg>
)
export const IconTrend = (p: P) => <Svg {...p}><path d="M3 17l5.5-5.5 4 4L21 7" /><path d="M15 7h6v6" /></Svg>
export const IconLogout = (p: P) => (
  <Svg {...p}><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M15 8l4 4-4 4M19 12H9" /></Svg>
)
export const IconShield = (p: P) => (
  <Svg {...p}><path d="M12 3l7.5 3v6c0 4.5-3.2 7.9-7.5 9-4.3-1.1-7.5-4.5-7.5-9V6z" /><path d="M9 12l2 2 4-4" /></Svg>
)
export const IconBuilding = (p: P) => (
  <Svg {...p}><rect x="4" y="3.5" width="16" height="17" rx="2" /><path d="M8.5 8h2M13.5 8h2M8.5 12h2M13.5 12h2M10.5 20.5v-4h3v4" /></Svg>
)

export const ICONS: Record<string, (p: P) => React.JSX.Element> = {
  stethoscope: IconStethoscope,
  heart: IconHeart,
  pill: IconPill,
  flask: IconFlask,
  scan: IconScan,
  users: IconUsers,
  route: IconRoute,
  building: IconBuilding,
  user: IconUser,
  calendar: IconCalendar,
}

/** Resolves a database-configured icon key, falling back rather than rendering nothing. */
export function DynamicIcon({ name, ...p }: P & { name: string }) {
  const Cmp = ICONS[name] ?? IconStethoscope
  return <Cmp {...p} />
}
