import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const channelId = searchParams.get('channelId')
    const days = parseInt(searchParams.get('days') ?? '30', 10)

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const metricsQuery = channelId
      ? `SELECT * FROM youtube_metrics
         WHERE channel_id = $1 AND date >= $2
         ORDER BY date ASC`
      : `SELECT * FROM youtube_metrics
         WHERE date >= $1
         ORDER BY channel_id, date ASC`

    const metricsResult = channelId
      ? await query(metricsQuery, [channelId, since])
      : await query(metricsQuery, [since])

    const videosQuery = channelId
      ? `SELECT * FROM youtube_top_videos
         WHERE channel_id = $1
         ORDER BY views DESC
         LIMIT 10`
      : `SELECT * FROM youtube_top_videos
         ORDER BY views DESC
         LIMIT 10`

    const videosResult = channelId
      ? await query(videosQuery, [channelId])
      : await query(videosQuery)

    const latestResult = channelId
      ? await query(
          `SELECT ingested_at FROM youtube_metrics
           WHERE channel_id = $1
           ORDER BY ingested_at DESC LIMIT 1`,
          [channelId]
        )
      : await query(
          `SELECT ingested_at FROM youtube_metrics
           ORDER BY ingested_at DESC LIMIT 1`
        )

    const channels = await query(
      'SELECT id, channel_id, name FROM youtube_channels ORDER BY name'
    )

    const jobsResult = await query(
      `SELECT DISTINCT ON (account_id) account_id, status, error_message, completed_at, started_at
       FROM ingestion_jobs
       WHERE platform = 'youtube'
       ORDER BY account_id, started_at DESC`
    )

    // Sentiment cache for videos in result
    const videoIds = (videosResult.rows as Array<{ id: string }>).map((v) => v.id)
    let sentimentRows: unknown[] = []
    if (videoIds.length > 0) {
      const sentResult = await query(
        `SELECT video_id, positive_pct, neutral_pct, negative_pct, summary, analysed_at
         FROM comment_sentiment
         WHERE video_id = ANY($1)`,
        [videoIds]
      )
      sentimentRows = sentResult.rows
    }

    return NextResponse.json({
      metrics: metricsResult.rows,
      videos: videosResult.rows,
      last_updated: latestResult.rows[0]?.ingested_at ?? null,
      channels: channels.rows,
      jobs: jobsResult.rows,
      sentiment: sentimentRows,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/youtube/metrics]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
