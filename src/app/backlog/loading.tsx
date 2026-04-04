import { Skeleton } from '@/components/ui/skeleton'

export default function BacklogLoading() {
  return (
    <div className="flex flex-col h-screen p-4 md:p-6 overflow-hidden space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-lg" />
        ))}
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 flex-1 min-h-0 overflow-x-auto">
        {[...Array(4)].map((_, col) => (
          <div key={col} className="flex-shrink-0 w-72 space-y-2">
            <Skeleton className="h-6 w-24 rounded-lg" />
            {[...Array(3 - (col % 2))].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
