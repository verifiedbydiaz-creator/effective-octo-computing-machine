interface Props {
  gymStreak: number
  contentStreak: number
  deepWorkStreak: number
}

const streakConfig = [
  {
    key: 'gym' as const,
    label: 'Gym',
    sublabel: 'consecutive days',
    icon: '💪',
    color: '#F43F5E',
  },
  {
    key: 'content' as const,
    label: 'Content published',
    sublabel: 'consecutive days',
    icon: '✍️',
    color: '#3B82F6',
  },
  {
    key: 'deepWork' as const,
    label: 'Deep work 5h+',
    sublabel: 'consecutive days',
    icon: '🧠',
    color: '#8B5CF6',
  },
]

export function StreakCounters({ gymStreak, contentStreak, deepWorkStreak }: Props) {
  const values = { gym: gymStreak, content: contentStreak, deepWork: deepWorkStreak }

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
      <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
        Streaks
      </h2>
      <div className="space-y-4">
        {streakConfig.map(({ key, label, sublabel, icon, color }) => {
          const count = values[key]
          const isActive = count > 0
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg leading-none">{icon}</span>
                <div>
                  <p className="text-sm text-zinc-300 leading-tight">{label}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{sublabel}</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: isActive ? color : '#52525b' }}
                >
                  {count}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
