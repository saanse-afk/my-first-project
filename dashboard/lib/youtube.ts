import { google } from 'googleapis'
import { calculateEngagementScore } from './scoring'

function getOAuthClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  client.setCredentials({ refresh_token: process.env.YOUTUBE_REFRESH_TOKEN })
  return client
}

export interface YTVideoMetadata {
  id: string
  title: string
  description: string
  publishedAt: string
  duration: string // ISO 8601 (e.g. PT60S)
  thumbnailUrl: string
  tags: string[]
}

export interface YTVideoAnalytics {
  views: number
  likes: number
  comments: number
  shares: number
  estimatedMinutesWatched: number
  averageViewDuration: number // seconds
  subscribersGained: number
}

/**
 * Determine if a YouTube video is a Short (<= 60s) or Long.
 */
export function getYTVideoType(duration: string): 'YOUTUBE_SHORT' | 'YOUTUBE_LONG' {
  // Parse ISO 8601 duration
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 'YOUTUBE_LONG'
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  const totalSeconds = hours * 3600 + minutes * 60 + seconds
  return totalSeconds <= 60 ? 'YOUTUBE_SHORT' : 'YOUTUBE_LONG'
}

/**
 * Get the uploads playlist ID for a channel.
 */
export async function getUploadsPlaylistId(channelId: string): Promise<string> {
  const auth = getOAuthClient()
  const youtube = google.youtube({ version: 'v3', auth })

  const res = await youtube.channels.list({
    part: ['contentDetails'],
    id: [channelId],
  })

  const playlistId =
    res.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
  if (!playlistId) throw new Error('Could not get uploads playlist ID')
  return playlistId
}

/**
 * Fetch all video IDs from the uploads playlist.
 */
export async function fetchAllVideoIds(playlistId: string): Promise<string[]> {
  const auth = getOAuthClient()
  const youtube = google.youtube({ version: 'v3', auth })

  const ids: string[] = []
  let pageToken: string | undefined

  do {
    const res = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId,
      maxResults: 50,
      pageToken,
    })
    for (const item of res.data.items || []) {
      const videoId = item.snippet?.resourceId?.videoId
      if (videoId) ids.push(videoId)
    }
    pageToken = res.data.nextPageToken ?? undefined
  } while (pageToken)

  return ids
}

/**
 * Fetch metadata for up to 50 videos at once.
 */
export async function fetchVideoMetadataBatch(videoIds: string[]): Promise<YTVideoMetadata[]> {
  const auth = getOAuthClient()
  const youtube = google.youtube({ version: 'v3', auth })

  const results: YTVideoMetadata[] = []
  const BATCH_SIZE = 50

  for (let i = 0; i < videoIds.length; i += BATCH_SIZE) {
    const batch = videoIds.slice(i, i + BATCH_SIZE)
    const res = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: batch,
    })

    for (const item of res.data.items || []) {
      results.push({
        id: item.id!,
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        publishedAt: item.snippet?.publishedAt || '',
        duration: item.contentDetails?.duration || 'PT0S',
        thumbnailUrl:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.default?.url ||
          '',
        tags: item.snippet?.tags || [],
      })
    }
  }

  return results
}

/**
 * Fetch analytics for a specific video via YouTube Analytics API.
 * Note: data has a 2-3 day lag.
 */
export async function fetchVideoAnalytics(
  videoId: string,
  startDate: string, // YYYY-MM-DD
  endDate: string
): Promise<YTVideoAnalytics> {
  const auth = getOAuthClient()
  const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth })

  try {
    const res = await youtubeAnalytics.reports.query({
      ids: 'channel==MINE',
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,likes,comments,shares,subscribersGained',
      dimensions: 'video',
      filters: `video==${videoId}`,
      startDate,
      endDate,
    })

    const row = res.data.rows?.[0]
    if (!row) {
      return { views: 0, likes: 0, comments: 0, shares: 0, estimatedMinutesWatched: 0, averageViewDuration: 0, subscribersGained: 0 }
    }

    // Column order: video, views, estimatedMinutesWatched, averageViewDuration, likes, comments, shares, subscribersGained
    return {
      views: (row[1] as number) || 0,
      estimatedMinutesWatched: (row[2] as number) || 0,
      averageViewDuration: (row[3] as number) || 0,
      likes: (row[4] as number) || 0,
      comments: (row[5] as number) || 0,
      shares: (row[6] as number) || 0,
      subscribersGained: (row[7] as number) || 0,
    }
  } catch {
    return { views: 0, likes: 0, comments: 0, shares: 0, estimatedMinutesWatched: 0, averageViewDuration: 0, subscribersGained: 0 }
  }
}

/**
 * Build the post record ready for Supabase upsert.
 */
export function buildYTPostRecord(
  socialAccountId: string,
  meta: YTVideoMetadata,
  analytics: YTVideoAnalytics
) {
  const postType = getYTVideoType(meta.duration)
  const engagementScore = calculateEngagementScore({
    likes: analytics.likes,
    comments: analytics.comments,
    shares: analytics.shares,
    saves: 0,
    views: analytics.views,
  })

  const post = {
    social_account_id: socialAccountId,
    platform_post_id: meta.id,
    title: meta.title.slice(0, 120),
    full_caption: meta.description,
    post_type: postType,
    published_at: meta.publishedAt,
    permalink: `https://www.youtube.com/watch?v=${meta.id}`,
    thumbnail_url: meta.thumbnailUrl,
  }

  const metrics = {
    views: analytics.views,
    likes: analytics.likes,
    comments: analytics.comments,
    shares: analytics.shares,
    saves: 0,
    reach: analytics.views,
    impressions: analytics.views,
    avg_watch_time_seconds: analytics.averageViewDuration,
    engagement_score: engagementScore,
  }

  return { post, metrics }
}
