import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body = await request.json()

  const { data, error } = await supabase
    .from('content_posts')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const { error } = await supabase.from('content_posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
