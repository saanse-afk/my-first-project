import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const accountId = searchParams.get('accountId')
    const days = parseInt(searchParams.get('days') ?? '30', 10)

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    // Metrics over time
    const metricsQuery = accountId
      ? `SELECT * FROM instagram_metrics
         WHERE account_id = $1 AND date >= $2
         ORDER BY date ASC`
      : `SELECT * FROM instagram_metrics
         WHERE date >= $1
         ORDER BY account_id, date ASC`

    const metricsResult = accountId
      ? await query(metricsQuery, [accountId, since])
      : await query(metricsQuery, [since])

    // Top posts
    const postsQuery = accountId
      ? `SELECT * FROM instagram_top_posts
         WHERE account_id = $1
         ORDER BY likes + comments DESC
         LIMIT 12`
      : `SELECT * FROM instagram_top_posts
         ORDER BY likes + comments DESC
         LIMIT 12`

    const postsResult = accountId
      ? await query(postsQuery, [accountId])
      : await query(postsQuery)

    // Latest ingestion timestamp
    const latestResult = accountId
      ? await query(
          `SELECT ingested_at FROM instagram_metrics
           WHERE account_id = $1
           ORDER BY ingested_at DESC LIMIT 1`,
          [accountId]
        )
      : await query(
          `SELECT ingested_at FROM instagram_metrics
           ORDER BY ingested_at DESC LIMIT 1`
        )

    // Accounts list
    const accounts = await query(
      'SELECT id, username, name FROM instagram_accounts ORDER BY username'
    )

    // Latest job status per account
    const jobsResult = await query(
      `SELECT DISTINCT ON (account_id) account_id, status, error_message, completed_at, started_at
       FROM ingestion_jobs
       WHERE platform = 'instagram'
       ORDER BY account_id, started_at DESC`
    )

    return NextResponse.json({
      metrics: metricsResult.rows,
      posts: postsResult.rows,
      last_updated: latestResult.rows[0]?.ingested_at ?? null,
      accounts: accounts.rows,
      jobs: jobsResult.rows,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/instagram/metrics]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
