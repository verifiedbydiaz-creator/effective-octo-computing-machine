import { supabase } from '@/lib/supabase'
import { DailyScorecard } from '@/components/dashboard/daily-scorecard'
import { StreakCounters } from '@/components/dashboard/streak-counters'
import { MorningRoutineCard } from '@/components/dashboard/morning-routine-card'
import { TimeBlocksList } from '@/components/dashboard/time-blocks-list'
import { QuickAddButton } from '@/components/dashboard/quick-add-button'
import type { DailyPlan, TimeBlock, DailyMetrics } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

function calcStreak(
  metrics: DailyMetrics[],
  today: string,
  condition: (m: DailyMetrics) => boolean
): number {
  const byDate = new Map(metrics.map((m) => [m.date, m]))
  let streak = 0
  const cursor = new Date(today + 'T12:00:00') // noon to avoid DST issues

  // If today has no entry yet, start streak check from yesterday
  if (!byDate.has(today)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = cursor.toISOString().split('T')[0]
    const metric = byDate.get(dateStr)
    if (!metric || !condition(metric)) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const today = new Date().toISOString().split('T')[0]

  // Get or create today's daily plan
  let plan: DailyPlan | null = null
  const { data: existingPlan } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('date', today)
    .single()

  if (existingPlan) {
    plan = existingPlan
  } else {
    const { data: newPlan } = await supabase
      .from('daily_plans')
      .insert({ date: today, wake_time: null, desk_by_time: null, notes: null })
      .select()
      .single()
    plan = newPlan
  }

  // Fetch time blocks for today
  let timeBlocks: TimeBlock[] = []
  if (plan) {
    const { data } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('daily_plan_id', plan.id)
      .order('start_time')
    timeBlocks = data ?? []
  }

  // Content published today
  const { count: contentCount } = await supabase
    .from('content_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PUBLISHED')
    .gte('published_at', `${today}T00:00:00.000Z`)
    .lte('published_at', `${today}T23:59:59.999Z`)

  // Outreach contacted today
  const { count: outreachCount } = await supabase
    .from('outreach_contacts')
    .select('*', { count: 'exact', head: true })
    .gte('last_contacted_at', `${today}T00:00:00.000Z`)
    .lte('last_contacted_at', `${today}T23:59:59.999Z`)

  // Daily metrics for the last 60 days (streak calculation)
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  const { data: metrics } = await supabase
    .from('daily_metrics')
    .select('*')
    .gte('date', sixtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })
  const allMetrics = metrics ?? []

  // ── Scorecard calculations ────────────────────────────────────────────────
  const completedBlocks = timeBlocks.filter((b) => b.completed)
  const deepWorkMinutes = completedBlocks
    .filter((b) => b.task_type === 'DEEP_BUILD')
    .reduce((sum, b) => sum + calcMinutes(b.start_time, b.end_time), 0)
  const learningMinutes = completedBlocks
    .filter((b) => b.task_type === 'LEARNING')
    .reduce((sum, b) => sum + calcMinutes(b.start_time, b.end_time), 0)

  // ── Streak calculations ───────────────────────────────────────────────────
  const gymStreak = calcStreak(allMetrics, today, (m) => m.gym_completed)
  const contentStreak = calcStreak(allMetrics, today, (m) => m.content_publish_count > 0)
  const deepWorkStreak = calcStreak(allMetrics, today, (m) => m.deep_build_hours >= 5)

  const gymBlock = timeBlocks.find((b) => b.task_type === 'MORNING_ROUTINE') ?? null

  return (
    <div className="p-4 md:p-6 max-w-5xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{formatDate(today)}</p>
      </div>

      {/* Scorecard — big numbers row */}
      <DailyScorecard
        deepWorkMinutes={deepWorkMinutes}
        contentPublished={contentCount ?? 0}
        outreachSent={outreachCount ?? 0}
        learningMinutes={learningMinutes}
      />

      {/* Main grid: sidebar cards + time blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          <MorningRoutineCard plan={plan} gymBlock={gymBlock} />
          <StreakCounters
            gymStreak={gymStreak}
            contentStreak={contentStreak}
            deepWorkStreak={deepWorkStreak}
          />
        </div>

        {/* Right column — schedule takes 2/3 */}
        <div className="lg:col-span-2">
          <TimeBlocksList initialBlocks={timeBlocks} dailyPlanId={plan?.id ?? ''} />
        </div>
      </div>

      {/* Floating quick-add button */}
      <QuickAddButton />
    </div>
  )
}
