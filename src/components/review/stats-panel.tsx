import type { WeekStats } from '@/app/api/weekly-reviews/stats/route'
import { PLATFORM_LABEL } from '@/components/content/content-constants'
import type { Platform } from '@/lib/types'

interface Props {
  stats: WeekStats
}

function StatCard({ value, unit, label, color, sublabel }: {
  value: string
  unit: string
  label: string
  color: string
  sublabel?: string
}) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 relative overflow-hidden">
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tabular-nums tracking-tight" style={{ color }}>
          {value}
        </span>
        <span className="text-sm text-zinc-500">{unit}</span>
      </div>
      <p className="text-sm font-medium text-zinc-300 mt-1.5">{label}</p>
      {sublabel && <p className="text-xs text-zinc-600 mt-0.5">{sublabel}</p>}
    </div>
  )
}

export function StatsPanel({ stats }: Props) {
  const contentEntries = Object.entries(stats.contentByPlatform) as [Platform, number][]

  return (
    <div className="space-y-4">
      {/* Primary stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          value={String(stats.totalDeepWorkHours)}
          unit="hrs"
          label="Deep Work"
          color="#8B5CF6"
          sublabel="target 25h/week"
        />
        <StatCard
          value={String(stats.totalContentPublished)}
          unit="posts"
          label="Published"
          color="#3B82F6"
          sublabel={contentEntries.length > 0
            ? contentEntries.map(([p, n]) => `${n} ${PLATFORM_LABEL[p]}`).join(', ')
            : 'no data'}
        />
        <StatCard
          value={String(stats.outreachVolume)}
          unit="contacts"
          label="Outreach"
          color="#10B981"
          sublabel="contacted this week"
        />
        <StatCard
          value={String(stats.gymDays)}
          unit="days"
          label="Gym"
          color="#F43F5E"
          sublabel="target 5/week"
        />
      </div>

      {/* Secondary stat */}
      {stats.avgWakeTime && (
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl">
          <span className="text-2xl font-bold tabular-nums text-amber-400">
            {stats.avgWakeTime}
          </span>
          <div>
            <p className="text-sm font-medium text-zinc-300">Avg Wake Time</p>
            <p className="text-xs text-zinc-600">target 06:00</p>
          </div>
        </div>
      )}
    </div>
  )
}
