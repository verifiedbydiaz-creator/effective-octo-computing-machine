interface Props {
  deepWorkMinutes: number
  contentPublished: number
  outreachSent: number
  learningMinutes: number
}

function formatDeepWork(minutes: number): string {
  if (minutes === 0) return '0'
  const hours = minutes / 60
  // Show one decimal place, strip trailing zero
  return hours % 1 === 0 ? String(hours) : hours.toFixed(1).replace(/\.0$/, '')
}

export function DailyScorecard({
  deepWorkMinutes,
  contentPublished,
  outreachSent,
  learningMinutes,
}: Props) {
  const stats = [
    {
      value: formatDeepWork(deepWorkMinutes),
      unit: 'hrs',
      label: 'Deep Work',
      sublabel: 'target 5h',
      color: '#8B5CF6',
      met: deepWorkMinutes >= 300,
    },
    {
      value: String(contentPublished),
      unit: 'published',
      label: 'Content',
      sublabel: 'today',
      color: '#3B82F6',
      met: contentPublished >= 1,
    },
    {
      value: String(outreachSent),
      unit: 'contacts',
      label: 'Outreach',
      sublabel: 'today',
      color: '#10B981',
      met: outreachSent >= 1,
    },
    {
      value: String(learningMinutes),
      unit: 'min',
      label: 'Learning',
      sublabel: 'target 30m',
      color: '#06B6D4',
      met: learningMinutes >= 30,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-zinc-900 border border-white/10 rounded-xl p-4 relative overflow-hidden"
        >
          {/* Subtle glow when target is met */}
          {stat.met && (
            <div
              className="absolute inset-0 opacity-5 rounded-xl"
              style={{ backgroundColor: stat.color }}
            />
          )}
          <div className="relative">
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-5xl font-bold tabular-nums tracking-tight"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>
              <span className="text-sm text-zinc-500 pb-0.5">{stat.unit}</span>
            </div>
            <p className="text-sm font-medium text-zinc-300 mt-1.5">{stat.label}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{stat.sublabel}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
