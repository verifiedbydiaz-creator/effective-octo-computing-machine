'use client'

import { useState } from 'react'
import { Plus, Mic } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { PODCAST_DAY } from './content-constants'
import type { OutreachContact, OutreachStatus } from '@/lib/types'

const GUEST_STATUS_OPTIONS: { value: OutreachStatus; label: string; color: string }[] = [
  { value: 'TO_CONTACT',        label: 'Prospect',    color: '#52525b' },
  { value: 'CONTACTED',         label: 'Reached Out', color: '#F59E0B' },
  { value: 'REPLIED',           label: 'Replied',     color: '#06B6D4' },
  { value: 'MEETING_SCHEDULED', label: 'Confirmed',   color: '#10B981' },
  { value: 'CLOSED',            label: 'Done',        color: '#8B5CF6' },
  { value: 'NOT_INTERESTED',    label: 'Passed',      color: '#F43F5E' },
]

const STATUS_COLOR: Record<OutreachStatus, string> = Object.fromEntries(
  GUEST_STATUS_OPTIONS.map((o) => [o.value, o.color])
) as Record<OutreachStatus, string>

const STATUS_LABEL: Record<OutreachStatus, string> = Object.fromEntries(
  GUEST_STATUS_OPTIONS.map((o) => [o.value, o.label])
) as Record<OutreachStatus, string>

function nextPodcastDate(): string {
  const today = new Date()
  const diff = (PODCAST_DAY - today.getDay() + 7) % 7
  const next = new Date(today)
  next.setDate(today.getDate() + (diff === 0 ? 7 : diff))
  return next.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

interface Props {
  initialGuests: OutreachContact[]
}

export function PodcastSection({ initialGuests }: Props) {
  const [guests, setGuests] = useState<OutreachContact[]>(initialGuests)
  const [addOpen, setAddOpen] = useState(false)

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim() || null,
          role: role.trim() || null,
          notes: notes.trim() || null,
          status: 'TO_CONTACT',
          category: 'PODCAST_GUEST',
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setGuests((prev) => [json.data as OutreachContact, ...prev])
        setName(''); setCompany(''); setRole(''); setNotes('')
        setAddOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  async function cycleStatus(guest: OutreachContact) {
    const order: OutreachStatus[] = ['TO_CONTACT', 'CONTACTED', 'REPLIED', 'MEETING_SCHEDULED', 'CLOSED', 'NOT_INTERESTED']
    const idx = order.indexOf(guest.status)
    const next = order[(idx + 1) % order.length]

    setGuests((prev) => prev.map((g) => g.id === guest.id ? { ...g, status: next } : g))
    await fetch(`/api/outreach/${guest.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
  }

  const podcastDate = nextPodcastDate()
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][PODCAST_DAY]

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mic size={15} className="text-violet-400" />
          <h2 className="text-sm font-semibold text-zinc-300">Podcast Pipeline</h2>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
        >
          <Plus size={12} /> Add Guest
        </button>
      </div>

      {/* Next episode */}
      <div className="mb-4 px-3 py-2.5 bg-violet-600/10 border border-violet-500/20 rounded-xl">
        <p className="text-xs text-zinc-500">Next episode ({dayName}s)</p>
        <p className="text-sm font-medium text-white mt-0.5">{podcastDate}</p>
      </div>

      {/* Guest pipeline */}
      {guests.length === 0 ? (
        <p className="text-sm text-zinc-700 text-center py-4">No guest prospects yet.</p>
      ) : (
        <div className="space-y-2">
          {guests.map((guest) => {
            const color = STATUS_COLOR[guest.status]
            return (
              <div key={guest.id} className="flex items-center gap-3 px-3 py-2.5 bg-zinc-800/60 rounded-xl border border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 font-medium truncate">{guest.name}</p>
                  {(guest.company || guest.role) && (
                    <p className="text-xs text-zinc-600 mt-0.5 truncate">
                      {[guest.role, guest.company].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => cycleStatus(guest)}
                  title="Click to advance status"
                  className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {STATUS_LABEL[guest.status]}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add guest dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Guest Prospect</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3 mt-1">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus required
                placeholder="Guest name"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Role</label>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Founder, Author…"
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Company</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company"
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Notes <span className="text-zinc-600">(optional)</span></label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Why them, intro source…"
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setAddOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" disabled={!name.trim() || saving} className="flex-1 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors disabled:opacity-50">
                {saving ? 'Adding…' : 'Add Guest'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
