'use client'

import { useState } from 'react'
import { Scale, Flame, CheckCircle2 } from 'lucide-react'

interface Props {
  date: string
  initialWeight: number | null
  initialCalories: number | null
}

export function DailyCheckIn({ date, initialWeight, initialCalories }: Props) {
  const [weight, setWeight] = useState(initialWeight?.toString() ?? '')
  const [calories, setCalories] = useState(initialCalories?.toString() ?? '')
  const [saved, setSaved] = useState(false)

  async function save(field: 'weight_lbs' | 'calories', value: string) {
    const parsed = value === '' ? null : parseFloat(value)
    if (value !== '' && (isNaN(parsed!) || parsed! <= 0)) return

    await fetch('/api/daily-metrics', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, [field]: parsed }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-white/8 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Daily Check-In
        </h3>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle2 size={12} />
            Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Weight */}
        <div>
          <label className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5">
            <Scale size={12} />
            Weight (lbs)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={(e) => save('weight_lbs', e.target.value)}
            placeholder="—"
            className="w-full bg-zinc-800 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Calories */}
        <div>
          <label className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5">
            <Flame size={12} />
            Calories
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            onBlur={(e) => save('calories', e.target.value)}
            placeholder="—"
            className="w-full bg-zinc-800 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
