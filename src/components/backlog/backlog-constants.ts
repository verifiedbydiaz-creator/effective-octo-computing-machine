import type { TaskStatus, PriorityLevel } from '@/lib/types'

export type KanbanStatus = 'TODO' | 'THIS_WEEK' | 'IN_PROGRESS' | 'DONE'

export const COLUMNS: { status: KanbanStatus; label: string; color: string }[] = [
  { status: 'TODO',        label: 'Backlog',     color: '#52525b' },
  { status: 'THIS_WEEK',  label: 'This Week',   color: '#06B6D4' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: '#8B5CF6' },
  { status: 'DONE',        label: 'Done',        color: '#10B981' },
]

// P0–P3 labels
export const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  URGENT: 'P0',
  HIGH:   'P1',
  MEDIUM: 'P2',
  LOW:    'P3',
}

export const PRIORITY_COLOR: Record<PriorityLevel, string> = {
  URGENT: '#F43F5E',
  HIGH:   '#F59E0B',
  MEDIUM: '#EAB308',
  LOW:    '#52525b',
}

export const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  URGENT: 0,
  HIGH:   1,
  MEDIUM: 2,
  LOW:    3,
}

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO',        label: 'Backlog' },
  { value: 'THIS_WEEK',  label: 'This Week' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE',        label: 'Done' },
  { value: 'BLOCKED',     label: 'Blocked' },
]
