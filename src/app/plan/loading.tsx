import { Skeleton } from '@/components/ui/skeleton'

export default function PlanLoading() {
  return (
    <div className="h-screen flex flex-col p-4 md:p-6 overflow-hidden space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        {/* Blocks */}
        <div className="flex-[7] space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
        {/* Sidebar */}
        <div className="flex-[3]">
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
