'use client'

import { Clock, ChevronRight } from 'lucide-react'
import { TASK_TYPE_COLORS, TASK_TYPE_LABELS } from '@/lib/constants'
import { PRIORITY_LABEL, PRIORITY_COLOR } from './backlog-constants'
import type { BacklogItem } from '@/lib/types'

interface Props {
  item: BacklogItem
  subtasks: BacklogItem[]
  isDragging: boolean
  isIndented?: boolean
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  onClick: () => void
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function KanbanCard({
  item,
  subtasks,
  isDragging,
  isIndented = false,
  onDragStart,
  onDragEnd,
  onClick,
}: Props) {
  const taskColor = TASK_TYPE_COLORS[item.task_type]
  const priorityColor = PRIORITY_COLOR[item.priority]
  const doneSubtasks = subtasks.filter((s) => s.status === 'DONE').length
  const isOverdue =
    item.due_date && item.status !== 'DONE'
      ? new Date(item.due_date + 'T23:59:59') < new Date()
      : false

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group relative bg-zinc-900 border rounded-xl px-3.5 py-3 cursor-pointer select-none transition-all ${
        isDragging ? 'opacity-40 rotate-1 scale-95' : 'hover:border-white/20'
      } ${isIndented ? 'border-white/5 ml-4' : 'border-white/10'}`}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
        style={{ backgroundColor: taskColor }}
      />

      <div className="pl-2.5">
        {/* Title row */}
        <div className="flex items-start gap-2 justify-between">
          <p className={`text-sm leading-snug ${item.status === 'DONE' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
            {item.title}
          </p>
          <ChevronRight size={13} className="text-zinc-600 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {/* Priority */}
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${priorityColor}20`, color: priorityColor }}
          >
            {PRIORITY_LABEL[item.priority]}
          </span>

          {/* Task type */}
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${taskColor}1a`, color: taskColor }}
          >
            {TASK_TYPE_LABELS[item.task_type]}
          </span>

          {/* Estimated time */}
          {item.estimated_minutes && (
            <span className="flex items-center gap-0.5 text-[10px] text-zinc-600">
              <Clock size={9} />
              {formatTime(item.estimated_minutes)}
            </span>
          )}

          {/* Subtask count */}
          {subtasks.length > 0 && (
            <span className="text-[10px] text-zinc-500 ml-auto">
              {doneSubtasks}/{subtasks.length} subtasks
            </span>
          )}
        </div>

        {/* Due date */}
        {item.due_date && (
          <p className={`text-[10px] mt-1.5 ${isOverdue ? 'text-red-400' : 'text-zinc-600'}`}>
            {isOverdue ? '⚠ ' : ''}Due {new Date(item.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  )
}
