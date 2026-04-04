import { Skeleton } from '@/components/ui/skeleton'

export default function OutreachLoading() {
  return (
    <div className="flex flex-col h-screen p-4 md:p-6 overflow-hidden space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-lg" />
        ))}
      </div>

      {/* Pipeline columns */}
      <div className="flex gap-4 flex-1 min-h-0 overflow-x-auto">
        {[...Array(5)].map((_, col) => (
          <div key={col} className="flex-shrink-0 w-64 space-y-2">
            <Skeleton className="h-6 w-20 rounded-lg" />
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
