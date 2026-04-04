import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const weekStart = searchParams.get('week_start') // YYYY-MM-DD (Monday)
  const weekEnd = searchParams.get('week_end')     // YYYY-MM-DD (Sunday)
  const status = searchParams.get('status')

  let query = supabase.from('content_posts').select('*')

  if (weekStart && weekEnd) {
    query = query
      .gte('scheduled_at', weekStart)
      .lte('scheduled_at', weekEnd)
  }

  if (status) {
    query = query.eq('status', status)
  }

  query = query.order('scheduled_at').order('created_at')

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('content_posts')
    .insert({
      title: body.title,
      body: body.body ?? null,
      platform: body.platform,
      status: body.status ?? 'IDEA',
      scheduled_at: body.scheduled_at ?? null,
      published_at: body.published_at ?? null,
      post_link: body.post_link ?? null,
      notes: body.notes ?? null,
      tags: body.tags ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
