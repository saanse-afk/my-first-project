import { NextRequest } from 'next/server'

// Vercel Cron: runs daily at 6:00 AM IST (00:30 UTC)
// vercel.json: { "crons": [{ "path": "/api/cron/daily-sync", "schedule": "30 0 * * *" }] }

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized triggering
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const results: Record<string, unknown> = {}

  // Sync Instagram
  if (process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    try {
      const res = await fetch(`${baseUrl}/api/sync/instagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      results.instagram = await res.json()
    } catch (err) {
      results.instagram = { error: String(err) }
    }
  }

  // Sync YouTube (optional)
  if (process.env.YOUTUBE_CHANNEL_ID && process.env.YOUTUBE_REFRESH_TOKEN) {
    try {
      const res = await fetch(`${baseUrl}/api/sync/youtube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      results.youtube = await res.json()
    } catch (err) {
      results.youtube = { error: String(err) }
    }
  }

  return Response.json({
    success: true,
    timestamp: new Date().toISOString(),
    results,
  })
}
