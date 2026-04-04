import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { setGymCompleted, setWakeTime } from '@/lib/daily-metrics'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  // Trigger metrics side-effects that require knowing the plan date
  if ('gym_completed' in body || 'wake_time' in body) {
    const { data: plan } = await supabase
      .from('daily_plans')
      .select('date')
      .eq('id', id)
      .single()
    const date = (plan as { date: string } | null)?.date

    if (date) {
      if ('gym_completed' in body) {
        await setGymCompleted(date, body.gym_completed as boolean)
      }
      if ('wake_time' in body) {
        await setWakeTime(date, body.wake_time as string | null)
      }
    }
  }

  const { data, error } = await supabase
    .from('daily_plans')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
