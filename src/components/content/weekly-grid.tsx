'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  GRID_PLATFORMS, PLATFORM_LABEL, PLATFORM_COLOR,
  STATUS_ICON, PODCAST_DAY,
  getWeekDays, addDays, formatWeekRange, shortDay,
} from './content-constants'
import { CellDialog } from './cell-dialog'
import type { ContentPost, Platform } from '@/lib/types'

interface Props {
  initialPosts: ContentPost[]
  today: string // YYYY-MM-DD
}

// Derive cell visual state
function cellState(
  post: ContentPost | undefined,
  date: string,
  platform: Platform,
  today: string,
): { icon: string; label: string; hasPost: boolean } {
  const isPast = date < today
  const isPodcastDay =
    platform === 'YOUTUBE' &&
    new Date(date + 'T12:00:00').getDay() === PODCAST_DAY

  if (post) {
    if (post.status === 'PUBLISHED') return { icon: STATUS_ICON.PUBLISHED, label: 'Published', hasPost: true }
    if (post.status === 'DRAFT')     return { icon: STATUS_ICON.DRAFT,     label: 'Draft',     hasPost: true }
    return { icon: STATUS_ICON.SCHEDULED, label: post.status, hasPost: true }
  }

  if (isPodcastDay && !isPast) return { icon: STATUS_ICON.PODCAST,  label: 'Podcast Day', hasPost: false }
  if (isPast)                   return { icon: STATUS_ICON.MISSED,   label: 'Missed',      hasPost: false }
  return                               { icon: STATUS_ICON.UPCOMING, label: 'Upcoming',    hasPost: false }
}

export function WeeklyGrid({ initialPosts, today }: Props) {
  const [posts, setPosts] = useState<ContentPost[]>(initialPosts)
  const [weekRef, setWeekRef] = useState(() => new Date(today + 'T12:00:00'))
  const [dialog, setDialog] = useState<{ date: string; platform: Platform } | null>(null)

  const days = useMemo(() => getWeekDays(weekRef), [weekRef])

  // Build lookup: "YYYY-MM-DD:PLATFORM" → post
  const postMap = useMemo(() => {
    const map = new Map<string, ContentPost>()
    posts.forEach((p) => {
      if (p.scheduled_at) map.set(`${p.scheduled_at}:${p.platform}`, p)
    })
    return map
  }, [posts])

  function prevWeek() { setWeekRef((d) => addDays(d, -7)) }
  function nextWeek() { setWeekRef((d) => addDays(d, 7)) }
  function thisWeek() { setWeekRef(new Date(today + 'T12:00:00')) }

  function handleSave(saved: ContentPost) {
    setPosts((prev) => {
      const exists = prev.find((p) => p.id === saved.id)
      if (exists) return prev.map((p) => (p.id === saved.id ? saved : p))
      return [...prev, saved]
    })
  }

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const dialogPost = dialog
    ? (postMap.get(`${dialog.date}:${dialog.platform}`) ?? null)
    : null

  return (
    <div>
      {/* Week nav */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={prevWeek}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={thisWeek}
          className="px-3 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
        >
          This Week
        </button>
        <button
          onClick={nextWeek}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        <span className="text-sm text-zinc-400 ml-1">{formatWeekRange(days)}</span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              {/* Platform label column */}
              <th className="w-28 pb-2" />
              {days.map((date) => {
                const { day, num, isToday } = shortDay(date)
                return (
                  <th key={date} className="pb-2 px-1 text-center min-w-[80px]">
                    <div className={`text-xs font-medium ${isToday ? 'text-violet-400' : 'text-zinc-500'}`}>
                      {day}
                    </div>
                    <div className={`text-sm font-semibold leading-none mt-0.5 ${isToday ? 'text-white' : 'text-zinc-400'}`}>
                      {isToday ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-violet-600 text-white text-xs">
                          {num}
                        </span>
                      ) : num}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {GRID_PLATFORMS.map((platform, pi) => (
              <tr key={platform} className={pi > 0 ? 'border-t border-white/5' : ''}>
                {/* Platform label */}
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PLATFORM_COLOR[platform] }}
                    />
                    <span className="text-xs font-medium text-zinc-400 whitespace-nowrap">
                      {PLATFORM_LABEL[platform]}
                    </span>
                  </div>
                </td>

                {days.map((date) => {
                  const post = postMap.get(`${date}:${platform}`)
                  const { icon, label, hasPost } = cellState(post, date, platform, today)
                  const isPodcastDay =
                    platform === 'YOUTUBE' &&
                    new Date(date + 'T12:00:00').getDay() === PODCAST_DAY

                  return (
                    <td key={date} className="px-1 py-1.5 text-center">
                      <button
                        onClick={() => setDialog({ date, platform })}
                        title={hasPost ? post?.title : label}
                        className={`w-full min-h-[48px] px-1 py-2 rounded-xl text-center transition-all border group relative ${
                          hasPost
                            ? 'border-white/10 bg-zinc-900 hover:border-white/20 hover:bg-zinc-800'
                            : isPodcastDay
                            ? 'border-dashed border-white/10 bg-zinc-900/40 hover:border-violet-500/30'
                            : 'border-transparent bg-transparent hover:bg-zinc-900/60 hover:border-white/5'
                        }`}
                      >
                        <span className="text-lg leading-none block">{icon}</span>
                        {hasPost && post?.title && (
                          <p className="text-[9px] text-zinc-500 mt-1 leading-tight truncate max-w-[72px] mx-auto">
                            {post.title}
                          </p>
                        )}
                        {hasPost && post?.post_link && (
                          <span className="absolute top-1 right-1 text-[9px] text-zinc-600">🔗</span>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cell dialog */}
      {dialog && (
        <CellDialog
          open={!!dialog}
          onOpenChange={(v) => { if (!v) setDialog(null) }}
          date={dialog.date}
          platform={dialog.platform}
          post={dialogPost}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
