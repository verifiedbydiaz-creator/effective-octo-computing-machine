import { NextResponse } from 'next/server'
import { getCalendar, isGCalConnected, GCAL_TIMEZONE, toGCalDateTime } from '@/lib/google-calendar'
import type { TaskType } from '@/lib/types'
import { GCAL_COLOR_IDS } from '@/lib/constants'

export async function GET(request: Request) {
  if (!isGCalConnected()) {
    return NextResponse.json({ error: 'Not connected' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  if (!date) {
    return NextResponse.json({ error: 'date param required' }, { status: 400 })
  }

  const calendar = getCalendar()
  const { data } = await calendar.events.list({
    calendarId: 'primary',
    timeMin: `${date}T00:00:00`,
    timeMax: `${date}T23:59:59`,
    timeZone: GCAL_TIMEZONE,
    singleEvents: true,
    orderBy: 'startTime',
  })

  return NextResponse.json({ data: data.items ?? [] })
}

export async function POST(request: Request) {
  if (!isGCalConnected()) {
    return NextResponse.json({ error: 'Not connected' }, { status: 401 })
  }

  const body = await request.json()
  const { title, date, start_time, end_time, task_type, description } = body as {
    title: string
    date: string
    start_time: string
    end_time: string
    task_type: TaskType | null
    description?: string
  }

  const calendar = getCalendar()
  const { data } = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: title,
      description,
      start: { dateTime: toGCalDateTime(date, start_time), timeZone: GCAL_TIMEZONE },
      end: { dateTime: toGCalDateTime(date, end_time), timeZone: GCAL_TIMEZONE },
      colorId: task_type ? GCAL_COLOR_IDS[task_type] : undefined,
    },
  })

  return NextResponse.json({ id: data.id }, { status: 201 })
}
