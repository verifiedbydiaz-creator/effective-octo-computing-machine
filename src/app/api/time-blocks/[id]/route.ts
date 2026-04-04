import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  addDeepWorkMinutes,
  subtractDeepWorkMinutes,
  addLearningMinutes,
  subtractLearningMinutes,
  blockMinutes,
} from '@/lib/daily-metrics'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  // If toggling completed, fetch current state first to handle metrics
  if ('completed' in body) {
    const { data: existing } = await supabase
      .from('time_blocks')
      .select('completed, task_type, start_time, end_time, daily_plan_id')
      .eq('id', id)
      .single()

    const block = existing as {
      completed: boolean
      task_type: string
      start_time: string
      end_time: string
      daily_plan_id: string
    } | null

    if (block && block.completed !== body.completed) {
      // Look up the date from daily_plans
      const { data: plan } = await supabase
        .from('daily_plans')
        .select('date')
        .eq('id', block.daily_plan_id)
        .single()
      const date = (plan as { date: string } | null)?.date

      if (date) {
        const minutes = blockMinutes(block.start_time, block.end_time)
        if (block.task_type === 'DEEP_BUILD') {
          if (body.completed) {
            await addDeepWorkMinutes(date, minutes)
          } else {
            await subtractDeepWorkMinutes(date, minutes)
          }
        } else if (block.task_type === 'LEARNING') {
          if (body.completed) {
            await addLearningMinutes(date, minutes)
          } else {
            await subtractLearningMinutes(date, minutes)
          }
        }
      }
    }
  }

  const { data, error } = await supabase
    .from('time_blocks')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
