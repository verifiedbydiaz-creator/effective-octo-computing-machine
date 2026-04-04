import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { ReviewClient } from '@/components/review/review-client'

export const metadata: Metadata = { title: 'Weekly Review' }
import { getWeekStart, getWeekEnd } from '@/components/review/review-constants'
import type { WeeklyReview } from '@/lib/types'
import type { WeekStats } from '@/app/api/weekly-reviews/stats/route'

async function fetchStats(weekStart: string, weekEnd: string): Promise<WeekStats> {
  const weekDates: string[] = []
  const cursor = new Date(weekStart + 'T12:00:00')
  for (let i = 0; i < 7; i++) {
    weekDates.push(cursor.toISOString().split('T')[0])
    cursor.setDate(cursor.getDate() + 1)
  }

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const [metricsRes, plansRes, contentRes, outreachRes] = await Promise.all([
    supabase.from('daily_metrics').select('date, deep_build_hours, gym_completed')
      .gte('date', weekStart).lte('date', weekEnd),
    supabase.from('daily_plans').select('date, wake_time')
      .gte('date', weekStart).lte('date', weekEnd),
    supabase.from('content_posts').select('platform').eq('status', 'PUBLISHED')
      .gte('published_at', `${weekStart}T00:00:00.000Z`)
      .lte('published_at', `${weekEnd}T23:59:59.999Z`),
    supabase.from('outreach_contacts').select('id')
      .gte('last_contacted_at', weekStart).lte('last_contacted_at', weekEnd)
      .in('status', ['CONTACTED', 'RESPONDED', 'FOLLOW_UP', 'CONNECTED', 'REPLIED', 'MEETING_SCHEDULED']),
  ])

  type MetricRow = { date: string; deep_build_hours: number; gym_completed: boolean }
  type PlanRow = { date: string; wake_time: string | null }
  type ContentRow = { platform: string }

  const metrics = (metricsRes.data ?? []) as MetricRow[]
  const plans = (plansRes.data ?? []) as PlanRow[]
  const content = (contentRes.data ?? []) as ContentRow[]

  const metricsByDate = new Map(metrics.map((m) => [m.date, m]))

  const deepWorkByDay = weekDates.map((date) => {
    const m = metricsByDate.get(date)
    const hours = m?.deep_build_hours ?? 0
    const dayIdx = new Date(date + 'T12:00:00').getDay()
    return { date, day: DAY_NAMES[dayIdx], hours }
  })

  const contentByPlatform: Record<string, number> = {}
  content.forEach((p) => {
    contentByPlatform[p.platform] = (contentByPlatform[p.platform] ?? 0) + 1
  })

  const wakeTimes = plans.map((p) => p.wake_time).filter(Boolean) as string[]
  let avgWakeTime: string | null = null
  if (wakeTimes.length > 0) {
    const totalMins = wakeTimes.reduce((s, t) => {
      const [h, m] = t.split(':').map(Number)
      return s + h * 60 + m
    }, 0)
    const avg = Math.round(totalMins / wakeTimes.length)
    avgWakeTime = `${String(Math.floor(avg / 60)).padStart(2, '0')}:${String(avg % 60).padStart(2, '0')}`
  }

  return {
    deepWorkByDay,
    totalDeepWorkHours: Math.round(deepWorkByDay.reduce((s, d) => s + d.hours, 0) * 10) / 10,
    contentByPlatform: contentByPlatform as WeekStats['contentByPlatform'],
    totalContentPublished: content.length,
    outreachVolume: (outreachRes.data ?? []).length,
    gymDays: metrics.filter((m) => m.gym_completed).length,
    avgWakeTime,
  }
}

export default async function ReviewPage() {
  const today = new Date().toISOString().split('T')[0]
  const weekStart = getWeekStart(new Date(today + 'T12:00:00'))
  const weekEnd = getWeekEnd(weekStart)

  const [reviewRes, stats] = await Promise.all([
    supabase.from('weekly_reviews').select('*').eq('week_start', weekStart).single(),
    fetchStats(weekStart, weekEnd),
  ])

  const review = reviewRes.error?.code === 'PGRST116'
    ? null
    : (reviewRes.data as WeeklyReview | null)

  return (
    <ReviewClient
      initialWeekStart={weekStart}
      initialReview={review}
      initialStats={stats}
    />
  )
}
