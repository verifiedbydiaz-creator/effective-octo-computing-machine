import { NextResponse } from 'next/server'
import { getCalendar, isGCalConnected, GCAL_TIMEZONE, toGCalDateTime } from '@/lib/google-calendar'
import type { TaskType } from '@/lib/types'
import { GCAL_COLOR_IDS } from '@/lib/constants'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isGCalConnected()) {
    return NextResponse.json({ error: 'Not connected' }, { status: 401 })
  }

  const { id } = await params
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
  await calendar.events.update({
    calendarId: 'primary',
    eventId: id,
    requestBody: {
      summary: title,
      description,
      start: { dateTime: toGCalDateTime(date, start_time), timeZone: GCAL_TIMEZONE },
      end: { dateTime: toGCalDateTime(date, end_time), timeZone: GCAL_TIMEZONE },
      colorId: task_type ? GCAL_COLOR_IDS[task_type] : undefined,
    },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isGCalConnected()) {
    return NextResponse.json({ error: 'Not connected' }, { status: 401 })
  }

  const { id } = await params
  const calendar = getCalendar()
  await calendar.events.delete({ calendarId: 'primary', eventId: id })

  return NextResponse.json({ ok: true })
}
