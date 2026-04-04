'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { TASK_TYPES, TASK_TYPE_LABELS } from '@/lib/constants'
import { STATUS_OPTIONS } from './backlog-constants'
import type { BacklogItem, TaskType, PriorityLevel } from '@/lib/types'

const PRIORITIES: { value: PriorityLevel; label: string }[] = [
  { value: 'URGENT', label: 'P0 — Urgent' },
  { value: 'HIGH',   label: 'P1 — High' },
  { value: 'MEDIUM', label: 'P2 — Medium' },
  { value: 'LOW',    label: 'P3 — Low' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  // If item is set → edit mode; else → add mode
  item?: BacklogItem
  parentId?: string | null
  topLevelItems: BacklogItem[] // for parent task dropdown
  onSave: (item: BacklogItem) => void
  onDelete?: (id: string) => void
}

const empty = {
  title: '',
  description: '',
  task_type: 'DEEP_BUILD' as TaskType,
  priority: 'MEDIUM' as PriorityLevel,
  status: 'TODO' as BacklogItem['status'],
  estimated_minutes: '',
  due_date: '',
  parent_id: null as string | null,
}

export function TaskDialog({ open, onOpenChange, item, parentId, topLevelItems, onSave, onDelete }: Props) {
  const isEdit = !!item
  const [fields, setFields] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (item) {
        setFields({
          title: item.title,
          description: item.description ?? '',
          task_type: item.task_type,
          priority: item.priority,
          status: item.status,
          estimated_minutes: item.estimated_minutes ? String(item.estimated_minutes) : '',
          due_date: item.due_date ?? '',
          parent_id: item.parent_id,
        })
      } else {
        setFields({ ...empty, parent_id: parentId ?? null })
      }
      setError(null)
    }
  }, [open, item, parentId])

  function set<K extends keyof typeof fields>(key: K, val: (typeof fields)[K]) {
    setFields((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fields.title.trim()) return
    setSaving(true)
    setError(null)

    const payload = {
      title: fields.title.trim(),
      description: fields.description.trim() || null,
      task_type: fields.task_type,
      priority: fields.priority,
      status: fields.status,
      estimated_minutes: fields.estimated_minutes ? parseInt(fields.estimated_minutes) : null,
      due_date: fields.due_date || null,
      parent_id: fields.parent_id || null,
      sort_order: item?.sort_order ?? 0,
    }

    try {
      let res: Response
      if (isEdit) {
        res = await fetch(`/api/backlog/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/backlog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed'); return }
      onSave(json.data as BacklogItem)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!item || !onDelete) return
    if (!confirm('Delete this task and all its subtasks?')) return
    setDeleting(true)
    try {
      await fetch(`/api/backlog/${item.id}`, { method: 'DELETE' })
      onDelete(item.id)
      onOpenChange(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Task' : parentId ? 'Add Subtask' : 'Add Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 mt-1">
          {/* Title */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Title</label>
            <input
              type="text"
              value={fields.title}
              onChange={(e) => set('title', e.target.value)}
              autoFocus
              required
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Description <span className="text-zinc-600">(optional)</span></label>
            <textarea
              value={fields.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>

          {/* Task type + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Task Type</label>
              <select
                value={fields.task_type}
                onChange={(e) => set('task_type', e.target.value as TaskType)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>{TASK_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Priority</label>
              <select
                value={fields.priority}
                onChange={(e) => set('priority', e.target.value as PriorityLevel)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status + Estimated minutes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Status</label>
              <select
                value={fields.status}
                onChange={(e) => set('status', e.target.value as BacklogItem['status'])}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Estimate (minutes)</label>
              <input
                type="number"
                value={fields.estimated_minutes}
                onChange={(e) => set('estimated_minutes', e.target.value)}
                min="1" max="960"
                placeholder="e.g. 90"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Due date + Parent task */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Due Date <span className="text-zinc-600">(optional)</span></label>
              <input
                type="date"
                value={fields.due_date}
                onChange={(e) => set('due_date', e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            {!parentId && (
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Parent Task <span className="text-zinc-600">(optional)</span></label>
                <select
                  value={fields.parent_id ?? ''}
                  onChange={(e) => set('parent_id', e.target.value || null)}
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="">— none —</option>
                  {topLevelItems
                    .filter((i) => i.id !== item?.id)
                    .map((i) => (
                      <option key={i.id} value={i.id}>{i.title}</option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2 pt-1">
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!fields.title.trim() || saving}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
