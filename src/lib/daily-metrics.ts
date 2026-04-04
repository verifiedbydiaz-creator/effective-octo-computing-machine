/**
 * Server-side helper for upserting daily_metrics.
 * All API routes that affect tracked metrics call these functions.
 * Uses an upsert pattern: creates the row if it doesn't exist, patches if it does.
 */
import { supabase } from './supabase'

// ─── Upsert helper ────────────────────────────────────────────────────────────

async function getOrCreate(date: string): Promise<string> {
  // Try to find existing row
  const { data: existing } = await supabase
    .from('daily_metrics')
    .select('id')
    .eq('date', date)
    .single()

  if (existing) return (existing as { id: string }).id

  // Insert new row with defaults
  const { data: created, error } = await supabase
    .from('daily_metrics')
    .insert({
      date,
      deep_build_hours: 0,
      content_publish_count: 0,
      outreach_count: 0,
      learning_minutes: 0,
      gym_completed: false,
      wake_time: null,
      weight_lbs: null,
      calories: null,
      overall_score: null,
      notes: null,
    })
    .select('id')
    .single()

  if (error || !created) throw new Error(`Failed to create daily_metrics for ${date}: ${error?.message}`)
  return (created as { id: string }).id
}

async function patch(date: string, updates: Record<string, unknown>): Promise<void> {
  const id = await getOrCreate(date)
  await supabase.from('daily_metrics').update(updates).eq('id', id)
}

// ─── Increments ───────────────────────────────────────────────────────────────

/** Add minutes to deep_build_hours (convert to hours, add to existing) */
export async function addDeepWorkMinutes(date: string, minutes: number): Promise<void> {
  const id = await getOrCreate(date)
  const { data } = await supabase
    .from('daily_metrics')
    .select('deep_build_hours')
    .eq('id', id)
    .single()
  const current = (data as { deep_build_hours: number } | null)?.deep_build_hours ?? 0
  const added = Math.round((minutes / 60) * 100) / 100
  await supabase
    .from('daily_metrics')
    .update({ deep_build_hours: Math.round((current + added) * 100) / 100 })
    .eq('id', id)
}

/** Subtract minutes from deep_build_hours (for un-completing a block) */
export async function subtractDeepWorkMinutes(date: string, minutes: number): Promise<void> {
  const id = await getOrCreate(date)
  const { data } = await supabase
    .from('daily_metrics')
    .select('deep_build_hours')
    .eq('id', id)
    .single()
  const current = (data as { deep_build_hours: number } | null)?.deep_build_hours ?? 0
  const removed = Math.round((minutes / 60) * 100) / 100
  const next = Math.max(0, Math.round((current - removed) * 100) / 100)
  await supabase.from('daily_metrics').update({ deep_build_hours: next }).eq('id', id)
}

/** Add minutes to learning_minutes */
export async function addLearningMinutes(date: string, minutes: number): Promise<void> {
  const id = await getOrCreate(date)
  const { data } = await supabase
    .from('daily_metrics')
    .select('learning_minutes')
    .eq('id', id)
    .single()
  const current = (data as { learning_minutes: number } | null)?.learning_minutes ?? 0
  await supabase
    .from('daily_metrics')
    .update({ learning_minutes: current + minutes })
    .eq('id', id)
}

/** Subtract minutes from learning_minutes */
export async function subtractLearningMinutes(date: string, minutes: number): Promise<void> {
  const id = await getOrCreate(date)
  const { data } = await supabase
    .from('daily_metrics')
    .select('learning_minutes')
    .eq('id', id)
    .single()
  const current = (data as { learning_minutes: number } | null)?.learning_minutes ?? 0
  await supabase
    .from('daily_metrics')
    .update({ learning_minutes: Math.max(0, current - minutes) })
    .eq('id', id)
}

/** Increment content_publish_count by 1 */
export async function incrementContentPublished(date: string): Promise<void> {
  const id = await getOrCreate(date)
  const { data } = await supabase
    .from('daily_metrics')
    .select('content_publish_count')
    .eq('id', id)
    .single()
  const current = (data as { content_publish_count: number } | null)?.content_publish_count ?? 0
  await supabase
    .from('daily_metrics')
    .update({ content_publish_count: current + 1 })
    .eq('id', id)
}

/** Decrement content_publish_count by 1 (for un-publishing) */
export async function decrementContentPublished(date: string): Promise<void> {
  const id = await getOrCreate(date)
  const { data } = await supabase
    .from('daily_metrics')
    .select('content_publish_count')
    .eq('id', id)
    .single()
  const current = (data as { content_publish_count: number } | null)?.content_publish_count ?? 0
  await supabase
    .from('daily_metrics')
    .update({ content_publish_count: Math.max(0, current - 1) })
    .eq('id', id)
}

/** Increment outreach_count by 1 */
export async function incrementOutreach(date: string): Promise<void> {
  const id = await getOrCreate(date)
  const { data } = await supabase
    .from('daily_metrics')
    .select('outreach_count')
    .eq('id', id)
    .single()
  const current = (data as { outreach_count: number } | null)?.outreach_count ?? 0
  await supabase.from('daily_metrics').update({ outreach_count: current + 1 }).eq('id', id)
}

/** Set gym_completed flag */
export async function setGymCompleted(date: string, value: boolean): Promise<void> {
  await patch(date, { gym_completed: value })
}

/** Set wake_time */
export async function setWakeTime(date: string, wakeTime: string | null): Promise<void> {
  await patch(date, { wake_time: wakeTime })
}

/** Set weight + calories from check-in */
export async function setCheckIn(
  date: string,
  updates: { weight_lbs?: number | null; calories?: number | null }
): Promise<void> {
  await patch(date, updates)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Calculate block duration in minutes from HH:MM strings */
export function blockMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm))
}

/** Outreach statuses that count as "contacted" */
export const CONTACTED_STATUSES = new Set([
  'CONTACTED', 'RESPONDED', 'FOLLOW_UP', 'CONNECTED',
  'REPLIED', 'MEETING_SCHEDULED', 'CLOSED',
])
