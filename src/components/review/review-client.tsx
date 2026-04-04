'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  getWeekEnd, addWeeks, formatWeekLabel, isCurrentWeek,
} from './review-constants'
import { StatsPanel } from './stats-panel'
import { DeepWorkChart } from './deep-work-chart'
import { ReviewForm } from './review-form'
import type { WeeklyReview } from '@/lib/types'
import type { WeekStats } from '@/app/api/weekly-reviews/stats/route'

interface Props {
  initialWeekStart: string
  initialReview: WeeklyReview | null
  initialStats: WeekStats
}

export function ReviewClient({ initialWeekStart, initialReview, initialStats }: Props) {
  const [weekStart, setWeekStart] = useState(initialWeekStart)
  const [review, setReview] = useState<WeeklyReview | null>(initialReview)
  const [stats, setStats] = useState<WeekStats>(initialStats)
  const [loadingStats, setLoadingStats] = useState(false)

  const weekEnd = getWeekEnd(weekStart)
  const isThisWeek = isCurrentWeek(weekStart)

  const loadWeek = useCallback(async (ws: string) => {
    const we = getWeekEnd(ws)
    setLoadingStats(true)

    const [reviewRes, statsRes] = await Promise.all([
      fetch(`/api/weekly-reviews?week_start=${ws}`),
      fetch(`/api/weekly-reviews/stats?week_start=${ws}&week_end=${we}`),
    ])

    const [reviewJson, statsJson] = await Promise.all([
      reviewRes.json(),
      statsRes.json(),
    ])

    setReview(reviewJson.data ?? null)
    if (statsJson.data) setStats(statsJson.data as WeekStats)
    setLoadingStats(false)
  }, [])

  function goBack() {
    const prev = addWeeks(weekStart, -1)
    setWeekStart(prev)
    loadWeek(prev)
  }

  function goForward() {
    const next = addWeeks(weekStart, 1)
    setWeekStart(next)
    loadWeek(next)
  }

  function goThisWeek() {
    if (isThisWeek) return
    setWeekStart(initialWeekStart)
    loadWeek(initialWeekStart)
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-6">
      {/* ── Header + week selector ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Weekly Review</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {isThisWeek ? 'Current week' : 'Past week'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center min-w-[180px]">
            <p className="text-sm font-medium text-white">{formatWeekLabel(weekStart)}</p>
            {isThisWeek && (
              <p className="text-xs text-violet-400 mt-0.5">This week</p>
            )}
          </div>
          <button
            onClick={goForward}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          {!isThisWeek && (
            <button
              onClick={goThisWeek}
              className="ml-1 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            >
              This Week
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className={loadingStats ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <StatsPanel stats={stats} />
      </div>

      {/* ── Deep work chart ─────────────────────────────────────────────────── */}
      <div className={loadingStats ? 'opacity-50 pointer-events-none' : ''}>
        <DeepWorkChart data={stats.deepWorkByDay} />
      </div>

      {/* ── Review form ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
          Reflection
        </h2>
        <ReviewForm
          key={weekStart} // re-mount when week changes to reset form state
          weekStart={weekStart}
          initialReview={review}
          onSaved={setReview}
        />
      </div>
    </div>
  )
}
