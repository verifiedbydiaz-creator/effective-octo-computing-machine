'use client'

import { useState, useCallback, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { PIPELINE_COLUMNS, CATEGORY_TABS, isOverdue } from './outreach-constants'
import { TodaysQueue } from './todays-queue'
import { PipelineColumn } from './pipeline-column'
import { ContactDialog } from './contact-dialog'
import type { OutreachContact } from '@/lib/types'
import type { PipelineStatus } from './outreach-constants'

interface Props {
  initialContacts: OutreachContact[]
  today: string
}

export function OutreachBoard({ initialContacts, today }: Props) {
  const [contacts, setContacts] = useState<OutreachContact[]>(initialContacts)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('ALL')
  const [addOpen, setAddOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<OutreachContact | null>(null)

  // ── Filtering ──────────────────────────────────────────────────────────────
  const pipelineStatuses = new Set<string>(PIPELINE_COLUMNS.map((c) => c.status))

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      // Only pipeline statuses in the board
      if (!pipelineStatuses.has(c.status)) return false
      if (activeTab === 'ALL') return true
      return c.category === activeTab
    })
  }, [contacts, activeTab])

  const queueContacts = useMemo(() =>
    contacts.filter((c) =>
      c.next_follow_up && isOverdue(c.next_follow_up, today)
    ),
    [contacts, today],
  )

  function columnContacts(status: PipelineStatus) {
    return filtered.filter((c) => c.status === status)
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  function upsert(contact: OutreachContact) {
    setContacts((prev) => {
      const exists = prev.find((c) => c.id === contact.id)
      if (exists) return prev.map((c) => (c.id === contact.id ? contact : c))
      return [contact, ...prev]
    })
  }

  function remove(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  // ── Drag and drop ──────────────────────────────────────────────────────────
  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    setDraggingId(id)
  }

  function handleDragEnd() { setDraggingId(null) }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = useCallback(async (e: React.DragEvent, targetStatus: PipelineStatus) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    setDraggingId(null)
    if (!id) return

    const contact = contacts.find((c) => c.id === id)
    if (!contact || contact.status === targetStatus) return

    const patch: Partial<OutreachContact> = {
      status: targetStatus,
      last_contacted_at: targetStatus !== 'IDENTIFIED' ? today : contact.last_contacted_at,
    }

    // Optimistic
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    )

    try {
      const res = await fetch(`/api/outreach/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? (json.data as OutreachContact) : c)),
      )
    } catch {
      // Revert
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? contact : c)),
      )
    }
  }, [contacts, today])

  const totalContacts = contacts.filter((c) => pipelineStatuses.has(c.status)).length

  return (
    <div className="flex flex-col min-h-0">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Outreach</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{totalContacts} contacts in pipeline</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors self-start sm:self-auto"
        >
          <Plus size={15} /> Add Contact
        </button>
      </div>

      {/* ── Today's queue ───────────────────────────────────────────────────── */}
      <TodaysQueue
        contacts={queueContacts}
        today={today}
        onUpdate={upsert}
        onCardClick={setSelectedContact}
      />

      {/* ── Filter tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 border-b border-white/5 pb-3">
        {CATEGORY_TABS.map((tab) => {
          const count = tab.value === 'ALL'
            ? contacts.filter((c) => pipelineStatuses.has(c.status)).length
            : contacts.filter((c) => pipelineStatuses.has(c.status) && c.category === tab.value).length
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-zinc-600">{count}</span>
            </button>
          )
        })}
      </div>

      {/* ── Pipeline board ──────────────────────────────────────────────────── */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
        {PIPELINE_COLUMNS.map(({ status, label, color }) => (
          <PipelineColumn
            key={status}
            status={status}
            label={label}
            color={color}
            contacts={columnContacts(status)}
            draggingId={draggingId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onCardClick={setSelectedContact}
            onAddClick={() => setAddOpen(true)}
          />
        ))}
      </div>

      {/* ── Add contact dialog ───────────────────────────────────────────────── */}
      <ContactDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={(saved) => { upsert(saved); setAddOpen(false) }}
      />

      {/* ── Contact detail / edit dialog ─────────────────────────────────────── */}
      {selectedContact && (
        <ContactDialog
          open={!!selectedContact}
          onOpenChange={(v) => { if (!v) setSelectedContact(null) }}
          contact={selectedContact}
          onSave={(saved) => { upsert(saved); setSelectedContact(saved) }}
          onDelete={(id) => { remove(id); setSelectedContact(null) }}
        />
      )}
    </div>
  )
}
