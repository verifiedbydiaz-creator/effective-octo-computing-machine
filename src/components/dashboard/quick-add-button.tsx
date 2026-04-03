'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TASK_TYPES, TASK_TYPE_LABELS } from '@/lib/constants'
import type { TaskType, PriorityLevel } from '@/lib/types'

const PRIORITIES: { value: PriorityLevel; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

export function QuickAddButton() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [taskType, setTaskType] = useState<TaskType>('DEEP_BUILD')
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM')
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setTitle('')
    setTaskType('DEEP_BUILD')
    setPriority('MEDIUM')
    setEstimatedMinutes('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/backlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          task_type: taskType,
          priority,
          estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
        }),
      })

      if (!response.ok) {
        const json = await response.json()
        setError(json.error ?? 'Failed to add task')
        return
      }

      reset()
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Floating action button — above mobile bottom nav */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Quick add to backlog"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white shadow-xl shadow-violet-900/40 flex items-center justify-center transition-colors z-30"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) reset()
          setOpen(value)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Add to Backlog</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            {/* Title */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                required
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Task type + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Task Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as TaskType)}
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  {TASK_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TASK_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estimated minutes */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">
                Estimated minutes{' '}
                <span className="text-zinc-600">(optional)</span>
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="e.g. 45"
                min="1"
                max="480"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { reset(); setOpen(false) }}
                className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || saving}
                className="flex-1 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Adding…' : 'Add to Backlog'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
