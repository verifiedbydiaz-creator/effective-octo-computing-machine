'use client'

import { useState, useMemo } from 'react'
import { Clock } from 'lucide-react'
import { TASK_TYPES, TASK_TYPE_LABELS, TASK_TYPE_COLORS } from '@/lib/constants'
import type { BacklogItem, TaskType } from '@/lib/types'

const PRIORITY_ORDER = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#F43F5E',
  HIGH: '#F59E0B',
  MEDIUM: '#06B6D4',
  LOW: '#52525b',
}

interface Props {
  backlogItems: BacklogItem[]
  selectedBlockTitle: string | null
  hasSelectedBlock: boolean
  onAssign: (title: string) => void
}

export function BacklogSidebar({ backlogItems, selectedBlockTitle, hasSelectedBlock, onAssign }: Props) {
  // Only show task types that have items
  const typesWithItems = useMemo(() => {
    const used = new Set(backlogItems.map((i) => i.task_type))
    return TASK_TYPES.filter((t) => used.has(t))
  }, [backlogItems])

  const [activeTab, setActiveTab] = useState<TaskType | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    const items =
      activeTab === 'ALL'
        ? backlogItems
        : backlogItems.filter((i) => i.task_type === activeTab)
    return [...items].sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
    )
  }, [backlogItems, activeTab])

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Backlog
        </h2>
        {hasSelectedBlock ? (
          <p className="text-xs text-violet-400 mt-1">
            Click an item to assign its title to the selected block
          </p>
        ) : (
          <p className="text-xs text-zinc-600 mt-1">
            Click the{' '}
            <span className="text-zinc-400">link icon</span> on a block to assign
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'ALL'
              ? 'bg-white/10 text-white'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
          }`}
        >
          All ({backlogItems.length})
        </button>
        {typesWithItems.map((type) => {
          const count = backlogItems.filter((i) => i.task_type === type).length
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === type
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
              style={
                activeTab === type
                  ? {
                      backgroundColor: `${TASK_TYPE_COLORS[type]}30`,
                      color: TASK_TYPE_COLORS[type],
                    }
                  : undefined
              }
            >
              {TASK_TYPE_LABELS[type].split(' ')[0]} ({count})
            </button>
          )
        })}
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {filtered.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-8">
            No backlog items.
          </p>
        ) : (
          filtered.map((item) => {
            const isAssigned = selectedBlockTitle === item.title
            const color = TASK_TYPE_COLORS[item.task_type]
            return (
              <button
                key={item.id}
                onClick={() => hasSelectedBlock && onAssign(item.title)}
                disabled={!hasSelectedBlock}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                  isAssigned
                    ? 'border-violet-500/50 bg-violet-500/10'
                    : hasSelectedBlock
                    ? 'border-white/5 bg-zinc-900 hover:border-white/15 hover:bg-zinc-800 cursor-pointer'
                    : 'border-white/5 bg-zinc-900 opacity-60 cursor-default'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-zinc-200 leading-snug">{item.title}</p>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${PRIORITY_COLORS[item.priority]}20`,
                      color: PRIORITY_COLORS[item.priority],
                    }}
                  >
                    {item.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-[10px] font-medium"
                    style={{ color }}
                  >
                    {TASK_TYPE_LABELS[item.task_type]}
                  </span>
                  {item.estimated_minutes && (
                    <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                      <Clock size={10} />
                      {item.estimated_minutes}m
                    </span>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
