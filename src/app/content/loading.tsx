import { Skeleton } from '@/components/ui/skeleton'

export default function ContentLoading() {
  return (
    <div className="p-4 md:p-6 max-w-6xl space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Weekly grid */}
      <section className="space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-52 rounded-xl" />
      </section>

      {/* Bottom two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
