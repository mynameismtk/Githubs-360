'use client'
import * as React from 'react'

/**
 * Soft, abstract, watercolor-adjacent illustration set (brief §4) — never a literal
 * medical diagram in an emotional-support-facing screen; that's reserved for the
 * jargon decoder, where clarity beats warmth. Every shape here is an organic blob or
 * bloom, rendered with a shared soft-blur filter so edges pool like pigment rather than
 * sitting on crisp vector lines.
 *
 * These render inside both Server and Client Components (a journey day card on a
 * server-rendered page, a home-screen card on a client one). Gradient ids use React's
 * `useId()` rather than a module-level counter — a mutable counter increments once per
 * render on the long-lived server process but resets to 0 on every fresh page load in
 * the browser, so the same illustration gets a different id on the server than on the
 * client and React's hydration fails to match them. `useId()` is built for exactly
 * this: it derives the same id from tree position on both sides.
 */

function useArtId() {
  return React.useId()
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3.2" />
      </filter>
      <radialGradient id={`${id}-brand`} cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="var(--a-brand)" stopOpacity="0.85" />
        <stop offset="100%" stopColor="var(--a-brand)" stopOpacity="0.35" />
      </radialGradient>
      <radialGradient id={`${id}-rose`} cx="40%" cy="35%" r="75%">
        <stop offset="0%" stopColor="var(--a-rose)" stopOpacity="0.8" />
        <stop offset="100%" stopColor="var(--a-rose)" stopOpacity="0.3" />
      </radialGradient>
      <radialGradient id={`${id}-gold`} cx="45%" cy="35%" r="75%">
        <stop offset="0%" stopColor="var(--a-accent)" stopOpacity="0.9" />
        <stop offset="100%" stopColor="var(--a-accent)" stopOpacity="0.35" />
      </radialGradient>
    </defs>
  )
}

type ArtProps = { size?: number; className?: string }

export function ArtSprout({ size = 96, className }: ArtProps) {
  const id = useArtId()
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={className} aria-hidden="true">
      <Defs id={id} />
      <ellipse cx="80" cy="128" rx="34" ry="14" fill={`url(#${id}-brand)`} filter={`url(#${id}-soft)`} />
      <path d="M80 128V72" stroke="var(--a-brand)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path
        d="M80 96c-6-22-28-28-46-24 4 20 22 34 46 24Z"
        fill={`url(#${id}-brand)`}
        filter={`url(#${id}-soft)`}
      />
      <path
        d="M80 86c8-20 28-24 44-18-6 18-24 30-44 18Z"
        fill={`url(#${id}-gold)`}
        filter={`url(#${id}-soft)`}
        opacity="0.9"
      />
      <circle cx="80" cy="128" r="6" fill="var(--a-brand-ink)" opacity="0.5" filter={`url(#${id}-soft)`} />
    </svg>
  )
}

export function ArtCluster({ size = 96, className }: ArtProps) {
  const id = useArtId()
  const cells = [
    { x: 78, y: 76, r: 22, g: 'brand' },
    { x: 58, y: 92, r: 17, g: 'rose' },
    { x: 100, y: 92, r: 17, g: 'rose' },
    { x: 68, y: 108, r: 13, g: 'gold' },
    { x: 92, y: 108, r: 13, g: 'gold' },
  ] as const
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={className} aria-hidden="true">
      <Defs id={id} />
      {cells.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={`url(#${id}-${c.g})`} filter={`url(#${id}-soft)`} />
      ))}
    </svg>
  )
}

export function ArtBlastocyst({ size = 96, className }: ArtProps) {
  const id = useArtId()
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={className} aria-hidden="true">
      <Defs id={id} />
      <circle cx="80" cy="86" r="46" fill={`url(#${id}-brand)`} opacity="0.55" filter={`url(#${id}-soft)`} />
      <circle cx="80" cy="86" r="46" fill="none" stroke="var(--a-brand)" strokeWidth="2.5" opacity="0.6" />
      <circle cx="62" cy="76" r="13" fill={`url(#${id}-gold)`} filter={`url(#${id}-soft)`} />
      <circle cx="72" cy="92" r="8" fill={`url(#${id}-rose)`} filter={`url(#${id}-soft)`} opacity="0.85" />
    </svg>
  )
}

export function ArtMoon({ size = 96, className }: ArtProps) {
  const id = useArtId()
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={className} aria-hidden="true">
      <Defs id={id} />
      <path
        d="M96 40a48 48 0 1 0 24 78 40 40 0 0 1-24-78Z"
        fill={`url(#${id}-brand)`}
        filter={`url(#${id}-soft)`}
      />
      <circle cx="118" cy="52" r="3" fill="var(--a-accent)" opacity="0.9" />
      <circle cx="130" cy="72" r="2" fill="var(--a-accent)" opacity="0.7" />
      <circle cx="108" cy="34" r="2" fill="var(--a-accent)" opacity="0.7" />
    </svg>
  )
}

export function ArtBloom({ size = 96, className }: ArtProps) {
  const id = useArtId()
  const petals = 6
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={className} aria-hidden="true">
      <Defs id={id} />
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (i / petals) * Math.PI * 2
        const x = 80 + Math.cos(angle) * 30
        const y = 80 + Math.sin(angle) * 30
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="22"
            ry="14"
            transform={`rotate(${(angle * 180) / Math.PI} ${x} ${y})`}
            fill={`url(#${id}-${i % 2 === 0 ? 'rose' : 'brand'})`}
            filter={`url(#${id}-soft)`}
          />
        )
      })}
      <circle cx="80" cy="80" r="16" fill={`url(#${id}-gold)`} filter={`url(#${id}-soft)`} />
    </svg>
  )
}

export function ArtSeed({ size = 96, className }: ArtProps) {
  const id = useArtId()
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={className} aria-hidden="true">
      <Defs id={id} />
      <ellipse cx="80" cy="84" rx="30" ry="40" fill={`url(#${id}-brand)`} filter={`url(#${id}-soft)`} />
      <path d="M80 50v68" stroke="var(--a-brand-ink)" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
    </svg>
  )
}

const REGISTRY: Record<string, React.ComponentType<ArtProps>> = {
  sprout: ArtSprout,
  cluster: ArtCluster,
  blastocyst: ArtBlastocyst,
  moon: ArtMoon,
  bloom: ArtBloom,
  seed: ArtSeed,
}

export function AnkuraJourneyArt({ illustrationKey, size, className }: { illustrationKey: string } & ArtProps) {
  const Art = REGISTRY[illustrationKey] ?? ArtSprout
  return <Art size={size} className={className} />
}

/** Large, drifting decorative blobs for hero/background use — never load-bearing content. */
export function AnkuraBackdropBlobs({ className }: { className?: string }) {
  const id = useArtId()
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', zIndex: -1 }}
    >
      <Defs id={id} />
      <circle cx="80" cy="70" r="120" fill={`url(#${id}-gold)`} opacity="0.35" filter={`url(#${id}-soft)`} className="ankura-drift" />
      <circle cx="330" cy="120" r="90" fill={`url(#${id}-rose)`} opacity="0.3" filter={`url(#${id}-soft)`} />
      <circle cx="200" cy="330" r="140" fill={`url(#${id}-brand)`} opacity="0.25" filter={`url(#${id}-soft)`} />
    </svg>
  )
}
