'use client'

import { useState } from 'react'
import { Plus, Lightbulb, Calendar } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { PLATFORM_COLOR, PLATFORM_LABEL, ALL_PLATFORMS } from './content-constants'
import type { ContentPost, Platform } from '@/lib/types'

interface Props {
  initialIdeas: ContentPost[]
  onIdeaScheduled: (updated: ContentPost) => void
}

export function IdeasBank({ initialIdeas, onIdeaScheduled }: Props) {
  const [ideas, setIdeas] = useState<ContentPost[]>(initialIdeas)
  const [addOpen, setAddOpen] = useState(false)
  const [scheduleItem, setScheduleItem] = useState<ContentPost | null>(null)

  // ── Add idea ───────────────────────────────────────────────────────────────
  const [addTitle, setAddTitle] = useState('')
  const [addPlatform, setAddPlatform] = useState<Platform>('LINKEDIN')
  const [addNotes, setAddNotes] = useState('')
  const [addSaving, setAddSaving] = useState(false)

  async function handleAddIdea(e: React.FormEvent) {
    e.preventDefault()
    if (!addTitle.trim()) return
    setAddSaving(true)
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addTitle.trim(),
          platform: addPlatform,
          status: 'IDEA',
          notes: addNotes.trim() || null,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setIdeas((prev) => [json.data as ContentPost, ...prev])
        setAddTitle('')
        setAddNotes('')
        setAddPlatform('LINKEDIN')
        setAddOpen(false)
      }
    } finally {
      setAddSaving(false)
    }
  }

  // ── Schedule idea ─────────────────────────────────────────────────────────
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleSaving, setScheduleSaving] = useState(false)

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault()
    if (!scheduleItem || !scheduleDate) return
    setScheduleSaving(true)
    try {
      const res = await fetch(`/api/content/${scheduleItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT', scheduled_at: scheduleDate }),
      })
      const json = await res.json()
      if (res.ok) {
        const updated = json.data as ContentPost
        setIdeas((prev) => prev.filter((i) => i.id !== updated.id))
        onIdeaScheduled(updated)
        setScheduleItem(null)
        setScheduleDate('')
      }
    } finally {
      setScheduleSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb size={15} className="text-yellow-400" />
          <h2 className="text-sm font-semibold text-zinc-300">Ideas Bank</h2>
          {ideas.length > 0 && (
            <span className="text-xs text-zinc-600">({ideas.length})</span>
          )}
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
        >
          <Plus size={12} /> Add Idea
        </button>
      </div>

      {ideas.length === 0 ? (
        <p className="text-sm text-zinc-700 py-6 text-center">
          No ideas yet. Add one to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ideas.map((idea) => {
            const color = PLATFORM_COLOR[idea.platform]
            return (
              <div
                key={idea.id}
                className="group bg-zinc-900 border border-white/8 rounded-xl px-3.5 py-3 relative"
              >
                <div
                  className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="pl-2.5">
                  <p className="text-sm text-zinc-300 leading-snug">{idea.title}</p>
                  {idea.notes && (
                    <p className="text-xs text-zinc-600 mt-1 leading-snug line-clamp-2">{idea.notes}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${color}1a`, color }}
                    >
                      {PLATFORM_LABEL[idea.platform]}
                    </span>
                    <button
                      onClick={() => { setScheduleItem(idea); setScheduleDate('') }}
                      className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-violet-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Calendar size={10} /> Schedule
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add idea dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Content Idea</DialogTitle></DialogHeader>
          <form onSubmit={handleAddIdea} className="space-y-3 mt-1">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Idea / Title</label>
              <input
                type="text"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                autoFocus required
                placeholder="What's the idea?"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Platform</label>
              <select
                value={addPlatform}
                onChange={(e) => setAddPlatform(e.target.value as Platform)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                {ALL_PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">
                Notes <span className="text-zinc-600">(optional)</span>
              </label>
              <input
                type="text"
                value={addNotes}
                onChange={(e) => setAddNotes(e.target.value)}
                placeholder="Hook, angle, reference…"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setAddOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" disabled={!addTitle.trim() || addSaving} className="flex-1 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors disabled:opacity-50">
                {addSaving ? 'Adding…' : 'Add Idea'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule dialog */}
      <Dialog open={!!scheduleItem} onOpenChange={(v) => { if (!v) setScheduleItem(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Schedule Idea</DialogTitle>
          </DialogHeader>
          {scheduleItem && (
            <form onSubmit={handleSchedule} className="space-y-3 mt-1">
              <p className="text-sm text-zinc-400">
                Schedule <span className="text-white">"{scheduleItem.title}"</span> on{' '}
                <span style={{ color: PLATFORM_COLOR[scheduleItem.platform] }}>
                  {PLATFORM_LABEL[scheduleItem.platform]}
                </span>
              </p>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  required
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setScheduleItem(null)} className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={!scheduleDate || scheduleSaving} className="flex-1 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors disabled:opacity-50">
                  {scheduleSaving ? 'Scheduling…' : 'Move to Grid'}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
