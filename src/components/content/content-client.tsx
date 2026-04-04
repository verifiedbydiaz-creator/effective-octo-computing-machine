'use client'

import { useState } from 'react'
import { WeeklyGrid } from './weekly-grid'
import { IdeasBank } from './ideas-bank'
import { PodcastSection } from './podcast-section'
import type { ContentPost, OutreachContact } from '@/lib/types'

interface Props {
  weekPosts: ContentPost[]
  ideas: ContentPost[]
  podcastGuests: OutreachContact[]
  today: string
}

export function ContentClient({ weekPosts, ideas, podcastGuests, today }: Props) {
  // When an idea is scheduled it should appear in the grid immediately
  const [extraGridPosts, setExtraGridPosts] = useState<ContentPost[]>([])

  function handleIdeaScheduled(post: ContentPost) {
    setExtraGridPosts((prev) => [...prev, post])
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Content</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Publishing tracker, ideas bank, and podcast pipeline</p>
      </div>

      {/* Weekly grid */}
      <section>
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Weekly Publishing Grid
        </h2>
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
          <WeeklyGrid
            initialPosts={[...weekPosts, ...extraGridPosts]}
            today={today}
          />
        </div>
      </section>

      {/* Bottom two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ideas bank — 2/3 width */}
        <section className="lg:col-span-2">
          <IdeasBank
            initialIdeas={ideas}
            onIdeaScheduled={handleIdeaScheduled}
          />
        </section>

        {/* Podcast section — 1/3 width */}
        <section>
          <PodcastSection initialGuests={podcastGuests} />
        </section>
      </div>
    </div>
  )
}
