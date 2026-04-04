import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('backlog_items')
    .insert({
      title: body.title,
      description: body.description ?? null,
      task_type: body.task_type,
      priority: body.priority,
      status: body.status ?? 'TODO',
      estimated_minutes: body.estimated_minutes ?? null,
      due_date: body.due_date ?? null,
      parent_id: body.parent_id ?? null,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

export async function GET() {
  const { data, error } = await supabase
    .from('backlog_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
