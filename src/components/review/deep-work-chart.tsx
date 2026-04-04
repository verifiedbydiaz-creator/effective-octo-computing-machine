'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import type { WeekStats } from '@/app/api/weekly-reviews/stats/route'

interface Props {
  data: WeekStats['deepWorkByDay']
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-zinc-400 mb-0.5">{label}</p>
      <p className="font-semibold text-violet-300">{payload[0].value}h deep work</p>
    </div>
  )
}

export function DeepWorkChart({ data }: Props) {
  const maxHours = Math.max(...data.map((d) => d.hours), 5)
  const totalHours = data.reduce((s, d) => s + d.hours, 0)
  const daysWithWork = data.filter((d) => d.hours > 0).length

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Deep Work by Day</h3>
          <p className="text-xs text-zinc-600 mt-0.5">{totalHours}h total · {daysWithWork} active days</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-600">weekly target</p>
          <p className="text-sm font-semibold text-violet-400">25h</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, Math.ceil(maxHours)]}
            tick={{ fill: '#52525b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickCount={4}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine y={5} stroke="#8B5CF630" strokeDasharray="4 3" />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.hours >= 5 ? '#8B5CF6' : entry.hours >= 3 ? '#7C3AED' : entry.hours > 0 ? '#5B21B6' : '#27272a'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Day dots legend */}
      <div className="flex justify-around mt-3">
        {data.map((d) => (
          <div key={d.date} className="flex flex-col items-center gap-1">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: d.hours >= 5 ? '#8B5CF6' : d.hours > 0 ? '#5B21B6' : '#27272a' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
