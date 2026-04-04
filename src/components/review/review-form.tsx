'use client'

import { useState, useCallback } from 'react'
import { Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { REVIEW_FIELDS, type ReviewFieldKey } from './review-constants'
import type { WeeklyReview } from '@/lib/types'

type FieldValues = Record<ReviewFieldKey, string>

interface Props {
  weekStart: string
  initialReview: WeeklyReview | null
  onSaved: (review: WeeklyReview) => void
}

function countFilled(values: FieldValues): number {
  return REVIEW_FIELDS.filter((f) => values[f.key].trim().length > 0).length
}

export function ReviewForm({ weekStart, initialReview, onSaved }: Props) {
  const [values, setValues] = useState<FieldValues>(() => {
    const v: FieldValues = {} as FieldValues
    REVIEW_FIELDS.forEach((f) => { v[f.key] = initialReview?.[f.key] ?? '' })
    return v
  })

  const [reviewId, setReviewId] = useState<string | null>(initialReview?.id ?? null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  function set(key: ReviewFieldKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (saveState === 'saved') setSaveState('idle')
  }

  const handleSave = useCallback(async () => {
    setSaveState('saving')

    const payload: Record<string, string | null> = { week_start: weekStart }
    REVIEW_FIELDS.forEach((f) => {
      payload[f.key] = values[f.key].trim() || null
    })

    try {
      let res: Response
      if (reviewId) {
        res = await fetch(`/api/weekly-reviews/${reviewId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/weekly-reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) { setSaveState('error'); return }
      const json = await res.json()
      const saved = json.data as WeeklyReview
      setReviewId(saved.id)
      onSaved(saved)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 3000)
    } catch {
      setSaveState('error')
    }
  }, [reviewId, weekStart, values, onSaved])

  const filled = countFilled(values)
  const total = REVIEW_FIELDS.length
  const pct = Math.round((filled / total) * 100)

  return (
    <div className="space-y-4">
      {/* Completion indicator + save button */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-zinc-500">Completion</span>
            <span className="text-xs font-medium text-zinc-400">
              {filled}/{total} fields
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                backgroundColor: pct === 100 ? '#10B981' : pct >= 60 ? '#8B5CF6' : '#3f3f46',
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
            saveState === 'saved'
              ? 'bg-green-600/20 text-green-400 border border-green-600/30'
              : saveState === 'error'
              ? 'bg-red-600/20 text-red-400 border border-red-600/30'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          {saveState === 'saving' ? <Loader2 size={14} className="animate-spin" />
          : saveState === 'saved'  ? <CheckCircle2 size={14} />
          : saveState === 'error'  ? <AlertCircle size={14} />
          : <Save size={14} />}
          {saveState === 'saving' ? 'Saving…'
          : saveState === 'saved'  ? 'Saved!'
          : saveState === 'error'  ? 'Error'
          : 'Save Review'}
        </button>
      </div>

      {/* Text fields */}
      {REVIEW_FIELDS.map((field) => {
        const filled = values[field.key].trim().length > 0
        return (
          <div key={field.key}>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
              <span>{field.emoji}</span>
              <span>{field.label}</span>
              {filled && <span className="text-green-500 text-xs ml-auto">✓</span>}
            </label>
            <textarea
              value={values[field.key]}
              onChange={(e) => set(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={field.key === 'next_week_focus' ? 4 : 3}
              className="w-full bg-zinc-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-violet-500 transition-colors resize-none leading-relaxed"
            />
          </div>
        )
      })}

      {/* Bottom save */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            saveState === 'saved'
              ? 'bg-green-600/20 text-green-400 border border-green-600/30'
              : saveState === 'error'
              ? 'bg-red-600/20 text-red-400 border border-red-600/30'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          {saveState === 'saving' ? <Loader2 size={14} className="animate-spin" />
          : saveState === 'saved'  ? <CheckCircle2 size={14} />
          : <Save size={14} />}
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved!' : 'Save Review'}
        </button>
      </div>
    </div>
  )
}
