'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { CATEGORY_OPTIONS, PIPELINE_COLUMNS, PLATFORM_ICON, PLATFORM_COLOR, STATUS_LABEL, daysSince } from './outreach-constants'
import type { OutreachContact, Platform, OutreachStatus } from '@/lib/types'

const ALL_PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'LINKEDIN',   label: 'LinkedIn' },
  { value: 'TWITTER',    label: 'X / Twitter' },
  { value: 'INSTAGRAM',  label: 'Instagram' },
  { value: 'YOUTUBE',    label: 'YouTube' },
  { value: 'NEWSLETTER', label: 'Email / Newsletter' },
  { value: 'OTHER',      label: 'Other' },
]

type Mode = 'add' | 'view'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  contact?: OutreachContact  // undefined = add mode
  onSave: (contact: OutreachContact) => void
  onDelete?: (id: string) => void
}

const empty = {
  name: '',
  company: '',
  role: '',
  handle: '',
  platform: '' as Platform | '',
  profile_url: '',
  context: '',
  notes: '',
  status: 'IDENTIFIED' as OutreachStatus,
  category: 'NETWORKING',
  next_follow_up: '',
  last_contacted_at: '',
}

export function ContactDialog({ open, onOpenChange, contact, onSave, onDelete }: Props) {
  const [mode, setMode] = useState<Mode>(contact ? 'view' : 'add')
  const [fields, setFields] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (contact) {
      setMode('view')
      setFields({
        name: contact.name,
        company: contact.company ?? '',
        role: contact.role ?? '',
        handle: contact.handle ?? '',
        platform: contact.platform ?? '',
        profile_url: contact.profile_url ?? '',
        context: contact.context ?? '',
        notes: contact.notes ?? '',
        status: contact.status,
        category: contact.category ?? 'NETWORKING',
        next_follow_up: contact.next_follow_up ?? '',
        last_contacted_at: contact.last_contacted_at ?? '',
      })
    } else {
      setMode('add')
      setFields(empty)
    }
    setError(null)
  }, [open, contact])

  function set<K extends keyof typeof fields>(k: K, v: (typeof fields)[K]) {
    setFields((p) => ({ ...p, [k]: v }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fields.name.trim()) return
    setSaving(true)
    setError(null)

    const payload = {
      name: fields.name.trim(),
      company: fields.company.trim() || null,
      role: fields.role.trim() || null,
      handle: fields.handle.trim() || null,
      platform: fields.platform || null,
      profile_url: fields.profile_url.trim() || null,
      context: fields.context.trim() || null,
      notes: fields.notes.trim() || null,
      status: fields.status,
      category: fields.category || null,
      next_follow_up: fields.next_follow_up || null,
      last_contacted_at: fields.last_contacted_at || null,
    }

    try {
      const res = contact
        ? await fetch(`/api/outreach/${contact.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/outreach', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed'); return }
      onSave(json.data as OutreachContact)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!contact || !onDelete) return
    if (!confirm(`Delete ${contact.name}?`)) return
    setDeleting(true)
    try {
      await fetch(`/api/outreach/${contact.id}`, { method: 'DELETE' })
      onDelete(contact.id)
      onOpenChange(false)
    } finally {
      setDeleting(false)
    }
  }

  const isEdit = !!contact
  const plColor = fields.platform ? PLATFORM_COLOR[fields.platform as Platform] : '#52525b'
  const daysSinceContact = contact ? daysSince(contact.last_contacted_at) : null

  // Build a simple timeline from status + dates
  const timeline: { label: string; date: string | null }[] = contact
    ? [
        { label: 'Added',           date: contact.created_at.split('T')[0] },
        contact.last_contacted_at
          ? { label: `Last contact (${STATUS_LABEL[contact.status]})`, date: contact.last_contacted_at }
          : { label: 'Not contacted yet', date: null },
        contact.next_follow_up
          ? { label: 'Follow-up due', date: contact.next_follow_up }
          : null,
      ].filter(Boolean) as { label: string; date: string | null }[]
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle>
              {isEdit ? (mode === 'view' ? contact!.name : 'Edit Contact') : 'Add Contact'}
            </DialogTitle>
            {isEdit && mode === 'view' && (
              <button
                onClick={() => setMode('add')}
                className="text-xs text-zinc-500 hover:text-white px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        </DialogHeader>

        {/* View mode — contact detail */}
        {isEdit && mode === 'view' && contact && (
          <div className="space-y-4 mt-1">
            {/* Meta */}
            <div className="flex flex-wrap gap-2">
              {contact.platform && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${PLATFORM_COLOR[contact.platform]}20`, color: PLATFORM_COLOR[contact.platform] }}
                >
                  {PLATFORM_ICON[contact.platform]} {contact.platform}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                {STATUS_LABEL[contact.status]}
              </span>
              {contact.category && (
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {contact.category.replace('_', ' ')}
                </span>
              )}
              {daysSinceContact !== null && (
                <span className={`text-xs px-2 py-0.5 rounded ${daysSinceContact > 7 ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  {daysSinceContact === 0 ? 'Contacted today' : `${daysSinceContact}d since contact`}
                </span>
              )}
            </div>

            {/* Role / company / handle */}
            {(contact.role || contact.company || contact.handle) && (
              <div className="text-sm text-zinc-400 space-y-0.5">
                {(contact.role || contact.company) && (
                  <p>{[contact.role, contact.company].filter(Boolean).join(' · ')}</p>
                )}
                {contact.handle && <p className="text-zinc-500">{contact.handle}</p>}
              </div>
            )}

            {/* Context */}
            {contact.context && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Context</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{contact.context}</p>
              </div>
            )}

            {/* Notes */}
            {contact.notes && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}

            {/* Follow-up date */}
            {contact.next_follow_up && (
              <div className="px-3 py-2 rounded-lg bg-violet-600/10 border border-violet-500/20">
                <p className="text-xs text-zinc-500">Next follow-up</p>
                <p className="text-sm text-white mt-0.5">
                  {new Date(contact.next_follow_up + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Timeline</p>
              <div className="space-y-2">
                {timeline.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                    <span className="text-sm text-zinc-400">{entry.label}</span>
                    {entry.date && (
                      <span className="text-xs text-zinc-600 ml-auto">
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-white/5">
              {onDelete && (
                <button onClick={handleDelete} disabled={deleting}
                  className="px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors disabled:opacity-50">
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              )}
              {contact.profile_url && (
                <a href={contact.profile_url} target="_blank" rel="noopener noreferrer"
                  className="ml-auto px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors">
                  View Profile ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* Add / Edit form */}
        {(!isEdit || mode === 'add') && (
          <form onSubmit={handleSave} className="space-y-3 mt-1">
            {/* Name */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Name</label>
              <input type="text" value={fields.name} onChange={(e) => set('name', e.target.value)}
                autoFocus required placeholder="Full name"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>

            {/* Role + Company */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Role</label>
                <input type="text" value={fields.role} onChange={(e) => set('role', e.target.value)}
                  placeholder="Founder, PM…"
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Company</label>
                <input type="text" value={fields.company} onChange={(e) => set('company', e.target.value)}
                  placeholder="Company"
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
            </div>

            {/* Platform + Handle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Platform</label>
                <select value={fields.platform} onChange={(e) => set('platform', e.target.value as Platform)}
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors">
                  <option value="">— none —</option>
                  {ALL_PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Handle / Email</label>
                <input type="text" value={fields.handle} onChange={(e) => set('handle', e.target.value)}
                  placeholder="@handle or email"
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
            </div>

            {/* Category + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Category</label>
                <select value={fields.category} onChange={(e) => set('category', e.target.value)}
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors">
                  {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Status</label>
                <select value={fields.status} onChange={(e) => set('status', e.target.value as OutreachStatus)}
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors">
                  {PIPELINE_COLUMNS.map((c) => <option key={c.status} value={c.status}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Context */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">
                Context / Reason <span className="text-zinc-600">(why reaching out)</span>
              </label>
              <input type="text" value={fields.context} onChange={(e) => set('context', e.target.value)}
                placeholder="Saw their post on building in public, want to collaborate…"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Notes <span className="text-zinc-600">(optional)</span></label>
              <textarea value={fields.notes} onChange={(e) => set('notes', e.target.value)}
                rows={3} placeholder="Full notes, conversation history…"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
            </div>

            {/* Profile URL */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Profile URL <span className="text-zinc-600">(optional)</span></label>
              <input type="url" value={fields.profile_url} onChange={(e) => set('profile_url', e.target.value)}
                placeholder="https://linkedin.com/in/…"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Last Contacted</label>
                <input type="date" value={fields.last_contacted_at} onChange={(e) => set('last_contacted_at', e.target.value)}
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Next Follow-Up</label>
                <input type="date" value={fields.next_follow_up} onChange={(e) => set('next_follow_up', e.target.value)}
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex gap-2 pt-1">
              {isEdit && onDelete && (
                <button type="button" onClick={handleDelete} disabled={deleting}
                  className="px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors disabled:opacity-50">
                  {deleting ? '…' : 'Delete'}
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button type="button" onClick={() => onOpenChange(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={!fields.name.trim() || saving}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors disabled:opacity-50">
                  {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
