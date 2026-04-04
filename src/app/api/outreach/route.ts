import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  let query = supabase.from('outreach_contacts').select('*')
  if (category) query = query.eq('category', category)
  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('outreach_contacts')
    .insert({
      name: body.name,
      company: body.company ?? null,
      role: body.role ?? null,
      platform: body.platform ?? null,
      profile_url: body.profile_url ?? null,
      status: body.status ?? 'TO_CONTACT',
      category: body.category ?? null,
      last_contacted_at: body.last_contacted_at ?? null,
      notes: body.notes ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
