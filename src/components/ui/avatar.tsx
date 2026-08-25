import { cn } from '@/lib/cn'

/**
 * Deterministic tint from the name, so the same person is always the same colour across
 * the app and staff build visual memory for a patient's card.
 */
const TINTS = [
  'bg-[#E8F3F0] text-[#0A5F52]',
  'bg-[#FBF0E8] text-[#8F4E22]',
  'bg-[#EDEFF7] text-[#3B4785]',
  'bg-[#F3EEF7] text-[#6A4585]',
  'bg-[#E9F4EE] text-[#245F44]',
  'bg-[#FDF3E0] text-[#7E560F]',
]

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? '?'
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase()
}

function tintFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return TINTS[hash % TINTS.length] ?? TINTS[0]!
}

const SIZES = { sm: 'h-8 w-8 text-caption', md: 'h-11 w-11 text-body-sm', lg: 'h-16 w-16 text-heading' }

export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string
  src?: string | null
  size?: keyof typeof SIZES
  className?: string
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatars come from arbitrary
      // storage keys resolved at runtime; next/image's loader adds no value here.
      <img
        src={src}
        alt=""
        className={cn('rounded-full object-cover', SIZES[size], className)}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        SIZES[size],
        tintFor(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
