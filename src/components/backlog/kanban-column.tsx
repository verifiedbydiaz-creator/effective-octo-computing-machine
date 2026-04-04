'use client'

import { Plus } from 'lucide-react'
import { KanbanCard } from './kanban-card'
import { PRIORITY_ORDER } from './backlog-constants'
import type { BacklogItem } from '@/lib/types'
import type { KanbanStatus } from './backlog-constants'

interface Props {
  status: KanbanStatus
  label: string
  color: string
  items: BacklogItem[]     // top-level items for this column
  allItems: BacklogItem[]  // needed to look up subtasks
  draggingId: string | null
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: KanbanStatus) => void
  onCardClick: (item: BacklogItem) => void
  onAddClick: () => void
}

export function KanbanColumn({
  status,
  label,
  color,
  items,
  allItems,
  draggingId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onCardClick,
  onAddClick,
}: Props) {
  // Sort: priority first, then sort_order
  const sorted = [...items].sort((a, b) => {
    const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (pd !== 0) return pd
    return a.sort_order - b.sort_order
  })

  // Group top-level items with their subtasks
  const subtasksOf = (id: string) =>
    allItems.filter((i) => i.parent_id === id).sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
    )

  return (
    <div
      className="flex flex-col min-h-[200px] flex-1 min-w-[240px]"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold text-zinc-300">{label}</span>
          <span className="text-xs text-zinc-600 font-mono">{items.length}</span>
        </div>
        <button
          onClick={onAddClick}
          className="p-1 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-colors"
          title={`Add to ${label}`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div className="flex-1 space-y-2 rounded-xl p-2 transition-colors min-h-[80px] border border-transparent">
        {sorted.map((item) => {
          const subtasks = subtasksOf(item.id)
          return (
            <div key={item.id}>
              <KanbanCard
                item={item}
                subtasks={subtasks}
                isDragging={draggingId === item.id}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onClick={() => onCardClick(item)}
              />
              {/* Indented subtasks */}
              {subtasks.map((sub) => (
                <div key={sub.id} className="mt-1.5">
                  <KanbanCard
                    item={sub}
                    subtasks={[]}
                    isDragging={draggingId === sub.id}
                    isIndented
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onClick={() => onCardClick(sub)}
                  />
                </div>
              ))}
            </div>
          )
        })}

        {/* Empty drop target hint */}
        {items.length === 0 && (
          <div className="h-16 rounded-xl border border-dashed border-white/5 flex items-center justify-center">
            <span className="text-xs text-zinc-700">Drop here</span>
          </div>
        )}
      </div>
    </div>
  )
}
