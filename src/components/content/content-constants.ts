import type { Platform, ContentStatus } from '@/lib/types'

// Platforms shown in the grid (rows)
export const GRID_PLATFORMS: Platform[] = ['LINKEDIN', 'INSTAGRAM', 'TWITTER', 'YOUTUBE']

export const PLATFORM_LABEL: Record<Platform, string> = {
  LINKEDIN:   'LinkedIn',
  INSTAGRAM:  'Instagram',
  TWITTER:    'X / Twitter',
  YOUTUBE:    'YouTube',
  TIKTOK:     'TikTok',
  NEWSLETTER: 'Newsletter',
  OTHER:      'Other',
}

export const PLATFORM_COLOR: Record<Platform, string> = {
  LINKEDIN:   '#0A66C2',
  INSTAGRAM:  '#E1306C',
  TWITTER:    '#1DA1F2',
  YOUTUBE:    '#FF0000',
  TIKTOK:     '#010101',
  NEWSLETTER: '#F59E0B',
  OTHER:      '#52525b',
}

// Day of week (0=Sun … 6=Sat) used as the regular podcast day
// Friday = 5
export const PODCAST_DAY = 5

export const STATUS_ICON: Record<string, string> = {
  PUBLISHED: '✅',
  DRAFT:     '📝',
  READY:     '📋',
  SCHEDULED: '📋',
  IDEA:      '💡',
  MISSED:    '❌',
  UPCOMING:  '⬜',
  PODCAST:   '🎙️',
}

export const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Published',
  DRAFT:     'Draft',
  READY:     'Ready',
  SCHEDULED: 'Scheduled',
  IDEA:      'Idea',
  MISSED:    'Missed',
  UPCOMING:  'Upcoming',
  PODCAST:   'Podcast Day',
}

export const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: 'IDEA',      label: '💡 Idea' },
  { value: 'DRAFT',     label: '📝 Draft' },
  { value: 'READY',     label: '📋 Ready' },
  { value: 'SCHEDULED', label: '📅 Scheduled' },
  { value: 'PUBLISHED', label: '✅ Published' },
]

export const ALL_PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'LINKEDIN',   label: 'LinkedIn' },
  { value: 'INSTAGRAM',  label: 'Instagram' },
  { value: 'TWITTER',    label: 'X / Twitter' },
  { value: 'YOUTUBE',    label: 'YouTube' },
  { value: 'TIKTOK',     label: 'TikTok' },
  { value: 'NEWSLETTER', label: 'Newsletter' },
  { value: 'OTHER',      label: 'Other' },
]

// Returns Mon–Sun ISO dates for the week containing `referenceDate`
export function getWeekDays(referenceDate: Date): string[] {
  const d = new Date(referenceDate)
  const day = d.getDay() // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  d.setDate(d.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const copy = new Date(d)
    copy.setDate(d.getDate() + i)
    return copy.toISOString().split('T')[0]
  })
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function formatWeekRange(days: string[]): string {
  const start = new Date(days[0] + 'T12:00:00')
  const end = new Date(days[6] + 'T12:00:00')
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}, ${end.getFullYear()}`
}

export function shortDay(dateStr: string): { day: string; num: string; isToday: boolean } {
  const d = new Date(dateStr + 'T12:00:00')
  const todayStr = new Date().toISOString().split('T')[0]
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    num: String(d.getDate()),
    isToday: dateStr === todayStr,
  }
}
