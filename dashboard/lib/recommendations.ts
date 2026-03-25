import type { PostWithMetrics, TopicPerformance, Festival } from '@/types'
import { getLatestMetrics } from './scoring'
import { getDaysUntilFestival } from './festivals'

/**
 * Identify topics that haven't been posted about recently (content gaps).
 */
export function identifyContentGaps(
  posts: PostWithMetrics[],
  topics = ['Krishna/Vishnu', 'Shiva', 'Ramayana', 'Devi/Shakti', 'Mahabharata', 'Vedas/Philosophy']
): { topic: string; days_since_last_post: number | null; status: 'active' | 'stale' | 'gap' }[] {
  const now = new Date()
  const gaps = []

  for (const topic of topics) {
    const topicPosts = posts.filter((p) => p.topic === topic)
    if (topicPosts.length === 0) {
      gaps.push({ topic, days_since_last_post: null, status: 'gap' as const })
      continue
    }

    const latest = topicPosts.sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )[0]

    const daysSince = Math.floor(
      (now.getTime() - new Date(latest.published_at).getTime()) / 86_400_000
    )

    gaps.push({
      topic,
      days_since_last_post: daysSince,
      status: (daysSince <= 14 ? 'active' : daysSince <= 30 ? 'stale' : 'gap') as 'active' | 'stale' | 'gap',
    })
  }

  return gaps.sort((a, b) => {
    if (a.days_since_last_post === null) return -1
    if (b.days_since_last_post === null) return 1
    return b.days_since_last_post - a.days_since_last_post
  })
}

/**
 * Detect underperforming patterns (like "The Shiva Problem").
 */
export interface PatternInsight {
  title: string
  description: string
  severity: 'warning' | 'opportunity' | 'info'
  action: string
}

export function detectPatterns(
  topicPerformance: TopicPerformance[],
  overallAvg: number
): PatternInsight[] {
  const insights: PatternInsight[] = []

  for (const t of topicPerformance) {
    if (t.multiplier < 0.8 && t.post_count >= 3) {
      insights.push({
        title: `The ${t.topic} Problem`,
        description: `${t.topic} posts average ${t.avg_engagement_score.toFixed(1)} score — ${Math.round((1 - t.multiplier) * 100)}% below your ${overallAvg.toFixed(1)} baseline despite being frequently posted.`,
        severity: 'warning',
        action: `Try myth-buster hooks for ${t.topic} content. Example: "You've heard the story of ${t.topic} wrong your whole life."`,
      })
    }
    if (t.multiplier >= 1.3 && t.post_count >= 3) {
      insights.push({
        title: `${t.topic} is Your Superpower`,
        description: `${t.topic} posts perform at ${t.multiplier}x your baseline. You have ${t.post_count} posts proving this.`,
        severity: 'opportunity',
        action: `Post more ${t.topic} content. Experiment with different formats to find the ceiling.`,
      })
    }
  }

  return insights
}

/**
 * Compute the overall average engagement score across all posts.
 */
export function computeOverallAvgScore(posts: PostWithMetrics[]): number {
  const scores = posts
    .map((p) => getLatestMetrics(p)?.engagement_score)
    .filter((s): s is number => s != null)

  if (scores.length === 0) return 0
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
}

/**
 * Get the best upcoming festivals to create content for NOW.
 */
export function getFestivalOpportunities(
  festivals: Festival[],
  topicPerformance: TopicPerformance[]
): { festival: Festival; urgency: number; recommended: boolean }[] {
  const topTopics = new Set(topicPerformance.slice(0, 3).map((t) => t.topic))
  const now = new Date()

  return festivals
    .filter((f) => {
      const days = getDaysUntilFestival(f)
      return days >= 0 && days <= 30
    })
    .map((f) => {
      const daysUntil = getDaysUntilFestival(f)
      const urgency = Math.max(0, f.days_before_to_post - daysUntil)
      const hasTopicMatch = f.related_topics?.some((t) =>
        [...topTopics].some((tt) => t.includes(tt) || tt.includes(t))
      )
      return { festival: f, urgency, recommended: urgency > 0 || !!hasTopicMatch }
    })
    .sort((a, b) => b.urgency - a.urgency)
}
