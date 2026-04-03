// ─── Enums ────────────────────────────────────────────────────────────────────

export type TaskType =
  | 'CONTENT_PUBLISH'
  | 'DEEP_BUILD'
  | 'OUTREACH'
  | 'BIZ_OPS'
  | 'LEARNING'
  | 'CONTENT_PLANNING'
  | 'MORNING_ROUTINE'

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'

export type Platform =
  | 'TWITTER'
  | 'LINKEDIN'
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'TIKTOK'
  | 'NEWSLETTER'
  | 'OTHER'

export type ContentStatus = 'IDEA' | 'DRAFT' | 'READY' | 'SCHEDULED' | 'PUBLISHED'

export type OutreachStatus =
  | 'TO_CONTACT'
  | 'CONTACTED'
  | 'REPLIED'
  | 'MEETING_SCHEDULED'
  | 'CLOSED'
  | 'NOT_INTERESTED'

// ─── Table row types ──────────────────────────────────────────────────────────

export interface DailyPlan {
  id: string
  date: string // ISO date string YYYY-MM-DD
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TimeBlock {
  id: string
  daily_plan_id: string
  task_type: TaskType
  title: string
  start_time: string // HH:MM
  end_time: string   // HH:MM
  completed: boolean
  notes: string | null
  gcal_event_id: string | null
  created_at: string
  updated_at: string
}

export interface BacklogItem {
  id: string
  title: string
  description: string | null
  task_type: TaskType
  priority: PriorityLevel
  status: TaskStatus
  due_date: string | null // ISO date string
  created_at: string
  updated_at: string
}

export interface ContentPost {
  id: string
  title: string
  body: string | null
  platform: Platform
  status: ContentStatus
  scheduled_at: string | null // ISO datetime string
  published_at: string | null // ISO datetime string
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface OutreachContact {
  id: string
  name: string
  company: string | null
  role: string | null
  platform: Platform | null
  profile_url: string | null
  status: OutreachStatus
  last_contacted_at: string | null // ISO datetime string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WeeklyReview {
  id: string
  week_start: string // ISO date string (Monday)
  wins: string | null
  losses: string | null
  lessons: string | null
  next_week_focus: string | null
  created_at: string
  updated_at: string
}

export interface DailyMetrics {
  id: string
  date: string // ISO date string YYYY-MM-DD
  deep_build_hours: number
  content_publish_count: number
  outreach_count: number
  learning_minutes: number
  gym_completed: boolean
  overall_score: number | null // 1–10
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Supabase Database type (for typed client) ────────────────────────────────

export interface Database {
  public: {
    Tables: {
      daily_plans: {
        Row: DailyPlan
        Insert: Omit<DailyPlan, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DailyPlan, 'id' | 'created_at' | 'updated_at'>>
      }
      time_blocks: {
        Row: TimeBlock
        Insert: Omit<TimeBlock, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TimeBlock, 'id' | 'created_at' | 'updated_at'>>
      }
      backlog_items: {
        Row: BacklogItem
        Insert: Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>>
      }
      content_posts: {
        Row: ContentPost
        Insert: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>>
      }
      outreach_contacts: {
        Row: OutreachContact
        Insert: Omit<OutreachContact, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<OutreachContact, 'id' | 'created_at' | 'updated_at'>>
      }
      weekly_reviews: {
        Row: WeeklyReview
        Insert: Omit<WeeklyReview, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<WeeklyReview, 'id' | 'created_at' | 'updated_at'>>
      }
      daily_metrics: {
        Row: DailyMetrics
        Insert: Omit<DailyMetrics, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DailyMetrics, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Enums: {
      task_type: TaskType
      priority_level: PriorityLevel
      task_status: TaskStatus
      platform: Platform
      content_status: ContentStatus
      outreach_status: OutreachStatus
    }
  }
}
