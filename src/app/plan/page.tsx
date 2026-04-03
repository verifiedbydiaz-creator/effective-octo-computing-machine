import { supabase } from '@/lib/supabase'
import { isGCalConnected } from '@/lib/google-calendar'
import { PlannerClient } from '@/components/planner/planner-client'
import type { DailyPlan, TimeBlock, BacklogItem } from '@/lib/types'

function getTomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default async function PlanPage() {
  const tomorrow = getTomorrow()

  // Fetch tomorrow's plan (may not exist yet)
  const { data: planData } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('date', tomorrow)
    .single()

  const plan = planData as DailyPlan | null

  // Fetch time blocks for tomorrow's plan (if it exists)
  let timeBlocks: TimeBlock[] = []
  if (plan?.id) {
    const { data } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('daily_plan_id', plan.id)
      .order('start_time')
    timeBlocks = (data ?? []) as TimeBlock[]
  }

  // Fetch all open backlog items
  const { data: backlogData } = await supabase
    .from('backlog_items')
    .select('*')
    .in('status', ['TODO', 'IN_PROGRESS'])
    .order('created_at', { ascending: false })

  const backlogItems = (backlogData ?? []) as BacklogItem[]

  return (
    <div className="h-screen flex flex-col p-4 md:p-6 overflow-hidden">
      <PlannerClient
        tomorrow={tomorrow}
        initialPlan={plan}
        initialBlocks={timeBlocks}
        backlogItems={backlogItems}
        isGCalConnected={isGCalConnected()}
      />
    </div>
  )
}
