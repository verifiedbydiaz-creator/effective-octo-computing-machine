import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { setCheckIn } from '@/lib/daily-metrics'
import type { DailyMetrics } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const { data, error } = await supabase
    .from('daily_metrics')
    .select('*')
    .eq('date', date)
    .single()

  if (error?.code === 'PGRST116') return NextResponse.json({ data: null })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data as DailyMetrics })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { date, ...updates } = body as {
    date: string
    weight_lbs?: number | null
    calories?: number | null
  }

  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  await setCheckIn(date, updates)

  const { data, error } = await supabase
    .from('daily_metrics')
    .select('*')
    .eq('date', date)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data as DailyMetrics })
}
