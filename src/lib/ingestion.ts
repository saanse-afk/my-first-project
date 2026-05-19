import { query } from './db'
import {
  fetchProfileMetrics,
  fetchInsights,
  fetchTopPosts,
  getInstagramAccounts,
  InstagramAccount,
} from './instagram'
import {
  fetchChannelStats,
  fetchAnalyticsMetrics,
  fetchTopVideos,
  getYouTubeChannels,
  YouTubeChannel,
} from './youtube'

async function createJob(platform: 'instagram' | 'youtube', accountId: string): Promise<number> {
  const result = await query<{ id: number }>(
    `INSERT INTO ingestion_jobs (platform, account_id, status, started_at)
     VALUES ($1, $2, 'running', NOW())
     RETURNING id`,
    [platform, accountId]
  )
  return result.rows[0].id
}

async function completeJob(jobId: number): Promise<void> {
  await query(
    `UPDATE ingestion_jobs SET status = 'success', completed_at = NOW() WHERE id = $1`,
    [jobId]
  )
}

async function failJob(jobId: number, error: string): Promise<void> {
  await query(
    `UPDATE ingestion_jobs SET status = 'failed', error_message = $1, completed_at = NOW() WHERE id = $2`,
    [error.slice(0, 1000), jobId]
  )
}

export async function ingestInstagramAccount(account: InstagramAccount): Promise<void> {
  const jobId = await createJob('instagram', account.id)
  try {
    const [profile, insights, posts] = await Promise.all([
      fetchProfileMetrics(account),
      fetchInsights(account),
      fetchTopPosts(account),
    ])

    const today = new Date().toISOString().split('T')[0]

    // Calculate engagement rate from last 12 posts
    const totalEngagement = posts.reduce(
      (sum, p) => sum + (p.like_count ?? 0) + (p.comments_count ?? 0),
      0
    )
    const engagementRate =
      profile.followers_count > 0
        ? (totalEngagement / posts.length / profile.followers_count) * 100
        : 0

    await query(
      `INSERT INTO instagram_metrics
         (account_id, date, followers, following, posts_count, reach, impressions,
          profile_visits, website_clicks, engagement_rate, ingested_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (account_id, date) DO UPDATE SET
         followers = EXCLUDED.followers,
         following = EXCLUDED.following,
         posts_count = EXCLUDED.posts_count,
         reach = EXCLUDED.reach,
         impressions = EXCLUDED.impressions,
         profile_visits = EXCLUDED.profile_visits,
         website_clicks = EXCLUDED.website_clicks,
         engagement_rate = EXCLUDED.engagement_rate,
         ingested_at = NOW()`,
      [
        account.id,
        today,
        profile.followers_count,
        profile.follows_count,
        profile.media_count,
        insights.reach,
        insights.impressions,
        insights.profile_visits,
        insights.website_clicks,
        engagementRate.toFixed(2),
      ]
    )

    // Upsert top posts
    for (const post of posts) {
      await query(
        `INSERT INTO instagram_top_posts
           (id, account_id, media_type, thumbnail_url, caption, likes, comments, saves, reach, timestamp, ingested_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, $8, NOW())
         ON CONFLICT (id) DO UPDATE SET
           likes = EXCLUDED.likes,
           comments = EXCLUDED.comments,
           ingested_at = NOW()`,
        [
          post.id,
          account.id,
          post.media_type,
          post.thumbnail_url ?? null,
          post.caption ?? null,
          post.like_count,
          post.comments_count,
          post.timestamp,
        ]
      )
    }

    await completeJob(jobId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[ingestion] Instagram account ${account.id} failed:`, msg)
    await failJob(jobId, msg)
    throw err
  }
}

export async function ingestYouTubeChannel(channel: YouTubeChannel): Promise<void> {
  const jobId = await createJob('youtube', channel.id)
  try {
    const today = new Date().toISOString().split('T')[0]
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const [stats, analytics, topVideos] = await Promise.all([
      fetchChannelStats(channel),
      fetchAnalyticsMetrics(channel, thirtyDaysAgo, today),
      fetchTopVideos(channel),
    ])

    await query(
      `INSERT INTO youtube_metrics
         (channel_id, date, subscribers, total_views, watch_time_hours, avg_view_duration,
          engagement_rate, impressions, ctr, ingested_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (channel_id, date) DO UPDATE SET
         subscribers = EXCLUDED.subscribers,
         total_views = EXCLUDED.total_views,
         watch_time_hours = EXCLUDED.watch_time_hours,
         avg_view_duration = EXCLUDED.avg_view_duration,
         engagement_rate = EXCLUDED.engagement_rate,
         impressions = EXCLUDED.impressions,
         ctr = EXCLUDED.ctr,
         ingested_at = NOW()`,
      [
        channel.id,
        today,
        stats.subscribers,
        stats.total_views,
        analytics.watch_time_hours.toFixed(2),
        analytics.avg_view_duration,
        analytics.engagement_rate.toFixed(2),
        analytics.impressions,
        analytics.ctr.toFixed(2),
      ]
    )

    for (const video of topVideos) {
      await query(
        `INSERT INTO youtube_top_videos
           (id, channel_id, title, thumbnail_url, views, likes, comments,
            watch_time_hours, avg_view_duration, ctr, published_at, ingested_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         ON CONFLICT (id) DO UPDATE SET
           views = EXCLUDED.views,
           likes = EXCLUDED.likes,
           comments = EXCLUDED.comments,
           ingested_at = NOW()`,
        [
          video.id,
          channel.id,
          video.title,
          video.thumbnail_url,
          video.views,
          video.likes,
          video.comments,
          video.watch_time_hours.toFixed(2),
          video.avg_view_duration,
          video.ctr.toFixed(2),
          video.published_at,
        ]
      )
    }

    await completeJob(jobId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[ingestion] YouTube channel ${channel.id} failed:`, msg)
    await failJob(jobId, msg)
    throw err
  }
}

export async function ingestAllInstagram(): Promise<{
  success: string[]
  failed: Array<{ id: string; error: string }>
}> {
  const accounts = await getInstagramAccounts()
  const success: string[] = []
  const failed: Array<{ id: string; error: string }> = []

  for (const account of accounts) {
    try {
      await ingestInstagramAccount(account)
      success.push(account.id)
    } catch (err) {
      failed.push({ id: account.id, error: err instanceof Error ? err.message : String(err) })
    }
  }

  return { success, failed }
}

export async function ingestAllYouTube(): Promise<{
  success: string[]
  failed: Array<{ id: string; error: string }>
}> {
  const channels = await getYouTubeChannels()
  const success: string[] = []
  const failed: Array<{ id: string; error: string }> = []

  for (const channel of channels) {
    try {
      await ingestYouTubeChannel(channel)
      success.push(channel.id)
    } catch (err) {
      failed.push({ id: channel.id, error: err instanceof Error ? err.message : String(err) })
    }
  }

  return { success, failed }
}
