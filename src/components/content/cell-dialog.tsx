'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Trash2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  PLATFORM_LABEL, PLATFORM_COLOR, STATUS_OPTIONS,
} from './content-constants'
import type { ContentPost, Platform, ContentStatus } from '@/lib/types'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  date: string        // YYYY-MM-DD
  platform: Platform
  post: ContentPost | null  // null = no post yet for this cell
  onSave: (post: ContentPost) => void
  onDelete: (id: string) => void
}

const empty = {
  title: '',
  body: '',
  post_link: '',
  notes: '',
  status: 'PLANNED' as ContentStatus,
}

export function CellDialog({ open, onOpenChange, date, platform, post, onSave, onDelete }: Props) {
  const [fields, setFields] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const color = PLATFORM_COLOR[platform]

  useEffect(() => {
    if (!open) return
    if (post) {
      setFields({
        title: post.title,
        body: post.body ?? '',
        post_link: post.post_link ?? '',
        notes: post.notes ?? '',
        status: post.status,
      })
    } else {
      setFields({ ...empty, status: 'DRAFT' as ContentStatus })
    }
    setError(null)
  }, [open, post])

  function set<K extends keyof typeof fields>(k: K, v: (typeof fields)[K]) {
    setFields((p) => ({ ...p, [k]: v }))
  }

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fields.title.trim()) return
    setSaving(true)
    setError(null)
    const payload = {
      title: fields.title.trim(),
      body: fields.body.trim() || null,
      post_link: fields.post_link.trim() || null,
      notes: fields.notes.trim() || null,
      status: fields.status,
      platform,
      scheduled_at: date,
    }
    try {
      let res: Response
      if (post) {
        res = await fetch(`/api/content/${post.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed'); return }
      onSave(json.data as ContentPost)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!post) return
    if (!confirm('Delete this post?')) return
    setDeleting(true)
    try {
      await fetch(`/api/content/${post.id}`, { method: 'DELETE' })
      onDelete(post.id)
      onOpenChange(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            {PLATFORM_LABEL[platform]}
            <span className="text-zinc-500 font-normal text-sm">— {formattedDate}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3 mt-1">
          {/* Title */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Title / Topic</label>
            <input
              type="text"
              value={fields.title}
              onChange={(e) => set('title', e.target.value)}
              required
              autoFocus
              placeholder="What's this post about?"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('status', opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    fields.status === opt.value
                      ? 'bg-violet-600/30 border-violet-500/50 text-violet-300'
                      : 'bg-transparent border-white/10 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Caption / body */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              Caption / Body <span className="text-zinc-600">(optional)</span>
            </label>
            <textarea
              value={fields.body}
              onChange={(e) => set('body', e.target.value)}
              rows={4}
              placeholder="Draft your caption here…"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>

          {/* Post link */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 flex items-center gap-1">
              <ExternalLink size={11} /> Post Link <span className="text-zinc-600">(after publishing)</span>
            </label>
            <input
              type="url"
              value={fields.post_link}
              onChange={(e) => set('post_link', e.target.value)}
              placeholder="https://…"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Internal notes */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              Notes <span className="text-zinc-600">(internal)</span>
            </label>
            <input
              type="text"
              value={fields.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Hook idea, angle, reminder…"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2 pt-1">
            {post && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors disabled:opacity-50"
              >
                <Trash2 size={13} />
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
                {saving ? 'Saving…' : post ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
