import { NextResponse } from 'next/server'
import { isGCalConnected, createCalendarEvent, updateCalendarEvent } from '@/lib/google-calendar'
import { supabase } from '@/lib/supabase'
import type { TimeBlock } from '@/lib/types'

export async function POST(request: Request) {
  if (!isGCalConnected()) {
    return NextResponse.json({ error: 'Not connected to Google Calendar' }, { status: 401 })
  }

  const { daily_plan_id } = await request.json() as { daily_plan_id: string }

  // Fetch the plan to get the date
  const { data: plan, error: planError } = await supabase
    .from('daily_plans')
    .select('date')
    .eq('id', daily_plan_id)
    .single()

  if (planError || !plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const date = (plan as { date: string }).date

  // Fetch all time blocks for this plan
  const { data: blocks, error: blocksError } = await supabase
    .from('time_blocks')
    .select('*')
    .eq('daily_plan_id', daily_plan_id)
    .order('start_time')

  if (blocksError) {
    return NextResponse.json({ error: blocksError.message }, { status: 500 })
  }

  const timeBlocks = (blocks ?? []) as TimeBlock[]
  const synced: Array<{ id: string; gcal_event_id: string }> = []
  const errors: Array<{ id: string; error: string }> = []

  for (const block of timeBlocks) {
    try {
      const input = {
        title: block.title,
        date,
        start_time: block.start_time,
        end_time: block.end_time,
        task_type: block.task_type,
      }

      let gcalEventId = block.gcal_event_id

      if (gcalEventId) {
        await updateCalendarEvent(gcalEventId, input)
      } else {
        gcalEventId = await createCalendarEvent(input)
        // Store the gcal_event_id on the time block
        await supabase
          .from('time_blocks')
          .update({ gcal_event_id: gcalEventId })
          .eq('id', block.id)
      }

      synced.push({ id: block.id, gcal_event_id: gcalEventId })
    } catch (error) {
      errors.push({
        id: block.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({ synced, errors, total: timeBlocks.length })
}
