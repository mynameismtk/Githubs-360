import * as React from 'react'

/**
 * Ankura's icon set — soft, rounded strokes on a 24px grid. First-party rather than an
 * icon package, same reasoning as Clinic 360's (see src/components/ui/icons.tsx), kept
 * as its own file so Ankura never imports from Clinic 360.
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
export const IconDrop = (p: P) => (
  <Svg {...p}><path d="M12 3.5c3 4 6 7.6 6 11a6 6 0 1 1-12 0c0-3.4 3-7 6-11Z" /></Svg>
)
export const IconSprout = (p: P) => (
  <Svg {...p}><path d="M12 21v-8" /><path d="M12 13c0-4-3-6-7-6 0 4 3 7 7 7Z" /><path d="M12 11c0-3.5 2.5-5.5 6-5.5 0 3.5-2.5 6.5-6 6.5Z" /></Svg>
)
export const IconBook = (p: P) => (
  <Svg {...p}><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5Z" /><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5Z" /></Svg>
)
export const IconWallet = (p: P) => (
  <Svg {...p}><rect x="3" y="6.5" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><path d="M16 14.5h2" /></Svg>
)
export const IconBuilding = (p: P) => (
  <Svg {...p}><rect x="5" y="3.5" width="14" height="17" rx="1.5" /><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" /></Svg>
)
export const IconCheck = (p: P) => <Svg {...p}><path d="M5 12.5 10 17.5 19 7" /></Svg>
export const IconPlus = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
export const IconChevronRight = (p: P) => <Svg {...p}><path d="M9 5.5 15.5 12 9 18.5" /></Svg>
export const IconChevronLeft = (p: P) => <Svg {...p}><path d="M15 5.5 8.5 12 15 18.5" /></Svg>
export const IconSearch = (p: P) => (
  <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.3-4.3" /></Svg>
)
export const IconMic = (p: P) => (
  <Svg {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0" /><path d="M12 17v4M9 21h6" /></Svg>
)
export const IconMoon = (p: P) => <Svg {...p}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" /></Svg>
export const IconClose = (p: P) => <Svg {...p}><path d="m6 6 12 12M18 6 6 18" /></Svg>
export const IconArrowLeft = (p: P) => <Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>
export const IconPhone = (p: P) => (
  <Svg {...p}><path d="M6 4h3l1.5 4.5-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2L20 15v3a2 2 0 0 1-2 2C11 20 4 13 4 6a2 2 0 0 1 2-2Z" /></Svg>
)
export const IconUsers = (p: P) => (
  <Svg {...p}><circle cx="9" cy="8.5" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17.5" cy="9" r="2.5" /><path d="M15.5 14.2c2.6.3 4.7 2.5 4.9 5.3" /></Svg>
)
export const IconBell = (p: P) => (
  <Svg {...p}><path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" /><path d="M10 19a2 2 0 0 0 4 0" /></Svg>
)
export const IconFlask = (p: P) => (
  <Svg {...p}><path d="M10 3h4M9.5 3v6L5 18.5A2 2 0 0 0 6.8 21h10.4a2 2 0 0 0 1.8-2.5L14.5 9V3" /><path d="M7.5 15.5h9" /></Svg>
)
export const IconHeart = (p: P) => (
  <Svg {...p}><path d="M12 20.5S4 15.2 4 9.7A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 8 2.7c0 5.5-8 10.8-8 10.8Z" /></Svg>
)
export const IconSparkle = (p: P) => (
  <Svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></Svg>
)
export const IconCalendar = (p: P) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /></Svg>
)
export const IconTrash = (p: P) => (
  <Svg {...p}><path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" /></Svg>
)
export const IconPin = (p: P) => (
  <Svg {...p}><path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></Svg>
)
export const IconClock = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>
)
