// Returns the Monday of the week containing `date`
export function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

// Returns the Sunday of the week
export function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00')
  d.setDate(d.getDate() + 6)
  return d.toISOString().split('T')[0]
}

export function addWeeks(weekStart: string, n: number): string {
  const d = new Date(weekStart + 'T12:00:00')
  d.setDate(d.getDate() + n * 7)
  return d.toISOString().split('T')[0]
}

export function formatWeekLabel(weekStart: string): string {
  const start = new Date(weekStart + 'T12:00:00')
  const end = new Date(weekStart + 'T12:00:00')
  end.setDate(end.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

export function isCurrentWeek(weekStart: string): boolean {
  const today = new Date()
  return weekStart === getWeekStart(today)
}

export const REVIEW_FIELDS = [
  { key: 'wins',              label: 'Wins',                    placeholder: 'What went right this week? List your wins…',                     emoji: '🏆' },
  { key: 'losses',            label: 'Misses',                  placeholder: 'What didn\'t happen? What fell short and why?',                  emoji: '❌' },
  { key: 'lessons',           label: 'Adjustments',             placeholder: 'What changes for next week? What would you do differently?',     emoji: '🔧' },
  { key: 'content_analytics', label: 'Content Analytics',       placeholder: 'What content performed well? Any patterns or surprises?',        emoji: '📊' },
  { key: 'next_week_focus',   label: 'Next Week\'s Top 3',      placeholder: '1. \n2. \n3. ',                                                  emoji: '🎯' },
] as const

export type ReviewFieldKey = typeof REVIEW_FIELDS[number]['key']
