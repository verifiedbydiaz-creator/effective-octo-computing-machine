import type { OutreachStatus, Platform } from '@/lib/types'

export type PipelineStatus = 'IDENTIFIED' | 'CONTACTED' | 'RESPONDED' | 'FOLLOW_UP' | 'CONNECTED'

export const PIPELINE_COLUMNS: { status: PipelineStatus; label: string; color: string }[] = [
  { status: 'IDENTIFIED', label: 'Identified',  color: '#52525b' },
  { status: 'CONTACTED',  label: 'Contacted',   color: '#F59E0B' },
  { status: 'RESPONDED',  label: 'Responded',   color: '#06B6D4' },
  { status: 'FOLLOW_UP',  label: 'Follow-Up',   color: '#8B5CF6' },
  { status: 'CONNECTED',  label: 'Connected',   color: '#10B981' },
]

export const CATEGORY_OPTIONS = [
  { value: 'NETWORKING',    label: 'Networking' },
  { value: 'PODCAST_GUEST', label: 'Podcast Guest' },
  { value: 'CLIENT',        label: 'Client' },
  { value: 'OTHER',         label: 'Other' },
]

export const CATEGORY_TABS = [
  { value: 'ALL',           label: 'All' },
  { value: 'NETWORKING',    label: 'Networking' },
  { value: 'PODCAST_GUEST', label: 'Podcast Guests' },
  { value: 'CLIENT',        label: 'Clients' },
]

export const PLATFORM_ICON: Record<Platform, string> = {
  TWITTER:    '𝕏',
  LINKEDIN:   'in',
  INSTAGRAM:  'IG',
  YOUTUBE:    'YT',
  TIKTOK:     'TT',
  NEWSLETTER: '✉',
  OTHER:      '·',
}

export const PLATFORM_COLOR: Record<Platform, string> = {
  TWITTER:    '#1DA1F2',
  LINKEDIN:   '#0A66C2',
  INSTAGRAM:  '#E1306C',
  YOUTUBE:    '#FF0000',
  TIKTOK:     '#010101',
  NEWSLETTER: '#F59E0B',
  OTHER:      '#52525b',
}

export const STATUS_LABEL: Record<OutreachStatus, string> = {
  IDENTIFIED:       'Identified',
  CONTACTED:        'Contacted',
  RESPONDED:        'Responded',
  FOLLOW_UP:        'Follow-Up',
  CONNECTED:        'Connected',
  TO_CONTACT:       'To Contact',
  REPLIED:          'Replied',
  MEETING_SCHEDULED:'Meeting Set',
  CLOSED:           'Closed',
  NOT_INTERESTED:   'Not Interested',
}

// Days since a given ISO date string
export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr + 'T12:00:00').getTime()
  return Math.floor(diff / 86_400_000)
}

// Days until a future date (negative = overdue)
export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr + 'T12:00:00').getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}

export function isOverdue(dateStr: string | null, today: string): boolean {
  if (!dateStr) return false
  return dateStr <= today
}

// Add N days to a YYYY-MM-DD string
export function addDaysToDate(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}
