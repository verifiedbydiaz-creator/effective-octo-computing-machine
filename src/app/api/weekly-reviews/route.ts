import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const weekStart = searchParams.get('week_start')

  if (!weekStart) {
    return NextResponse.json({ error: 'week_start required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('week_start', weekStart)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? null })
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('weekly_reviews')
    .insert({
      week_start: body.week_start,
      wins: body.wins ?? null,
      losses: body.losses ?? null,
      lessons: body.lessons ?? null,
      content_analytics: body.content_analytics ?? null,
      next_week_focus: body.next_week_focus ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
