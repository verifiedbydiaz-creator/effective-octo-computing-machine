import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { ContentClient } from '@/components/content/content-client'
import { getWeekDays } from '@/components/content/content-constants'
import type { ContentPost, OutreachContact } from '@/lib/types'

export const metadata: Metadata = { title: 'Content' }

export default async function ContentPage() {
  const today = new Date().toISOString().split('T')[0]
  const weekDays = getWeekDays(new Date(today + 'T12:00:00'))
  const weekStart = weekDays[0]
  const weekEnd = weekDays[6]

  // Posts scheduled this week (for the grid)
  const { data: weekData } = await supabase
    .from('content_posts')
    .select('*')
    .gte('scheduled_at', weekStart)
    .lte('scheduled_at', weekEnd)
    .order('scheduled_at')

  // All ideas (no scheduled date)
  const { data: ideasData } = await supabase
    .from('content_posts')
    .select('*')
    .eq('status', 'IDEA')
    .order('created_at', { ascending: false })

  // Podcast guests
  const { data: guestsData } = await supabase
    .from('outreach_contacts')
    .select('*')
    .eq('category', 'PODCAST_GUEST')
    .order('created_at', { ascending: false })

  return (
    <ContentClient
      weekPosts={(weekData ?? []) as ContentPost[]}
      ideas={(ideasData ?? []) as ContentPost[]}
      podcastGuests={(guestsData ?? []) as OutreachContact[]}
      today={today}
    />
  )
}
