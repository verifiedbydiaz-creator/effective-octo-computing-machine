'use client'

import { useState, useCallback, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { TASK_TYPES, TASK_TYPE_LABELS, TASK_TYPE_COLORS } from '@/lib/constants'
import { PRIORITY_LABEL, PRIORITY_COLOR, COLUMNS } from './backlog-constants'
import { KanbanColumn } from './kanban-column'
import { TaskDialog } from './task-dialog'
import type { BacklogItem, TaskType, PriorityLevel } from '@/lib/types'
import type { KanbanStatus } from './backlog-constants'
import { useToast } from '@/lib/toast-store'

interface Props {
  initialItems: BacklogItem[]
}

export function KanbanBoard({ initialItems }: Props) {
  const [items, setItems] = useState<BacklogItem[]>(initialItems)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const toast = useToast()

  // Filters
  const [activeTypes, setActiveTypes] = useState<Set<TaskType>>(new Set())
  const [activePriorities, setActivePriorities] = useState<Set<PriorityLevel>>(new Set())

  // Dialogs
  const [addDialog, setAddDialog] = useState<{ open: boolean; status: KanbanStatus; parentId: string | null }>({
    open: false, status: 'TODO', parentId: null,
  })
  const [editItem, setEditItem] = useState<BacklogItem | null>(null)

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (activeTypes.size > 0 && !activeTypes.has(item.task_type)) return false
      if (activePriorities.size > 0 && !activePriorities.has(item.priority)) return false
      return true
    })
  }, [items, activeTypes, activePriorities])

  // Top-level items per column (no parent, matching column status)
  const columnItems = useCallback(
    (status: KanbanStatus): BacklogItem[] =>
      filtered.filter((i) => i.status === status && i.parent_id === null),
    [filtered],
  )

  function toggleType(t: TaskType) {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      next.has(t) ? next.delete(t) : next.add(t)
      return next
    })
  }

  function togglePriority(p: PriorityLevel) {
    setActivePriorities((prev) => {
      const next = new Set(prev)
      next.has(p) ? next.delete(p) : next.add(p)
      return next
    })
  }

  // ── Drag and drop ──────────────────────────────────────────────────────────
  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    setDraggingId(id)
  }

  function handleDragEnd() {
    setDraggingId(null)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  async function handleDrop(e: React.DragEvent, targetStatus: KanbanStatus) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (!id) return
    setDraggingId(null)

    const item = items.find((i) => i.id === id)
    if (!item || item.status === targetStatus) return

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: targetStatus } : i)),
    )

    try {
      await fetch(`/api/backlog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      })
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: item.status } : i)),
      )
      toast('Failed to move task', 'error')
    }
  }

  // ── CRUD callbacks ────────────────────────────────────────────────────────
  function handleSaved(saved: BacklogItem) {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === saved.id)
      if (exists) return prev.map((i) => (i.id === saved.id ? saved : i))
      return [...prev, saved]
    })
  }

  function handleDeleted(id: string) {
    // Remove the item and any subtasks
    setItems((prev) => prev.filter((i) => i.id !== id && i.parent_id !== id))
  }

  const topLevelItems = items.filter((i) => i.parent_id === null)
  const PRIORITIES: PriorityLevel[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']
  const totalFiltered = filtered.length
  const totalAll = items.length

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Backlog</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {totalFiltered < totalAll
              ? `${totalFiltered} of ${totalAll} tasks`
              : `${totalAll} tasks`}
          </p>
        </div>
        <button
          onClick={() => setAddDialog({ open: true, status: 'TODO', parentId: null })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors self-start sm:self-auto"
        >
          <Plus size={15} />
          Add Task
        </button>
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {/* Task type filters */}
        {TASK_TYPES.map((type) => {
          const active = activeTypes.has(type)
          const color = TASK_TYPE_COLORS[type]
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all border"
              style={
                active
                  ? { backgroundColor: `${color}25`, color, borderColor: `${color}50` }
                  : { backgroundColor: 'transparent', color: '#71717a', borderColor: 'rgba(255,255,255,0.08)' }
              }
            >
              {TASK_TYPE_LABELS[type]}
            </button>
          )
        })}

        {/* Divider */}
        <div className="w-px bg-white/10 self-stretch mx-1" />

        {/* Priority filters */}
        {PRIORITIES.map((p) => {
          const active = activePriorities.has(p)
          const color = PRIORITY_COLOR[p]
          return (
            <button
              key={p}
              onClick={() => togglePriority(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all border"
              style={
                active
                  ? { backgroundColor: `${color}25`, color, borderColor: `${color}50` }
                  : { backgroundColor: 'transparent', color: '#71717a', borderColor: 'rgba(255,255,255,0.08)' }
              }
            >
              {PRIORITY_LABEL[p]}
            </button>
          )
        })}

        {/* Clear filters */}
        {(activeTypes.size > 0 || activePriorities.size > 0) && (
          <button
            onClick={() => { setActiveTypes(new Set()); setActivePriorities(new Set()) }}
            className="px-2.5 py-1 rounded-lg text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Board ────────────────────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0 overflow-x-auto pb-4">
        {COLUMNS.map(({ status, label, color }) => (
          <KanbanColumn
            key={status}
            status={status}
            label={label}
            color={color}
            items={columnItems(status)}
            allItems={filtered}
            draggingId={draggingId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onCardClick={(item) => setEditItem(item)}
            onAddClick={() => setAddDialog({ open: true, status, parentId: null })}
          />
        ))}
      </div>

      {/* ── Add task dialog ──────────────────────────────────────────────────── */}
      <TaskDialog
        open={addDialog.open}
        onOpenChange={(open) => setAddDialog((prev) => ({ ...prev, open }))}
        parentId={addDialog.parentId}
        topLevelItems={topLevelItems}
        onSave={(saved) => {
          handleSaved(saved)
          setAddDialog((prev) => ({ ...prev, open: false }))
        }}
      />

      {/* ── Edit / detail dialog ─────────────────────────────────────────────── */}
      {editItem && (
        <TaskDetailDialog
          item={editItem}
          allItems={items}
          topLevelItems={topLevelItems}
          onSave={(saved) => {
            handleSaved(saved)
            setEditItem(saved)
          }}
          onDelete={(id) => {
            handleDeleted(id)
            setEditItem(null)
          }}
          onAddSubtask={(parentId) => {
            setEditItem(null)
            setAddDialog({ open: true, status: editItem.status as KanbanStatus, parentId })
          }}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  )
}

// ─── Inline task detail dialog ────────────────────────────────────────────────
// Kept inline to avoid extra file since it shares all the same state/callbacks

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Pencil, Plus as PlusIcon, Trash2 } from 'lucide-react'
import { TaskDialog as TaskEditDialog } from './task-dialog'

function TaskDetailDialog({
  item,
  allItems,
  topLevelItems,
  onSave,
  onDelete,
  onAddSubtask,
  onClose,
}: {
  item: BacklogItem
  allItems: BacklogItem[]
  topLevelItems: BacklogItem[]
  onSave: (item: BacklogItem) => void
  onDelete: (id: string) => void
  onAddSubtask: (parentId: string) => void
  onClose: () => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const subtasks = allItems
    .filter((i) => i.parent_id === item.id)
    .sort((a, b) => PRIORITY_ORDER_LOCAL[a.priority] - PRIORITY_ORDER_LOCAL[b.priority])

  const taskColor = TASK_TYPE_COLORS[item.task_type]

  return (
    <>
      <Dialog open onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="pr-6 leading-snug">{item.title}</DialogTitle>
          </DialogHeader>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 mt-1">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: `${taskColor}1a`, color: taskColor }}
            >
              {TASK_TYPE_LABELS[item.task_type]}
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: `${PRIORITY_COLOR[item.priority]}20`, color: PRIORITY_COLOR[item.priority] }}
            >
              {PRIORITY_LABEL[item.priority]}
            </span>
            {item.estimated_minutes && (
              <span className="text-xs text-zinc-500 px-2 py-0.5 rounded bg-zinc-800">
                ⏱ {formatTimeLocal(item.estimated_minutes)}
              </span>
            )}
            {item.due_date && (
              <span className="text-xs text-zinc-500 px-2 py-0.5 rounded bg-zinc-800">
                📅 {new Date(item.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            <span className="text-xs text-zinc-500 px-2 py-0.5 rounded bg-zinc-800">
              {STATUS_LABEL[item.status]}
            </span>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-zinc-400 mt-2 whitespace-pre-wrap leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Subtasks */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Subtasks {subtasks.length > 0 && `(${subtasks.filter(s => s.status === 'DONE').length}/${subtasks.length})`}
              </span>
              <button
                onClick={() => { onClose(); onAddSubtask(item.id) }}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-violet-400 transition-colors"
              >
                <PlusIcon size={12} /> Add subtask
              </button>
            </div>
            {subtasks.length === 0 ? (
              <p className="text-xs text-zinc-700 py-2">No subtasks yet.</p>
            ) : (
              <div className="space-y-1.5">
                {subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-white/5">
                    <div
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PRIORITY_COLOR[sub.priority] }}
                    />
                    <span className={`text-sm flex-1 ${sub.status === 'DONE' ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>
                      {sub.title}
                    </span>
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: PRIORITY_COLOR[sub.priority] }}
                    >
                      {PRIORITY_LABEL[sub.priority]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
            <button
              onClick={() => onDelete(item.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 ml-auto px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors"
            >
              <Pencil size={13} /> Edit
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <TaskEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        item={item}
        topLevelItems={topLevelItems}
        onSave={(saved) => { onSave(saved); setEditOpen(false) }}
        onDelete={(id) => { onDelete(id); setEditOpen(false) }}
      />
    </>
  )
}

const PRIORITY_ORDER_LOCAL: Record<PriorityLevel, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

function formatTimeLocal(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

const STATUS_LABEL: Record<string, string> = {
  TODO: 'Backlog',
  THIS_WEEK: 'This Week',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  BLOCKED: 'Blocked',
}
