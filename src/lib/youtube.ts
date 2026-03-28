import { query } from './db'

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const YT_DATA_BASE = 'https://www.googleapis.com/youtube/v3'
const YT_ANALYTICS_BASE = 'https://youtubeanalytics.googleapis.com/v2'

export interface YouTubeChannel {
  id: string
  channel_id: string
  name: string | null
  refresh_token: string
  access_token: string | null
  token_expires_at: Date | null
}

export interface YouTubeChannelStats {
  subscribers: number
  total_views: number
}

export interface YouTubeAnalyticsMetrics {
  watch_time_hours: number
  views: number
  likes: number
  comments: number
  impressions: number
  ctr: number
  engagement_rate: number
  avg_view_duration: number
}

export interface YouTubeVideo {
  id: string
  title: string
  thumbnail_url: string | null
  views: number
  likes: number
  comments: number
  watch_time_hours: number
  avg_view_duration: number
  ctr: number
  published_at: string
}

async function refreshAccessToken(channel: YouTubeChannel): Promise<string> {
  const now = new Date()
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

  if (
    channel.access_token &&
    channel.token_expires_at &&
    channel.token_expires_at > fiveMinutesFromNow
  ) {
    return channel.access_token
  }

  console.log(`[youtube] Refreshing access token for channel ${channel.id}`)
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID ?? '',
      client_secret: process.env.YOUTUBE_CLIENT_SECRET ?? '',
      refresh_token: channel.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`YouTube token refresh failed for channel ${channel.id}: ${body}`)
  }

  const data = await res.json() as { access_token: string; expires_in: number }
  const newExpiry = new Date(now.getTime() + data.expires_in * 1000)

  await query(
    'UPDATE youtube_channels SET access_token = $1, token_expires_at = $2 WHERE id = $3',
    [data.access_token, newExpiry, channel.id]
  )

  return data.access_token
}

export async function getYouTubeChannels(): Promise<YouTubeChannel[]> {
  const result = await query<YouTubeChannel>(
    'SELECT id, channel_id, name, refresh_token, access_token, token_expires_at FROM youtube_channels'
  )
  return result.rows
}

export async function fetchChannelStats(channel: YouTubeChannel): Promise<YouTubeChannelStats> {
  const token = await refreshAccessToken(channel)
  const url = `${YT_DATA_BASE}/channels?part=statistics&id=${channel.channel_id}&access_token=${token}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Channel stats fetch failed for ${channel.id}: ${body}`)
  }
  const data = await res.json() as {
    items: Array<{ statistics: { subscriberCount: string; viewCount: string } }>
  }
  const stats = data.items?.[0]?.statistics
  if (!stats) throw new Error(`No stats returned for channel ${channel.channel_id}`)
  return {
    subscribers: parseInt(stats.subscriberCount, 10),
    total_views: parseInt(stats.viewCount, 10),
  }
}

export async function fetchAnalyticsMetrics(
  channel: YouTubeChannel,
  startDate: string,
  endDate: string
): Promise<YouTubeAnalyticsMetrics> {
  const token = await refreshAccessToken(channel)
  const params = new URLSearchParams({
    ids: `channel==${channel.channel_id}`,
    startDate,
    endDate,
    metrics: 'estimatedMinutesWatched,views,likes,comments,shares,impressions,impressionClickThroughRate,averageViewDuration',
    access_token: token,
  })
  const url = `${YT_ANALYTICS_BASE}/reports?${params}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Analytics fetch failed for ${channel.id}: ${body}`)
  }
  const data = await res.json() as {
    columnHeaders: Array<{ name: string }>
    rows: Array<Array<number>>
  }

  if (!data.rows?.length) {
    return {
      watch_time_hours: 0,
      views: 0,
      likes: 0,
      comments: 0,
      impressions: 0,
      ctr: 0,
      engagement_rate: 0,
      avg_view_duration: 0,
    }
  }

  const headers = data.columnHeaders.map((h) => h.name)
  const row = data.rows[0]
  const get = (name: string): number => {
    const idx = headers.indexOf(name)
    return idx >= 0 ? (row[idx] ?? 0) : 0
  }

  const views = get('views')
  const likes = get('likes')
  const comments = get('comments')
  const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0

  return {
    watch_time_hours: get('estimatedMinutesWatched') / 60,
    views,
    likes,
    comments,
    impressions: get('impressions'),
    ctr: get('impressionClickThroughRate'),
    engagement_rate: engagementRate,
    avg_view_duration: get('averageViewDuration'),
  }
}

export async function fetchTopVideos(channel: YouTubeChannel): Promise<YouTubeVideo[]> {
  const token = await refreshAccessToken(channel)

  // Search for top 10 videos by view count
  const searchParams = new URLSearchParams({
    part: 'id',
    channelId: channel.channel_id,
    order: 'viewCount',
    type: 'video',
    maxResults: '10',
    access_token: token,
  })
  const searchRes = await fetch(`${YT_DATA_BASE}/search?${searchParams}`)
  if (!searchRes.ok) {
    const body = await searchRes.text()
    throw new Error(`Video search failed for ${channel.id}: ${body}`)
  }
  const searchData = await searchRes.json() as { items: Array<{ id: { videoId: string } }> }
  const videoIds = searchData.items?.map((i) => i.id.videoId).filter(Boolean) ?? []
  if (!videoIds.length) return []

  // Fetch video details
  const detailParams = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    id: videoIds.join(','),
    access_token: token,
  })
  const detailRes = await fetch(`${YT_DATA_BASE}/videos?${detailParams}`)
  if (!detailRes.ok) {
    const body = await detailRes.text()
    throw new Error(`Video details fetch failed for ${channel.id}: ${body}`)
  }
  const detailData = await detailRes.json() as {
    items: Array<{
      id: string
      snippet: { title: string; publishedAt: string; thumbnails: { medium: { url: string } } }
      statistics: { viewCount: string; likeCount: string; commentCount: string }
      contentDetails: { duration: string }
    }>
  }

  return (detailData.items ?? []).map((v) => ({
    id: v.id,
    title: v.snippet.title,
    thumbnail_url: v.snippet.thumbnails?.medium?.url ?? null,
    views: parseInt(v.statistics.viewCount ?? '0', 10),
    likes: parseInt(v.statistics.likeCount ?? '0', 10),
    comments: parseInt(v.statistics.commentCount ?? '0', 10),
    watch_time_hours: 0, // TODO: per-video watch time requires Analytics API per video
    avg_view_duration: 0, // TODO: per-video avg duration requires Analytics API
    ctr: 0, // TODO: per-video CTR requires Analytics API
    published_at: v.snippet.publishedAt,
  }))
}

export function initChannelsFromEnv(): Array<{ id: string; channel_id: string; refresh_token: string }> {
  const ids = (process.env.YOUTUBE_CHANNEL_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const tokens = (process.env.YOUTUBE_REFRESH_TOKENS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  return ids.map((id, i) => ({ id, channel_id: id, refresh_token: tokens[i] ?? '' }))
}
