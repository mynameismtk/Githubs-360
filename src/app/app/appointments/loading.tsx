import { Skeleton } from '@/components/ui/states'

export default function AppointmentsLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-44" />
      <div>
        <Skeleton className="mb-3 h-3 w-20" />
        <div className="space-y-2.5">
          <Skeleton className="h-[116px] rounded-lg" />
          <Skeleton className="h-[116px] rounded-lg" />
        </div>
      </div>
      <div>
        <Skeleton className="mb-3 h-3 w-16" />
        <Skeleton className="h-[116px] rounded-lg" />
      </div>
    </div>
  )
}
