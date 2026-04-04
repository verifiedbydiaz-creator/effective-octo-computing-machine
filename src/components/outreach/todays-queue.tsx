'use client'

import { Bell, CheckCheck, Clock } from 'lucide-react'
import { PLATFORM_ICON, PLATFORM_COLOR, addDaysToDate } from './outreach-constants'
import type { OutreachContact } from '@/lib/types'

interface Props {
  contacts: OutreachContact[]
  today: string
  onUpdate: (updated: OutreachContact) => void
  onCardClick: (contact: OutreachContact) => void
}

function daysOverdue(dateStr: string, today: string): number {
  const diff = new Date(today + 'T12:00:00').getTime() - new Date(dateStr + 'T12:00:00').getTime()
  return Math.floor(diff / 86_400_000)
}

export function TodaysQueue({ contacts, today, onUpdate, onCardClick }: Props) {
  if (contacts.length === 0) return null

  async function markContacted(contact: OutreachContact) {
    const patch = {
      last_contacted_at: today,
      status: contact.status === 'IDENTIFIED' ? 'CONTACTED' : contact.status,
      next_follow_up: addDaysToDate(today, 5),
    }
    const res = await fetch(`/api/outreach/${contact.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (res.ok) {
      const json = await res.json()
      onUpdate(json.data as OutreachContact)
    }
  }

  async function snooze(contact: OutreachContact) {
    const baseDate = contact.next_follow_up ?? today
    const patch = { next_follow_up: addDaysToDate(baseDate, 3) }
    const res = await fetch(`/api/outreach/${contact.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (res.ok) {
      const json = await res.json()
      onUpdate(json.data as OutreachContact)
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Bell size={14} className="text-amber-400" />
        <h2 className="text-sm font-semibold text-zinc-200">Today's Queue</h2>
        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
          {contacts.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {contacts.map((contact) => {
          const overdue = contact.next_follow_up
            ? daysOverdue(contact.next_follow_up, today)
            : 0
          const plColor = contact.platform ? PLATFORM_COLOR[contact.platform] : '#52525b'
          const plIcon = contact.platform ? PLATFORM_ICON[contact.platform] : '·'

          return (
            <div
              key={contact.id}
              className="bg-zinc-900 border border-amber-500/20 rounded-xl px-4 py-3 relative"
            >
              {/* Overdue badge */}
              {overdue > 0 && (
                <span className="absolute top-2.5 right-3 text-[10px] font-semibold text-amber-400">
                  {overdue}d overdue
                </span>
              )}
              {overdue === 0 && (
                <span className="absolute top-2.5 right-3 text-[10px] font-semibold text-emerald-400">
                  today
                </span>
              )}

              {/* Name + platform */}
              <button onClick={() => onCardClick(contact)} className="text-left w-full group">
                <div className="flex items-center gap-2 mb-1 pr-16">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ backgroundColor: `${plColor}20`, color: plColor }}
                  >
                    {plIcon}
                  </span>
                  <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                    {contact.name}
                  </p>
                </div>

                {(contact.role || contact.company) && (
                  <p className="text-xs text-zinc-500 mb-1 truncate">
                    {[contact.role, contact.company].filter(Boolean).join(' · ')}
                  </p>
                )}

                {contact.context && (
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {contact.context}
                  </p>
                )}
              </button>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => markContacted(contact)}
                  className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-xs font-medium text-emerald-400 border border-emerald-500/20 transition-colors"
                >
                  <CheckCheck size={12} /> Contacted
                </button>
                <button
                  onClick={() => snooze(contact)}
                  className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-400 border border-white/5 transition-colors"
                >
                  <Clock size={12} /> Snooze 3d
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
