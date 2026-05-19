import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { toCsv } from '@/lib/export'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const platform = searchParams.get('platform') // 'instagram' | 'youtube'
    const type = searchParams.get('type') // 'metrics' | 'posts' | 'videos'
    const accountId = searchParams.get('accountId')
    const channelId = searchParams.get('channelId')
    const days = parseInt(searchParams.get('days') ?? '30', 10)

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    let rows: Record<string, unknown>[] = []
    let filename = `export-${platform}-${type}.csv`

    if (platform === 'instagram') {
      if (type === 'metrics') {
        const result = accountId
          ? await query(
              `SELECT * FROM instagram_metrics WHERE account_id = $1 AND date >= $2 ORDER BY date`,
              [accountId, since]
            )
          : await query(
              `SELECT * FROM instagram_metrics WHERE date >= $1 ORDER BY account_id, date`,
              [since]
            )
        rows = result.rows
        filename = `instagram-metrics-${days}d.csv`
      } else if (type === 'posts') {
        const result = accountId
          ? await query(
              `SELECT * FROM instagram_top_posts WHERE account_id = $1 ORDER BY likes + comments DESC`,
              [accountId]
            )
          : await query(
              `SELECT * FROM instagram_top_posts ORDER BY likes + comments DESC`
            )
        rows = result.rows
        filename = 'instagram-top-posts.csv'
      }
    } else if (platform === 'youtube') {
      if (type === 'metrics') {
        const result = channelId
          ? await query(
              `SELECT * FROM youtube_metrics WHERE channel_id = $1 AND date >= $2 ORDER BY date`,
              [channelId, since]
            )
          : await query(
              `SELECT * FROM youtube_metrics WHERE date >= $1 ORDER BY channel_id, date`,
              [since]
            )
        rows = result.rows
        filename = `youtube-metrics-${days}d.csv`
      } else if (type === 'videos') {
        const result = channelId
          ? await query(
              `SELECT * FROM youtube_top_videos WHERE channel_id = $1 ORDER BY views DESC`,
              [channelId]
            )
          : await query(`SELECT * FROM youtube_top_videos ORDER BY views DESC`)
        rows = result.rows
        filename = 'youtube-top-videos.csv'
      }
    }

    const csv = toCsv(rows)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/export]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
