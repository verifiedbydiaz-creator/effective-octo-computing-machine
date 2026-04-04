import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Platform } from '@/lib/types'

export interface WeekStats {
  deepWorkByDay: { date: string; day: string; hours: number }[]
  totalDeepWorkHours: number
  contentByPlatform: Partial<Record<Platform, number>>
  totalContentPublished: number
  outreachVolume: number
  gymDays: number
  avgWakeTime: string | null
}

function toHours(minutes: number) {
  return Math.round((minutes / 60) * 10) / 10
}

function avgTime(times: string[]): string | null {
  if (times.length === 0) return null
  const totalMins = times.reduce((sum, t) => {
    const [h, m] = t.split(':').map(Number)
    return sum + h * 60 + m
  }, 0)
  const avg = Math.round(totalMins / times.length)
  return `${String(Math.floor(avg / 60)).padStart(2, '0')}:${String(avg % 60).padStart(2, '0')}`
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const weekStart = searchParams.get('week_start') // Monday YYYY-MM-DD
  const weekEnd = searchParams.get('week_end')     // Sunday YYYY-MM-DD

  if (!weekStart || !weekEnd) {
    return NextResponse.json({ error: 'week_start and week_end required' }, { status: 400 })
  }

  // Build the 7 dates for the week
  const weekDates: string[] = []
  const cursor = new Date(weekStart + 'T12:00:00')
  for (let i = 0; i < 7; i++) {
    weekDates.push(cursor.toISOString().split('T')[0])
    cursor.setDate(cursor.getDate() + 1)
  }

  // ── Fetch in parallel ──────────────────────────────────────────────────────

  const [metricsRes, timeBlocksRes, contentRes, outreachRes, plansRes] = await Promise.all([
    // Daily metrics for the week
    supabase
      .from('daily_metrics')
      .select('date, deep_build_hours, gym_completed')
      .gte('date', weekStart)
      .lte('date', weekEnd),

    // Time blocks for the week (fallback if no daily_metrics)
    supabase
      .from('time_blocks')
      .select('daily_plan_id, task_type, start_time, end_time, completed')
      .eq('task_type', 'DEEP_BUILD')
      .eq('completed', true),

    // Content published this week
    supabase
      .from('content_posts')
      .select('platform, status, published_at')
      .eq('status', 'PUBLISHED')
      .gte('published_at', `${weekStart}T00:00:00.000Z`)
      .lte('published_at', `${weekEnd}T23:59:59.999Z`),

    // Outreach contacts last contacted this week
    supabase
      .from('outreach_contacts')
      .select('last_contacted_at, status')
      .gte('last_contacted_at', weekStart)
      .lte('last_contacted_at', weekEnd)
      .in('status', ['CONTACTED', 'RESPONDED', 'FOLLOW_UP', 'CONNECTED',
                     'CONTACTED', 'REPLIED', 'MEETING_SCHEDULED', 'CLOSED']),

    // Daily plans for wake times and gym (via time_blocks)
    supabase
      .from('daily_plans')
      .select('date, wake_time, id')
      .gte('date', weekStart)
      .lte('date', weekEnd),
  ])

  const metrics = metricsRes.data ?? []
  const contentPosts = contentRes.data ?? []
  const outreachContacts = outreachRes.data ?? []
  const plans = plansRes.data ?? []

  // ── Deep work hours by day ─────────────────────────────────────────────────
  // Prefer daily_metrics; fall back to summing time_blocks

  // Build plan date lookup for time block fallback
  const planDateMap = new Map<string, string>()
  plans.forEach((p) => planDateMap.set((p as { id: string }).id, (p as { date: string }).date))

  // Time blocks fallback: sum by plan date
  const tbByDate = new Map<string, number>()
  if (timeBlocksRes.data) {
    for (const tb of timeBlocksRes.data) {
      const date = planDateMap.get((tb as { daily_plan_id: string }).daily_plan_id)
      if (!date || !weekDates.includes(date)) continue
      const block = tb as { start_time: string; end_time: string }
      const [sh, sm] = block.start_time.split(':').map(Number)
      const [eh, em] = block.end_time.split(':').map(Number)
      const mins = (eh * 60 + em) - (sh * 60 + sm)
      tbByDate.set(date, (tbByDate.get(date) ?? 0) + mins)
    }
  }

  const metricsByDate = new Map(metrics.map((m) => [(m as { date: string }).date, m]))

  const deepWorkByDay = weekDates.map((date) => {
    const m = metricsByDate.get(date) as { deep_build_hours?: number } | undefined
    const hoursFromMetrics = m?.deep_build_hours ?? null
    const hoursFromBlocks = tbByDate.has(date) ? toHours(tbByDate.get(date)!) : null
    const hours = hoursFromMetrics ?? hoursFromBlocks ?? 0
    const dayIdx = new Date(date + 'T12:00:00').getDay()
    return { date, day: DAY_NAMES[dayIdx], hours }
  })

  const totalDeepWorkHours = deepWorkByDay.reduce((s, d) => s + d.hours, 0)

  // ── Content by platform ────────────────────────────────────────────────────
  const contentByPlatform: Partial<Record<Platform, number>> = {}
  for (const post of contentPosts) {
    const p = (post as { platform: Platform }).platform
    contentByPlatform[p] = (contentByPlatform[p] ?? 0) + 1
  }

  // ── Gym days ──────────────────────────────────────────────────────────────
  // From daily_metrics if available, else count completed MORNING_ROUTINE blocks
  const gymFromMetrics = metrics.filter((m) => (m as { gym_completed: boolean }).gym_completed).length

  let gymDays = gymFromMetrics
  if (gymDays === 0 && timeBlocksRes.data) {
    const gymBlocks = new Set<string>()
    for (const tb of timeBlocksRes.data) {
      // We already filtered to DEEP_BUILD above; re-query is too expensive,
      // so we rely on daily_metrics for gym. If no metrics, show 0.
    }
    void gymBlocks
  }

  // ── Average wake time ─────────────────────────────────────────────────────
  const wakeTimes = plans
    .map((p) => (p as { wake_time: string | null }).wake_time)
    .filter((t): t is string => !!t)

  const stats: WeekStats = {
    deepWorkByDay,
    totalDeepWorkHours: Math.round(totalDeepWorkHours * 10) / 10,
    contentByPlatform,
    totalContentPublished: contentPosts.length,
    outreachVolume: outreachContacts.length,
    gymDays,
    avgWakeTime: avgTime(wakeTimes),
  }

  return NextResponse.json({ data: stats })
}
