export interface Post {
  id: string
  platform_post_id: string
  title: string | null
  full_caption: string | null
  post_type: "VIDEO" | "CAROUSEL_ALBUM" | string
  published_at: string | null
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  engagement_score: number | null
  topic: string | null
  content_type: string | null
  hook_type: string | null
  created_at: string
}

export interface Festival {
  id: string
  name: string
  date: string
  deity: string | null
  related_topics: string[]
  days_before: number
}

export interface AiGeneration {
  id: string
  type: string
  input: Record<string, unknown>
  output: string
  created_at: string
}

export interface CSVRow {
  ID: string
  "Page Name": string
  "Post Name": string
  "Post ID": string
  "Post Date": string
  "Post Type": string
  "Post Title": string
  Views: string
  Likes: string
  Comments: string
  Saves: string
  Shares: string
  "Engagement Rate %": string
}

export interface KPIData {
  totalReach: number
  avgEngagementScore: number
  viralPosts: number
  totalPosts: number
}

export interface TopicStats {
  topic: string
  postCount: number
  avgScore: number
  avgViews: number
  baselineMultiplier: number
  lastPosted: string | null
}

export interface WeeklyData {
  week: string
  views: number
  avgScore: number
}

export interface DayData {
  day: string
  avgScore: number
  postCount: number
}

export interface FormatData {
  format: string
  avgScore: number
  avgViews: number
  postCount: number
}

export interface HookData {
  hook_type: string
  avgScore: number
  postCount: number
}

export interface ContentMatrixCell {
  format: string
  content_type: string
  avgScore: number
  postCount: number
}

export type GenerateType = "script" | "caption" | "hooks"

export interface ScriptInput {
  topic: string
  subTopic: string
  duration: "30s" | "60s" | "90s"
  format: "reel" | "carousel"
}

export interface CaptionInput {
  topic: string
  keyMessage: string
}

export interface HooksInput {
  topic: string
}
