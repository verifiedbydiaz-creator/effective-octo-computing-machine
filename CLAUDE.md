# CLAUDE.md — Command Center Productivity Tracker

## Project Overview
Personal productivity web app for a single user (Alejandro/Diaz). No auth needed.
Tracks 7 recurring task types, syncs with Google Calendar, manages a product backlog,
content publishing grid, outreach CRM, and daily/weekly metrics.

## Tech Stack
- Next.js 14 (App Router) with TypeScript
- Supabase (PostgreSQL) for database
- Tailwind CSS + shadcn/ui for UI components
- Google Calendar API for calendar sync
- Deployed on Vercel

## Project Structure
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── plan/page.tsx         # Night Planner
│   ├── backlog/page.tsx      # Product Backlog (Kanban)
│   ├── content/page.tsx      # Content Publishing Tracker
│   ├── outreach/page.tsx     # Outreach CRM
│   ├── review/page.tsx       # Weekly Review
│   ├── layout.tsx            # Root layout with sidebar nav
│   └── api/
│       ├── gcal/             # Google Calendar API routes
│       ├── backlog/          # Backlog CRUD
│       ├── time-blocks/      # Time block CRUD
│       ├── content/          # Content post CRUD
│       ├── outreach/         # Outreach contact CRUD
│       ├── daily-plans/      # Daily plan CRUD
│       ├── daily-metrics/    # Metrics CRUD
│       └── weekly-reviews/   # Weekly review CRUD
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── dashboard/            # Dashboard-specific components
│   ├── planner/              # Night planner components
│   ├── backlog/              # Kanban board components
│   ├── content/              # Content grid components
│   ├── outreach/             # CRM components
│   └── shared/               # Reusable components (nav, layout)
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── google-calendar.ts    # Google Calendar helpers
│   ├── types.ts              # TypeScript types
│   └── constants.ts          # Task types, colors, defaults
└── hooks/                    # Custom React hooks

## Key Constants
Task types and their colors (use consistently everywhere):
- CONTENT_PUBLISH → Blue (#3B82F6)
- DEEP_BUILD → Purple (#8B5CF6)
- OUTREACH → Green (#10B981)
- BIZ_OPS → Orange (#F59E0B)
- LEARNING → Cyan (#06B6D4)
- CONTENT_PLANNING → Indigo (#6366F1)
- MORNING_ROUTINE → Rose (#F43F5E)

## Default Daily Template (Night Planner)
06:00 — Wake up
06:30 — Gym (MORNING_ROUTINE)
08:00 — Shower + breakfast
09:00 — Deep Build Block 1 (DEEP_BUILD) [2.5 hrs]
11:30 — Content creation (CONTENT_PUBLISH) [1 hr]
12:30 — Lunch
13:30 — Deep Build Block 2 (DEEP_BUILD) [2 hrs]
15:30 — Outreach block (OUTREACH) [30 min]
16:00 — Learning block (LEARNING) [30 min]
16:30 — Content scheduling + admin [1 hr]
17:30 — Done

## Design Principles
- Dark mode by default, clean and minimal
- No clutter — every element earns its space
- Color-coded by task type everywhere
- Big numbers for metrics (easy to glance)
- Mobile-responsive (will be checked from phone)
- Fast — no loading spinners for basic operations

## Database
All tables are in Supabase. Enums: task_type, priority_level, task_status, platform, content_status, outreach_status.
Tables: daily_plans, backlog_items, time_blocks, content_posts, outreach_contacts, weekly_reviews, daily_metrics.
Use the Supabase JS client (@supabase/supabase-js) for all DB operations.
Server-side data fetching in Next.js server components where possible.
Client-side mutations with optimistic updates.

## Google Calendar Sync
- OAuth 2.0 flow for authentication
- Store refresh token in Supabase or .env
- Each time_block has a gcal_event_id for two-way sync
- Use googleapis npm package
- Color-code events by task type

## Code Style
- TypeScript strict mode
- Functional components with hooks
- Server components by default, 'use client' only when needed
- Descriptive variable names, no abbreviations
- Error handling on all Supabase and API calls

## What NOT to Do
- No authentication system (single user)
- No over-engineering — this is a personal tool
- No complex state management (React hooks + Supabase are enough)
- No separate CSS files — Tailwind only
- Don't add features not in the spec