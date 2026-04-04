import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { incrementContentPublished, decrementContentPublished } from '@/lib/daily-metrics'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body = await request.json()

  // Track publish/unpublish transitions
  if ('status' in body) {
    const { data: existing } = await supabase
      .from('content_posts')
      .select('status, published_at')
      .eq('id', id)
      .single()

    const post = existing as { status: string; published_at: string | null } | null
    const today = new Date().toISOString().split('T')[0]

    if (post) {
      const wasPublished = post.status === 'PUBLISHED'
      const willPublish = body.status === 'PUBLISHED'

      if (!wasPublished && willPublish) {
        await incrementContentPublished(today)
      } else if (wasPublished && !willPublish) {
        // Use the original publish date for decrement so the right day's count changes
        const publishDate = post.published_at?.split('T')[0] ?? today
        await decrementContentPublished(publishDate)
      }
    }
  }

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
