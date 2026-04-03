import { google } from 'googleapis'
import type { TaskType } from './types'
import { GCAL_COLOR_IDS } from './constants'

export const GCAL_TIMEZONE = process.env.GCAL_TIMEZONE ?? 'America/New_York'

export function getOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!,
  )
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  if (refreshToken) {
    client.setCredentials({ refresh_token: refreshToken })
  }
  return client
}

export function getCalendar() {
  return google.calendar({ version: 'v3', auth: getOAuth2Client() })
}

export function isGCalConnected(): boolean {
  return !!process.env.GOOGLE_REFRESH_TOKEN
}

export function getAuthUrl(): string {
  return getOAuth2Client().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar'],
  })
}

// Build a RFC3339 dateTime string for GCal from a date and HH:MM time
export function toGCalDateTime(date: string, time: string): string {
  return `${date}T${time}:00`
}

export interface GCalEventInput {
  title: string
  date: string       // YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string   // HH:MM
  task_type: TaskType | null
  description?: string
}

export async function createCalendarEvent(input: GCalEventInput): Promise<string> {
  const calendar = getCalendar()
  const { data } = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: input.title,
      description: input.description,
      start: {
        dateTime: toGCalDateTime(input.date, input.start_time),
        timeZone: GCAL_TIMEZONE,
      },
      end: {
        dateTime: toGCalDateTime(input.date, input.end_time),
        timeZone: GCAL_TIMEZONE,
      },
      colorId: input.task_type ? GCAL_COLOR_IDS[input.task_type] : undefined,
    },
  })
  return data.id!
}

export async function updateCalendarEvent(
  eventId: string,
  input: GCalEventInput,
): Promise<void> {
  const calendar = getCalendar()
  await calendar.events.update({
    calendarId: 'primary',
    eventId,
    requestBody: {
      summary: input.title,
      description: input.description,
      start: {
        dateTime: toGCalDateTime(input.date, input.start_time),
        timeZone: GCAL_TIMEZONE,
      },
      end: {
        dateTime: toGCalDateTime(input.date, input.end_time),
        timeZone: GCAL_TIMEZONE,
      },
      colorId: input.task_type ? GCAL_COLOR_IDS[input.task_type] : undefined,
    },
  })
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const calendar = getCalendar()
  await calendar.events.delete({ calendarId: 'primary', eventId })
}
