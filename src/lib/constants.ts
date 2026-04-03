import type { TaskType } from './types'

// ─── Task type colors ─────────────────────────────────────────────────────────

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  CONTENT_PUBLISH:  '#3B82F6', // Blue
  DEEP_BUILD:       '#8B5CF6', // Purple
  OUTREACH:         '#10B981', // Green
  BIZ_OPS:          '#F59E0B', // Orange
  LEARNING:         '#06B6D4', // Cyan
  CONTENT_PLANNING: '#6366F1', // Indigo
  MORNING_ROUTINE:  '#F43F5E', // Rose
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  CONTENT_PUBLISH:  'Content Publish',
  DEEP_BUILD:       'Deep Build',
  OUTREACH:         'Outreach',
  BIZ_OPS:          'Biz Ops',
  LEARNING:         'Learning',
  CONTENT_PLANNING: 'Content Planning',
  MORNING_ROUTINE:  'Morning Routine',
}

export const TASK_TYPES: TaskType[] = [
  'CONTENT_PUBLISH',
  'DEEP_BUILD',
  'OUTREACH',
  'BIZ_OPS',
  'LEARNING',
  'CONTENT_PLANNING',
  'MORNING_ROUTINE',
]

// ─── Default daily template ───────────────────────────────────────────────────

export interface DefaultTimeBlock {
  title: string
  start_time: string // HH:MM
  end_time: string   // HH:MM
  task_type: TaskType | null // null = no task type (meals, transitions)
}

export const DEFAULT_DAILY_TEMPLATE: DefaultTimeBlock[] = [
  { title: 'Wake up',                  start_time: '06:00', end_time: '06:30', task_type: null },
  { title: 'Gym',                      start_time: '06:30', end_time: '08:00', task_type: 'MORNING_ROUTINE' },
  { title: 'Shower + breakfast',       start_time: '08:00', end_time: '09:00', task_type: null },
  { title: 'Deep Build Block 1',       start_time: '09:00', end_time: '11:30', task_type: 'DEEP_BUILD' },
  { title: 'Content creation',         start_time: '11:30', end_time: '12:30', task_type: 'CONTENT_PUBLISH' },
  { title: 'Lunch',                    start_time: '12:30', end_time: '13:30', task_type: null },
  { title: 'Deep Build Block 2',       start_time: '13:30', end_time: '15:30', task_type: 'DEEP_BUILD' },
  { title: 'Outreach block',           start_time: '15:30', end_time: '16:00', task_type: 'OUTREACH' },
  { title: 'Learning block',           start_time: '16:00', end_time: '16:30', task_type: 'LEARNING' },
  { title: 'Content scheduling + admin', start_time: '16:30', end_time: '17:30', task_type: 'CONTENT_PLANNING' },
]

// ─── Google Calendar color IDs by task type ───────────────────────────────────
// Maps to Google Calendar's colorId values (1–11)

export const GCAL_COLOR_IDS: Record<TaskType, string> = {
  CONTENT_PUBLISH:  '9',  // Blueberry
  DEEP_BUILD:       '3',  // Grape
  OUTREACH:         '2',  // Sage
  BIZ_OPS:          '6',  // Tangerine
  LEARNING:         '7',  // Peacock
  CONTENT_PLANNING: '1',  // Lavender
  MORNING_ROUTINE:  '11', // Tomato
}
