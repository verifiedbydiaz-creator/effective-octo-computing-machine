'use client'

import { Link2, Trash2 } from 'lucide-react'
import { TASK_TYPES, TASK_TYPE_LABELS, TASK_TYPE_COLORS } from '@/lib/constants'
import type { TaskType } from '@/lib/types'
import type { LocalBlock } from './planner-client'

interface Props {
  block: LocalBlock
  isSelected: boolean
  onSelect: () => void
  onChange: (patch: Partial<LocalBlock>) => void
  onRemove: () => void
}

export function TimeBlockRow({ block, isSelected, onSelect, onChange, onRemove }: Props) {
  const color = block.task_type ? TASK_TYPE_COLORS[block.task_type] : '#52525b'

  return (
    <div
      className={`group flex flex-wrap md:flex-nowrap items-center gap-2 px-3 py-2.5 rounded-xl transition-colors border ${
        isSelected
          ? 'border-violet-500/50 bg-violet-500/5'
          : 'border-white/5 bg-zinc-900 hover:border-white/10'
      }`}
    >
      {/* Color bar */}
      <div
        className="hidden md:block w-0.5 h-10 rounded-full flex-shrink-0 transition-colors"
        style={{ backgroundColor: color }}
      />

      {/* Start time */}
      <input
        type="time"
        value={block.start_time}
        onChange={(e) => onChange({ start_time: e.target.value })}
        className="w-[100px] bg-zinc-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-violet-500 transition-colors flex-shrink-0"
      />

      <span className="text-zinc-600 text-xs flex-shrink-0">→</span>

      {/* End time */}
      <input
        type="time"
        value={block.end_time}
        onChange={(e) => onChange({ end_time: e.target.value })}
        className="w-[100px] bg-zinc-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-violet-500 transition-colors flex-shrink-0"
      />

      {/* Task type dropdown */}
      <div className="relative flex-shrink-0">
        <span
          className="absolute left-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full pointer-events-none"
          style={{ backgroundColor: color }}
        />
        <select
          value={block.task_type ?? ''}
          onChange={(e) =>
            onChange({ task_type: (e.target.value as TaskType) || null })
          }
          className="appearance-none bg-zinc-800 border border-white/10 rounded-lg pl-7 pr-6 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
        >
          <option value="">— none —</option>
          {TASK_TYPES.map((type) => (
            <option key={type} value={type}>
              {TASK_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <input
        type="text"
        value={block.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Block title…"
        className="flex-1 min-w-[140px] bg-zinc-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
      />

      {/* Link to backlog */}
      <button
        type="button"
        title="Assign from backlog"
        onClick={onSelect}
        className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
          isSelected
            ? 'text-violet-400 bg-violet-500/20'
            : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'
        }`}
      >
        <Link2 size={15} />
      </button>

      {/* Remove */}
      <button
        type="button"
        title="Remove block"
        onClick={onRemove}
        className="flex-shrink-0 p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
