import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/google-calendar'

export async function POST() {
  const url = getAuthUrl()
  return NextResponse.json({ url })
}
