export interface InstagramMetric {
  id: number
  account_id: string
  date: string
  followers: number | null
  following: number | null
  posts_count: number | null
  reach: number | null
  impressions: number | null
  profile_visits: number | null
  website_clicks: number | null
  engagement_rate: number | null
  ingested_at: string
}

export interface InstagramPost {
  id: string
  account_id: string
  media_type: string | null
  thumbnail_url: string | null
  caption: string | null
  likes: number | null
  comments: number | null
  saves: number | null
  reach: number | null
  timestamp: string | null
  ingested_at: string
}

export interface YouTubeMetric {
  id: number
  channel_id: string
  date: string
  subscribers: number | null
  total_views: number | null
  watch_time_hours: number | null
  avg_view_duration: number | null
  engagement_rate: number | null
  impressions: number | null
  ctr: number | null
  ingested_at: string
}

export interface YouTubeVideo {
  id: string
  channel_id: string
  title: string | null
  thumbnail_url: string | null
  views: number | null
  likes: number | null
  comments: number | null
  watch_time_hours: number | null
  avg_view_duration: number | null
  ctr: number | null
  published_at: string | null
  ingested_at: string
}

export interface IngestionJob {
  account_id: string
  status: 'pending' | 'running' | 'success' | 'failed'
  error_message: string | null
  completed_at: string | null
  started_at: string
}

export interface SentimentData {
  video_id: string
  positive_pct: number
  neutral_pct: number
  negative_pct: number
  summary: string | null
  analysed_at: string
}

export interface AccountInfo {
  id: string
  username?: string
  name: string | null
}

export interface ChannelInfo {
  id: string
  channel_id: string
  name: string | null
}

export type DateRange = 7 | 30 | 90
