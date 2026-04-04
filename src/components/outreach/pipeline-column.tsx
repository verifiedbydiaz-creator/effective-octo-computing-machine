'use client'

import { Plus } from 'lucide-react'
import { PLATFORM_ICON, PLATFORM_COLOR, daysSince } from './outreach-constants'
import type { OutreachContact } from '@/lib/types'
import type { PipelineStatus } from './outreach-constants'

interface Props {
  status: PipelineStatus
  label: string
  color: string
  contacts: OutreachContact[]
  draggingId: string | null
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: PipelineStatus) => void
  onCardClick: (contact: OutreachContact) => void
  onAddClick: () => void
}

export function PipelineColumn({
  status, label, color, contacts, draggingId,
  onDragStart, onDragEnd, onDragOver, onDrop,
  onCardClick, onAddClick,
}: Props) {
  return (
    <div
      className="flex flex-col min-w-[200px] flex-1"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold text-zinc-300">{label}</span>
          <span className="text-xs text-zinc-600 font-mono">{contacts.length}</span>
        </div>
        <button
          onClick={onAddClick}
          className="p-1 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-colors"
          title={`Add to ${label}`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 min-h-[80px] p-1.5 rounded-xl border border-transparent">
        {contacts.map((contact) => {
          const isDragging = draggingId === contact.id
          const plColor = contact.platform ? PLATFORM_COLOR[contact.platform] : '#52525b'
          const plIcon = contact.platform ? PLATFORM_ICON[contact.platform] : '·'
          const daysSinceLast = daysSince(contact.last_contacted_at)
          const isStale = daysSinceLast !== null && daysSinceLast > 7

          return (
            <div
              key={contact.id}
              draggable
              onDragStart={(e) => onDragStart(e, contact.id)}
              onDragEnd={onDragEnd}
              onClick={() => onCardClick(contact)}
              className={`bg-zinc-900 border border-white/8 rounded-xl px-3 py-2.5 cursor-pointer transition-all select-none group ${
                isDragging ? 'opacity-40 rotate-1 scale-95' : 'hover:border-white/20'
              }`}
            >
              {/* Name row */}
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ backgroundColor: `${plColor}20`, color: plColor }}
                >
                  {plIcon}
                </span>
                <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                  {contact.name}
                </p>
              </div>

              {/* Role / company */}
              {(contact.role || contact.company) && (
                <p className="text-xs text-zinc-600 truncate mb-1">
                  {[contact.role, contact.company].filter(Boolean).join(' · ')}
                </p>
              )}

              {/* Context snippet */}
              {contact.context && (
                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                  {contact.context}
                </p>
              )}

              {/* Days since */}
              {daysSinceLast !== null && (
                <p className={`text-[10px] mt-1.5 ${isStale ? 'text-amber-500' : 'text-zinc-700'}`}>
                  {daysSinceLast === 0
                    ? 'Contacted today'
                    : `${daysSinceLast}d since contact${isStale ? ' ⚠' : ''}`}
                </p>
              )}
            </div>
          )
        })}

        {contacts.length === 0 && (
          <div className="h-16 rounded-xl border border-dashed border-white/5 flex items-center justify-center">
            <span className="text-xs text-zinc-700">Drop here</span>
          </div>
        )}
      </div>
    </div>
  )
}
