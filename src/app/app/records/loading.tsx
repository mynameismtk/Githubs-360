import { Skeleton } from '@/components/ui/states'

export default function RecordsLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-lg" />
        ))}
      </div>
      <div>
        <Skeleton className="mb-3 h-3 w-32" />
        <div className="space-y-3 pl-6">
          <Skeleton className="h-[86px] rounded-lg" />
          <Skeleton className="h-[86px] rounded-lg" />
        </div>
      </div>
    </div>
  )
}
