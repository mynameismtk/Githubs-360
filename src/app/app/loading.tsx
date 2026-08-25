import { Skeleton } from '@/components/ui/states'

/**
 * Skeletons mirror the real layout's dimensions so nothing reflows when data lands.
 * A centred spinner would say "something is happening"; this says "your appointment
 * card is arriving", which is a materially calmer experience. docs/06 §4.
 */
export default function HomeLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-2 h-9 w-44" />
      </div>
      <div>
        <Skeleton className="mb-3 h-3 w-28" />
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex gap-3.5">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-24" />
              <Skeleton className="mt-4 h-5 w-52" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <Skeleton className="mb-3 h-3 w-32" />
        <div className="space-y-2.5">
          <Skeleton className="h-[72px] rounded-lg" />
          <Skeleton className="h-[72px] rounded-lg" />
        </div>
      </div>
      <div>
        <Skeleton className="mb-3 h-3 w-24" />
        <div className="grid grid-cols-2 gap-2.5">
          <Skeleton className="h-[84px] rounded-lg" />
          <Skeleton className="h-[84px] rounded-lg" />
          <Skeleton className="h-[84px] rounded-lg" />
          <Skeleton className="h-[84px] rounded-lg" />
        </div>
      </div>
    </div>
  )
}
