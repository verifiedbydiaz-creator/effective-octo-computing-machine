import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { incrementOutreach, CONTACTED_STATUSES } from '@/lib/daily-metrics'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body = await request.json()

  // Track first contact transition
  if ('status' in body && CONTACTED_STATUSES.has(body.status)) {
    const { data: existing } = await supabase
      .from('outreach_contacts')
      .select('status')
      .eq('id', id)
      .single()

    const contact = existing as { status: string } | null
    const wasContacted = contact ? CONTACTED_STATUSES.has(contact.status) : false

    if (!wasContacted) {
      const today = new Date().toISOString().split('T')[0]
      await incrementOutreach(today)
    }
  }

  const { data, error } = await supabase
    .from('outreach_contacts')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const { error } = await supabase.from('outreach_contacts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
