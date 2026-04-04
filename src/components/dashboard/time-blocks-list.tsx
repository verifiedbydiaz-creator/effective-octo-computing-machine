'use client'

import { useState, useCallback } from 'react'
import type { TimeBlock } from '@/lib/types'
import { TASK_TYPE_COLORS, TASK_TYPE_LABELS } from '@/lib/constants'
import { useToast } from '@/lib/toast-store'

interface Props {
  initialBlocks: TimeBlock[]
  dailyPlanId: string
}

export function TimeBlocksList({ initialBlocks }: Props) {
  const [blocks, setBlocks] = useState(initialBlocks)
  const toast = useToast()

  const toggleBlock = useCallback(async (block: TimeBlock) => {
    const next = !block.completed

    // Optimistic update
    setBlocks((prev) =>
      prev.map((b) => (b.id === block.id ? { ...b, completed: next } : b))
    )

    const response = await fetch(`/api/time-blocks/${block.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: next }),
    })

    if (!response.ok) {
      // Revert on error
      setBlocks((prev) =>
        prev.map((b) => (b.id === block.id ? { ...b, completed: block.completed } : b))
      )
      toast('Failed to update block', 'error')
    }
  }, [toast])

  const completedCount = blocks.filter((b) => b.completed).length

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Today&apos;s Schedule
        </h2>
        {blocks.length > 0 && (
          <span className="text-xs text-zinc-600">
            {completedCount}/{blocks.length} done
          </span>
        )}
      </div>

      {blocks.length === 0 ? (
        <p className="text-sm text-zinc-600 text-center py-10">
          No blocks planned yet.{' '}
          <a href="/plan" className="text-violet-400 hover:text-violet-300 underline">
            Open Night Planner
          </a>{' '}
          to set up your day.
        </p>
      ) : (
        <div className="space-y-0.5">
          {blocks.map((block) => (
            <TimeBlockRow key={block.id} block={block} onToggle={toggleBlock} />
          ))}
        </div>
      )}
    </div>
  )
}

function TimeBlockRow({
  block,
  onToggle,
}: {
  block: TimeBlock
  onToggle: (block: TimeBlock) => void
}) {
  const color = TASK_TYPE_COLORS[block.task_type]
  const label = TASK_TYPE_LABELS[block.task_type]

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
        block.completed ? 'opacity-40' : 'hover:bg-white/5'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(block)}
        aria-label={block.completed ? 'Mark incomplete' : 'Mark complete'}
        className={`flex-shrink-0 h-5 w-5 rounded border-2 transition-all flex items-center justify-center ${
          block.completed
            ? 'border-transparent bg-white/20'
            : 'border-zinc-600 group-hover:border-zinc-400'
        }`}
      >
        {block.completed && (
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M1.5 5.5L4 8L9.5 3"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Time range */}
      <span className="text-xs text-zinc-500 font-mono w-[104px] flex-shrink-0 tabular-nums">
        {block.start_time} – {block.end_time}
      </span>

      {/* Color bar */}
      <div
        className="w-0.5 h-5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Title */}
      <span
        className={`flex-1 text-sm min-w-0 truncate ${
          block.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
        }`}
      >
        {block.title}
      </span>

      {/* Task type badge */}
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
        style={{
          backgroundColor: `${color}1a`,
          color: color,
        }}
      >
        {label}
      </span>
    </div>
  )
}
