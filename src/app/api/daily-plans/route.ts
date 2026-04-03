import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'date query param required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('date', date)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? null })
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('daily_plans')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
