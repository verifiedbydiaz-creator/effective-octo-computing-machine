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

export type TaskStatus = 'TODO' | 'THIS_WEEK' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'

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
  | 'IDENTIFIED'        // pipeline col 1
  | 'CONTACTED'         // pipeline col 2
  | 'RESPONDED'         // pipeline col 3
  | 'FOLLOW_UP'         // pipeline col 4
  | 'CONNECTED'         // pipeline col 5
  | 'TO_CONTACT'        // legacy / podcast guests
  | 'REPLIED'           // legacy
  | 'MEETING_SCHEDULED' // legacy
  | 'CLOSED'            // legacy
  | 'NOT_INTERESTED'    // legacy

// ─── Table row types ──────────────────────────────────────────────────────────

export interface DailyPlan {
  id: string
  date: string          // ISO date string YYYY-MM-DD
  wake_time: string | null  // HH:MM actual wake time
  desk_by_time: string | null // HH:MM actual desk-by time
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
  estimated_minutes: number | null
  due_date: string | null   // ISO date string YYYY-MM-DD
  parent_id: string | null  // subtask parent
  sort_order: number        // sort within column
  created_at: string
  updated_at: string
}

export interface ContentPost {
  id: string
  title: string
  body: string | null       // caption / content body
  platform: Platform
  status: ContentStatus
  scheduled_at: string | null // ISO date string YYYY-MM-DD (the planned publish date)
  published_at: string | null // ISO datetime string (actual publish time)
  post_link: string | null    // URL after publishing
  notes: string | null        // internal notes / idea seed
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface OutreachContact {
  id: string
  name: string
  company: string | null
  role: string | null
  handle: string | null        // @handle, email, or profile identifier
  platform: Platform | null
  profile_url: string | null
  status: OutreachStatus
  category: string | null      // 'PODCAST_GUEST' | 'NETWORKING' | 'CLIENT' | 'OTHER'
  context: string | null       // reason for reaching out / pitch angle
  last_contacted_at: string | null // ISO date string YYYY-MM-DD
  next_follow_up: string | null    // ISO date string YYYY-MM-DD
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WeeklyReview {
  id: string
  week_start: string            // ISO date string (Monday)
  wins: string | null           // What went right
  losses: string | null         // What didn't happen / misses
  lessons: string | null        // Adjustments for next week
  content_analytics: string | null // What content performed well
  next_week_focus: string | null   // Top 3 priorities (freeform)
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
  wake_time: string | null   // HH:MM copied from daily_plans
  weight_lbs: number | null  // optional daily check-in
  calories: number | null    // optional daily check-in
  overall_score: number | null // 1–10
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Supabase Database type (for typed client) ────────────────────────────────
// Must conform to GenericSchema from @supabase/supabase-js which requires
// Tables (with Relationships), Views, Functions, Enums, CompositeTypes.

type TableDef<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      daily_plans: TableDef<
        DailyPlan,
        Omit<DailyPlan, 'id' | 'created_at' | 'updated_at'>,
        Partial<Omit<DailyPlan, 'id' | 'created_at' | 'updated_at'>>
      >
      time_blocks: TableDef<
        TimeBlock,
        Omit<TimeBlock, 'id' | 'created_at' | 'updated_at'>,
        Partial<Omit<TimeBlock, 'id' | 'created_at' | 'updated_at'>>
      >
      backlog_items: TableDef<
        BacklogItem,
        Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>,
        Partial<Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>>
      >
      content_posts: TableDef<
        ContentPost,
        Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>,
        Partial<Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>>
      >
      outreach_contacts: TableDef<
        OutreachContact,
        Omit<OutreachContact, 'id' | 'created_at' | 'updated_at'>,
        Partial<Omit<OutreachContact, 'id' | 'created_at' | 'updated_at'>>
      >
      weekly_reviews: TableDef<
        WeeklyReview,
        Omit<WeeklyReview, 'id' | 'created_at' | 'updated_at'>,
        Partial<Omit<WeeklyReview, 'id' | 'created_at' | 'updated_at'>>
      >
      daily_metrics: TableDef<
        DailyMetrics,
        Omit<DailyMetrics, 'id' | 'created_at' | 'updated_at'>,
        Partial<Omit<DailyMetrics, 'id' | 'created_at' | 'updated_at'>>
      >
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      task_type: TaskType
      priority_level: PriorityLevel
      task_status: TaskStatus
      platform: Platform
      content_status: ContentStatus
      outreach_status: OutreachStatus
    }
    CompositeTypes: Record<string, never>
  }
}
