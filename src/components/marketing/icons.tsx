import * as React from 'react'

/**
 * Marketing-site icon set. Same 24px / 1.75-stroke grid as `components/ui/icons.tsx` so the
 * public site and the product read as one family, but kept separate because these glyphs
 * (specialities, aura mark) have no reason to ship in the patient/staff app bundle.
 */
type P = { className?: string; size?: number }

function Svg({ children, className, size = 24 }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}

export const IconAuraMark = ({ className, size = 32 }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
    <circle cx="16" cy="16" r="6.5" fill="currentColor" />
    <circle cx="16" cy="16" r="10.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.4" />
    <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.4" />
  </svg>
)

export const IconHeartPulse = (p: P) => (
  <Svg {...p}>
    <path d="M12 20.5 4.5 13a5 5 0 0 1 7-7.1L12 6.4l.5-.5a5 5 0 0 1 7 7.1z" />
    <path d="M5.5 13h3l1.5-3 2.5 5 1.5-3h2.5" />
  </Svg>
)
export const IconBone = (p: P) => (
  <Svg {...p}>
    <path d="M7 8.5A2.25 2.25 0 1 0 4 6a2.25 2.25 0 0 0 1.2 4.2L15.8 20.8A2.25 2.25 0 1 0 20 18a2.25 2.25 0 0 0-1.2-4.2z" />
  </Svg>
)
export const IconBaby = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M9 7.5c.5 1 1.4 1.6 3 1.6s2.5-.6 3-1.6" />
    <path d="M6.5 20c0-4 2.3-6.5 5.5-6.5s5.5 2.5 5.5 6.5" />
  </Svg>
)
export const IconStethoscope = (p: P) => (
  <Svg {...p}>
    <path d="M6 3v6a4 4 0 0 0 8 0V3" />
    <path d="M10 13v2.5a5.5 5.5 0 0 0 11 0V14" />
    <circle cx="20.5" cy="12.5" r="1.6" />
  </Svg>
)
export const IconDroplet = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.5S6 11 6 15a6 6 0 0 0 12 0c0-4-6-11.5-6-11.5Z" />
  </Svg>
)
export const IconEar = (p: P) => (
  <Svg {...p}>
    <path d="M8.5 13.5c-1-3.5 0-9 5-9a5.5 5.5 0 0 1 5.5 5.5c0 3-2 3.8-2 6.2a2.5 2.5 0 0 1-5 0" />
    <path d="M9.5 12.2a2.2 2.2 0 1 0 3 3" />
  </Svg>
)
export const IconTooth = (p: P) => (
  <Svg {...p}>
    <path d="M12 3c-2.6 0-3.7 1.3-5 1.3S4.5 3.7 3.5 4.6C2 6 2.4 9 3 11c.6 2 1.3 3 1.8 6.3.3 2 1 3.2 2 3.2s1.3-1.6 1.5-3.6c.2-1.7.7-2.4 1.7-2.4s1.5.7 1.7 2.4c.2 2 .5 3.6 1.5 3.6s1.7-1.2 2-3.2c.5-3.3 1.2-4.3 1.8-6.3.6-2 1-5-.5-6.4-1-.9-2.2-.3-3.5-.3S14.6 3 12 3Z" />
  </Svg>
)
export const IconEye = (p: P) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)
export const IconFlask = (p: P) => (
  <Svg {...p}>
    <path d="M9.5 3h5M10 3v6.5L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.5V3" />
    <path d="M7.5 15h9" />
  </Svg>
)
export const IconBrain = (p: P) => (
  <Svg {...p}>
    <path d="M9 4.5A3 3 0 0 0 6 7.4 3 3 0 0 0 4.5 12a3 3 0 0 0 1.7 4.3A3 3 0 0 0 9 19.5c1.7 0 3-1.3 3-3v-9c0-1.7-1.3-3-3-3Z" />
    <path d="M15 4.5A3 3 0 0 1 18 7.4 3 3 0 0 1 19.5 12a3 3 0 0 1-1.7 4.3A3 3 0 0 1 15 19.5c-1.7 0-3-1.3-3-3" />
  </Svg>
)
export const IconShieldCheck = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.5 19 6v6c0 5-3 8-7 9-4-1-7-4-7-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
)
export const IconClock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
)
export const IconPhone = (p: P) => (
  <Svg {...p}>
    <path d="M5 4h3.5l1.3 4.2-2 1.6a13 13 0 0 0 6.4 6.4l1.6-2 4.2 1.3V19a2 2 0 0 1-2.2 2A16 16 0 0 1 3 5.2 2 2 0 0 1 5 4Z" />
  </Svg>
)
export const IconPin = (p: P) => (
  <Svg {...p}>
    <path d="M12 21S5 14.4 5 9.5a7 7 0 1 1 14 0C19 14.4 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
)
export const IconCalendarCheck = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="M8.5 14.5 11 17l4.5-5" />
  </Svg>
)
export const IconSparkles = (p: P) => (
  <Svg {...p}>
    <path d="M12 4.5 13.4 9l4.6 1.4-4.6 1.4L12 16.3l-1.4-4.5L6 10.4 10.6 9z" />
    <path d="M19 4.5v3M17.5 6h3" />
    <path d="M5.5 16.5v2.5M4.2 17.8h2.6" />
  </Svg>
)
export const IconChevronRight = (p: P) => (
  <Svg {...p}>
    <path d="M9.5 5.5 16 12l-6.5 6.5" />
  </Svg>
)
export const IconMenu = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
)
export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)
export const IconQuote = (p: P) => (
  <Svg {...p}>
    <path d="M7.5 6.5C5 8 4 10.2 4 12.6 4 14.9 5.5 16.5 7.5 16.5s3.3-1.5 3.3-3.4c0-1.7-1.2-3-2.8-3.2.4-1.4 1.4-2.5 3-3.4z" fill="currentColor" stroke="none" />
    <path d="M16.2 6.5c-2.5 1.5-3.5 3.7-3.5 6.1 0 2.3 1.5 3.9 3.5 3.9s3.3-1.5 3.3-3.4c0-1.7-1.2-3-2.8-3.2.4-1.4 1.4-2.5 3-3.4z" fill="currentColor" stroke="none" />
  </Svg>
)
