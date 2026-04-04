'use client'

import { useState, useCallback } from 'react'
import { Plus, Save, Calendar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { DEFAULT_DAILY_TEMPLATE } from '@/lib/constants'
import type { BacklogItem, DailyPlan, TaskType, TimeBlock } from '@/lib/types'
import { TimeBlockRow } from './time-block-row'
import { BacklogSidebar } from './backlog-sidebar'
import { useToast } from '@/lib/toast-store'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocalBlock {
  tempId: string
  id: string | undefined
  title: string
  start_time: string
  end_time: string
  task_type: TaskType | null
  gcal_event_id: string | null
}

function makeLocalBlock(overrides?: Partial<LocalBlock>): LocalBlock {
  return {
    tempId: crypto.randomUUID(),
    id: undefined,
    title: '',
    start_time: '09:00',
    end_time: '10:00',
    task_type: null,
    gcal_event_id: null,
    ...overrides,
  }
}

function timeBlockToLocal(block: TimeBlock): LocalBlock {
  return {
    tempId: crypto.randomUUID(),
    id: block.id,
    title: block.title,
    start_time: block.start_time,
    end_time: block.end_time,
    task_type: block.task_type,
    gcal_event_id: block.gcal_event_id,
  }
}

function formatTomorrow(date: string): { weekday: string; full: string } {
  const d = new Date(date + 'T12:00:00')
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
    full: d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  tomorrow: string          // YYYY-MM-DD
  initialPlan: DailyPlan | null
  initialBlocks: TimeBlock[]
  backlogItems: BacklogItem[]
  isGCalConnected: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlannerClient({
  tomorrow,
  initialPlan,
  initialBlocks,
  backlogItems,
  isGCalConnected,
}: Props) {
  const { weekday, full } = formatTomorrow(tomorrow)

  const [blocks, setBlocks] = useState<LocalBlock[]>(() => {
    if (initialBlocks.length > 0) return initialBlocks.map(timeBlockToLocal)
    return DEFAULT_DAILY_TEMPLATE.map((t) =>
      makeLocalBlock({ title: t.title, start_time: t.start_time, end_time: t.end_time, task_type: t.task_type }),
    )
  })

  const [notes, setNotes] = useState(initialPlan?.notes ?? '')
  const [selectedTempId, setSelectedTempId] = useState<string | null>(null)
  const [planId, setPlanId] = useState<string | null>(initialPlan?.id ?? null)

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle')
  const [syncErrors, setSyncErrors] = useState<string[]>([])
  const [gcalConnecting, setGcalConnecting] = useState(false)
  const toast = useToast()

  // ── Block mutations ────────────────────────────────────────────────────────

  const updateBlock = useCallback((tempId: string, patch: Partial<LocalBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.tempId === tempId ? { ...b, ...patch } : b)),
    )
  }, [])

  const removeBlock = useCallback((tempId: string) => {
    setBlocks((prev) => prev.filter((b) => b.tempId !== tempId))
    setSelectedTempId((id) => (id === tempId ? null : id))
  }, [])

  const addBlock = useCallback(() => {
    const last = blocks[blocks.length - 1]
    const newBlock = makeLocalBlock({
      start_time: last?.end_time ?? '09:00',
      end_time: last?.end_time
        ? addMinutes(last.end_time, 60)
        : '10:00',
    })
    setBlocks((prev) => [...prev, newBlock])
    setSelectedTempId(newBlock.tempId)
  }, [blocks])

  const assignTitle = useCallback(
    (title: string) => {
      if (!selectedTempId) return
      updateBlock(selectedTempId, { title })
      setSelectedTempId(null)
    },
    [selectedTempId, updateBlock],
  )

  // ── Save plan ──────────────────────────────────────────────────────────────

  const savePlan = useCallback(async () => {
    setSaveState('saving')
    try {
      const response = await fetch('/api/plan/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: tomorrow,
          notes: notes || null,
          wake_time: initialPlan?.wake_time ?? null,
          desk_by_time: initialPlan?.desk_by_time ?? null,
          blocks: blocks.map((b) => ({
            title: b.title,
            start_time: b.start_time,
            end_time: b.end_time,
            task_type: b.task_type,
            gcal_event_id: b.gcal_event_id,
          })),
        }),
      })

      if (!response.ok) {
        setSaveState('error')
        toast('Failed to save plan', 'error')
        return
      }

      const json = await response.json()
      setPlanId(json.plan_id)

      // Update local blocks with IDs returned from DB
      const savedBlocks = json.blocks as Array<{ id: string; title: string; start_time: string; end_time: string; task_type: string; gcal_event_id: string | null }>
      if (savedBlocks?.length) {
        setBlocks((prev) =>
          prev.map((local, index) => ({
            ...local,
            id: savedBlocks[index]?.id ?? local.id,
            gcal_event_id: savedBlocks[index]?.gcal_event_id ?? local.gcal_event_id,
          })),
        )
      }

      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 3000)
    } catch {
      setSaveState('error')
      toast('Failed to save plan', 'error')
    }
  }, [tomorrow, notes, blocks, initialPlan, toast])

  // ── GCal sync ──────────────────────────────────────────────────────────────

  const syncToGCal = useCallback(async () => {
    if (!planId) {
      alert('Save the plan first before syncing to Google Calendar.')
      return
    }
    setSyncState('syncing')
    setSyncErrors([])

    try {
      const response = await fetch('/api/gcal/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daily_plan_id: planId }),
      })

      const json = await response.json()

      if (!response.ok) {
        setSyncState('error')
        setSyncErrors([json.error ?? 'Sync failed'])
        return
      }

      // Update blocks with gcal_event_ids
      if (json.synced?.length) {
        const idMap = new Map<string, string>(
          json.synced.map((s: { id: string; gcal_event_id: string }) => [s.id, s.gcal_event_id]),
        )
        setBlocks((prev) =>
          prev.map((b) =>
            b.id && idMap.has(b.id) ? { ...b, gcal_event_id: idMap.get(b.id)! } : b,
          ),
        )
      }

      if (json.errors?.length) {
        setSyncErrors(json.errors.map((e: { id: string; error: string }) => e.error))
        setSyncState('error')
      } else {
        setSyncState('synced')
        setTimeout(() => setSyncState('idle'), 3000)
      }
    } catch {
      setSyncState('error')
      setSyncErrors(['Network error'])
      toast('GCal sync failed', 'error')
    }
  }, [planId, toast])

  // ── GCal connect ──────────────────────────────────────────────────────────

  const connectGCal = useCallback(async () => {
    setGcalConnecting(true)
    try {
      const res = await fetch('/api/gcal/auth', { method: 'POST' })
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setGcalConnecting(false)
    }
  }, [])

  // ── Selected block title for sidebar ──────────────────────────────────────
  const selectedBlock = blocks.find((b) => b.tempId === selectedTempId)

  const syncedCount = blocks.filter((b) => b.gcal_event_id).length

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
            Night Planner
          </p>
          <h1 className="text-3xl font-bold text-white leading-none">{weekday}</h1>
          <p className="text-sm text-zinc-400 mt-1">{full}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* GCal connect / sync */}
          {!isGCalConnected ? (
            <button
              onClick={connectGCal}
              disabled={gcalConnecting}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
            >
              <Calendar size={15} />
              {gcalConnecting ? 'Connecting…' : 'Connect Google Calendar'}
            </button>
          ) : (
            <button
              onClick={syncToGCal}
              disabled={syncState === 'syncing'}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                syncState === 'synced'
                  ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                  : syncState === 'error'
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                  : 'border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              {syncState === 'syncing' ? (
                <Loader2 size={15} className="animate-spin" />
              ) : syncState === 'synced' ? (
                <CheckCircle2 size={15} />
              ) : syncState === 'error' ? (
                <AlertCircle size={15} />
              ) : (
                <Calendar size={15} />
              )}
              {syncState === 'syncing'
                ? 'Syncing…'
                : syncState === 'synced'
                ? `Synced ${blocks.length} blocks`
                : syncState === 'error'
                ? 'Sync failed'
                : syncedCount > 0
                ? `Re-sync (${syncedCount} synced)`
                : 'Sync to GCal'}
            </button>
          )}

          {/* Save */}
          <button
            onClick={savePlan}
            disabled={saveState === 'saving'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              saveState === 'saved'
                ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                : saveState === 'error'
                ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                : 'bg-violet-600 hover:bg-violet-500 text-white'
            }`}
          >
            {saveState === 'saving' ? (
              <Loader2 size={15} className="animate-spin" />
            ) : saveState === 'saved' ? (
              <CheckCircle2 size={15} />
            ) : saveState === 'error' ? (
              <AlertCircle size={15} />
            ) : (
              <Save size={15} />
            )}
            {saveState === 'saving'
              ? 'Saving…'
              : saveState === 'saved'
              ? 'Saved!'
              : saveState === 'error'
              ? 'Failed'
              : 'Save Plan'}
          </button>
        </div>
      </div>

      {syncErrors.length > 0 && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {syncErrors.join(', ')}
        </div>
      )}

      {/* ── Two-column layout ───────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">

        {/* Left 70% — time blocks */}
        <div className="flex-[7] min-w-0 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Schedule — {blocks.length} blocks
            </span>
            <button
              type="button"
              onClick={addBlock}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 transition-colors"
            >
              <Plus size={14} />
              Add Block
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1">
            {blocks.map((block) => (
              <TimeBlockRow
                key={block.tempId}
                block={block}
                isSelected={selectedTempId === block.tempId}
                onSelect={() =>
                  setSelectedTempId((id) =>
                    id === block.tempId ? null : block.tempId,
                  )
                }
                onChange={(patch) => updateBlock(block.tempId, patch)}
                onRemove={() => removeBlock(block.tempId)}
              />
            ))}
          </div>

          {/* Notes */}
          <div className="mt-5">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Notes for tomorrow
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context, goals, or anything you want to remember for tomorrow…"
              rows={4}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Right 30% — backlog sidebar */}
        <div className="flex-[3] min-w-0 lg:border-l lg:border-white/5 lg:pl-5">
          <BacklogSidebar
            backlogItems={backlogItems}
            selectedBlockTitle={selectedBlock?.title ?? null}
            hasSelectedBlock={selectedTempId !== null}
            onAssign={assignTitle}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const newH = Math.min(Math.floor(total / 60), 23)
  const newM = total % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}
