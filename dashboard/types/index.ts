export type Platform = 'instagram' | 'youtube'

export type PostType =
  | 'VIDEO'
  | 'CAROUSEL_ALBUM'
  | 'IMAGE'
  | 'YOUTUBE_SHORT'
  | 'YOUTUBE_LONG'

export type Topic =
  | 'Krishna/Vishnu'
  | 'Shiva'
  | 'Ramayana'
  | 'Devi/Shakti'
  | 'Mahabharata'
  | 'Vedas/Philosophy'
  | 'Festival'
  | 'General'

export type ContentType = 'concept' | 'story' | 'festival' | 'narrative'

export type HookType =
  | 'myth_buster'
  | 'declarative'
  | 'scene_setter'
  | 'character_lead'
  | 'common_belief'
  | 'name_first'
  | 'timely_intro'
  | 'question'

export type GenerationType = 'script' | 'caption' | 'hooks' | 'recommendations'

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface SocialAccount {
  id: string
  organization_id: string
  platform: Platform
  account_id: string
  account_name: string | null
  access_token: string | null
  token_expires_at: string | null
  followers_count: number
  last_synced_at: string | null
  created_at: string
}

export interface Post {
  id: string
  social_account_id: string
  platform_post_id: string
  title: string | null
  full_caption: string | null
  post_type: PostType | null
  published_at: string
  permalink: string | null
  thumbnail_url: string | null
  topic: Topic | null
  content_type: ContentType | null
  hook_type: HookType | null
  created_at: string
}

export interface PostMetrics {
  id: string
  post_id: string
  recorded_at: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  impressions: number
  avg_watch_time_seconds: number | null
  completion_rate: number | null
  engagement_score: number | null
}

export interface PostWithMetrics extends Post {
  post_metrics: PostMetrics[]
  social_accounts?: SocialAccount
  latest_metrics?: PostMetrics
}

export interface AiGeneration {
  id: string
  organization_id: string
  generation_type: GenerationType
  input_context: Record<string, unknown> | null
  output_content: string
  model: string
  tokens_used: number | null
  created_at: string
}

export interface Festival {
  id: string
  name: string
  date: string
  deity: string | null
  related_topics: string[] | null
  content_suggestions: string[] | null
  days_before_to_post: number
}

export interface SyncLog {
  id: string
  social_account_id: string
  started_at: string
  completed_at: string | null
  posts_synced: number
  errors_count: number
  status: 'running' | 'success' | 'error'
  error_message: string | null
}

// Analytics / computed types
export interface TopicPerformance {
  topic: Topic
  post_count: number
  avg_engagement_score: number
  avg_views: number
  total_reach: number
  multiplier: number // relative to overall avg
}

export interface FormatPerformance {
  post_type: PostType
  post_count: number
  avg_engagement_score: number
  avg_views: number
  avg_reach: number
}

export interface HookPerformance {
  hook_type: HookType
  post_count: number
  avg_engagement_score: number
  avg_views: number
}

export interface DayPerformance {
  day_of_week: string // 'Monday', 'Tuesday', etc.
  day_number: number // 0=Sunday
  post_count: number
  avg_engagement_score: number
  avg_views: number
  multiplier: number
}

export interface ContentRecommendation {
  rank: number
  topic: string
  story_angle: string
  format: 'reel' | 'carousel'
  hook_type: HookType
  suggested_opening: string
  best_day: string
  best_time: string
  predicted_engagement: string
  festival_connection: string | null
  data_reasoning: string
}

export interface GenerateScriptInput {
  topic: string
  subTopic: string
  duration: 30 | 60 | 90
  tone: string
  format: 'reel' | 'carousel'
  platform: 'instagram' | 'youtube'
}

export interface GenerateScriptOutput {
  hook: string
  body: string
  cta: string
  music_mood: string
  reasoning: string
}

export interface GenerateCaptionInput {
  topic: string
  key_message: string
  hashtag_density: 'low' | 'medium' | 'high'
}

export interface CaptionVariation {
  caption: string
  hashtags: string[]
  optimized_for: string
  tone: string
}

export interface GenerateHooksInput {
  topic: string
  angle: string
}

export interface HookVariation {
  hook: string
  hook_type: HookType
  avg_score: number
  reasoning: string
}

// KPI summary
export interface DashboardKPIs {
  total_reach_30d: number
  avg_engagement_score: number
  viral_post_count: number // posts with 100K+ views
  total_engagement: number // sum of all likes+comments+shares+saves
  followers_count: number
  posts_this_month: number
}
