import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { IconChevronLeft } from '@/components/ui/icons'

/**
 * An honest placeholder.
 *
 * The brief is explicit that we must not generate fake functionality and pretend it is
 * production-ready. Where a Phase 2/3 feature is linked from Phase 1 navigation, this
 * says plainly what is not built yet and offers the route that works today — rather than
 * a screen of invented data or a dead link.
 */
export function ComingNext({
  title,
  phase,
  description,
  backHref,
  backLabel,
  alternative,
}: {
  title: string
  phase: string
  description: string
  backHref: string
  backLabel: string
  alternative?: { label: string; href: string }
}) {
  return (
    <div className="space-y-5">
      <Link
        href={backHref}
        className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full pl-1 pr-3 text-body-sm font-semibold text-ink-muted"
      >
        <IconChevronLeft size={18} />
        {backLabel}
      </Link>

      <h1 className="text-title text-ink">{title}</h1>

      <Card>
        <p className="text-overline uppercase text-ink-muted">{phase}</p>
        <p className="mt-2 text-body text-ink">{description}</p>
        {alternative ? (
          <Link
            href={alternative.href}
            className="mt-5 flex h-11 items-center justify-center rounded-md bg-brand font-semibold text-white"
          >
            {alternative.label}
          </Link>
        ) : null}
      </Card>
    </div>
  )
}
