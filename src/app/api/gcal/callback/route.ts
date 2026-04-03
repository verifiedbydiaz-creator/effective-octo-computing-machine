import { NextResponse } from 'next/server'
import { getOAuth2Client } from '@/lib/google-calendar'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }

  const client = getOAuth2Client()
  const { tokens } = await client.getToken(code)

  if (!tokens.refresh_token) {
    return new NextResponse(
      `<html><body style="font-family:monospace;background:#111;color:#eee;padding:2rem">
        <h2 style="color:#f87171">No refresh token returned.</h2>
        <p>This usually happens if you already authorized this app. Revoke access at
        <a href="https://myaccount.google.com/permissions" style="color:#818cf8">
        myaccount.google.com/permissions</a> then try again.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } },
    )
  }

  return new NextResponse(
    `<html><body style="font-family:monospace;background:#111;color:#eee;padding:2rem;max-width:700px">
      <h2 style="color:#4ade80">&#10003; Google Calendar connected!</h2>
      <p>Add this line to your <code>.env.local</code> file, then restart the dev server:</p>
      <pre style="background:#1e1e2e;padding:1rem;border-radius:8px;overflow-x:auto;color:#a3e635">
GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}</pre>
      <p style="color:#71717a;font-size:0.875rem">Also add <code>GCAL_TIMEZONE=America/New_York</code>
      (or your timezone) if you haven't already.</p>
      <p><a href="/plan" style="color:#818cf8">← Back to Night Planner</a></p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } },
  )
}
