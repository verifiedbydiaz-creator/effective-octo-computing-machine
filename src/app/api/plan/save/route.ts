import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { TaskType } from '@/lib/types'

interface BlockInput {
  title: string
  start_time: string
  end_time: string
  task_type: TaskType | null
  gcal_event_id: string | null
}

interface SavePlanBody {
  date: string
  notes: string | null
  wake_time: string | null
  desk_by_time: string | null
  blocks: BlockInput[]
}

export async function POST(request: Request) {
  const body = await request.json() as SavePlanBody
  const { date, notes, wake_time, desk_by_time, blocks } = body

  // Upsert daily plan
  const { data: existing } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('date', date)
    .single()

  let planId: string

  if (existing) {
    planId = (existing as { id: string }).id
    await supabase
      .from('daily_plans')
      .update({ notes, wake_time, desk_by_time })
      .eq('id', planId)
  } else {
    const { data: newPlan, error: insertError } = await supabase
      .from('daily_plans')
      .insert({ date, notes, wake_time, desk_by_time })
      .select('id')
      .single()

    if (insertError || !newPlan) {
      return NextResponse.json({ error: insertError?.message ?? 'Insert failed' }, { status: 500 })
    }
    planId = (newPlan as { id: string }).id
  }

  // Delete existing time blocks for this plan
  await supabase.from('time_blocks').delete().eq('daily_plan_id', planId)

  // Re-insert all blocks preserving gcal_event_id
  if (blocks.length > 0) {
    const rows = blocks.map((b) => ({
      daily_plan_id: planId,
      title: b.title,
      start_time: b.start_time,
      end_time: b.end_time,
      task_type: b.task_type ?? 'DEEP_BUILD', // fallback — task_type is non-null in DB
      completed: false,
      notes: null,
      gcal_event_id: b.gcal_event_id,
    }))

    const { data: insertedBlocks, error: blocksError } = await supabase
      .from('time_blocks')
      .insert(rows)
      .select()

    if (blocksError) {
      return NextResponse.json({ error: blocksError.message }, { status: 500 })
    }

    return NextResponse.json({ plan_id: planId, blocks: insertedBlocks })
  }

  return NextResponse.json({ plan_id: planId, blocks: [] })
}
