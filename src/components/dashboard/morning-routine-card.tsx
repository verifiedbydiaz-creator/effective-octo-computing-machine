'use client'

import { useState, useCallback } from 'react'
import type { DailyPlan, TimeBlock } from '@/lib/types'
import { useToast } from '@/lib/toast-store'

interface Props {
  plan: DailyPlan | null
  gymBlock: TimeBlock | null
}

export function MorningRoutineCard({ plan, gymBlock }: Props) {
  const [wakeTime, setWakeTime] = useState(plan?.wake_time ?? '')
  const [deskByTime, setDeskByTime] = useState(plan?.desk_by_time ?? '')
  const [gymDone, setGymDone] = useState(gymBlock?.completed ?? false)
  const toast = useToast()

  const updatePlan = useCallback(
    async (patch: { wake_time?: string | null; desk_by_time?: string | null }) => {
      if (!plan) return
      const res = await fetch(`/api/daily-plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) toast('Failed to save', 'error')
    },
    [plan, toast]
  )

  const toggleGym = useCallback(async () => {
    if (!gymBlock) return
    const next = !gymDone
    setGymDone(next)
    const response = await fetch(`/api/time-blocks/${gymBlock.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: next }),
    })
    if (!response.ok) {
      setGymDone(!next)
      toast('Failed to update gym', 'error')
    }
  }, [gymBlock, gymDone, toast])

  function wakeTimeStatus(): { label: string; color: string } | null {
    if (!wakeTime) return null
    const [h, m] = wakeTime.split(':').map(Number)
    const actual = h * 60 + m
    const target = 6 * 60 // 06:00
    if (actual <= target) return { label: 'on time', color: '#10B981' }
    const late = actual - target
    return { label: `${late}m late`, color: late > 30 ? '#F43F5E' : '#F59E0B' }
  }

  const wakeStatus = wakeTimeStatus()

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
      <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
        Morning Routine
      </h2>

      <div className="space-y-4">
        {/* Wake time */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-zinc-400">Wake time</span>
            <div className="flex items-center gap-2">
              {wakeStatus && (
                <span className="text-xs font-medium" style={{ color: wakeStatus.color }}>
                  {wakeStatus.label}
                </span>
              )}
              <span className="text-xs text-zinc-600">target 06:00</span>
            </div>
          </div>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            onBlur={() => updatePlan({ wake_time: wakeTime || null })}
            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Gym toggle */}
        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center gap-2.5">
            <span className="text-base leading-none">💪</span>
            <div>
              <p className="text-sm text-zinc-300">Gym</p>
              {!gymBlock && (
                <p className="text-xs text-zinc-600">no block scheduled</p>
              )}
            </div>
          </div>
          <button
            onClick={toggleGym}
            disabled={!gymBlock}
            aria-label={gymDone ? 'Mark gym incomplete' : 'Mark gym complete'}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-40 disabled:cursor-not-allowed ${
              gymDone ? 'bg-rose-500' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                gymDone ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Desk-by time */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-zinc-400">Desk by</span>
            <span className="text-xs text-zinc-600">target 09:00</span>
          </div>
          <input
            type="time"
            value={deskByTime}
            onChange={(e) => setDeskByTime(e.target.value)}
            onBlur={() => updatePlan({ desk_by_time: deskByTime || null })}
            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
