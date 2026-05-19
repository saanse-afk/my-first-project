import type { PostMetrics, PostWithMetrics, TopicPerformance, FormatPerformance, HookPerformance, DayPerformance, Topic, PostType, HookType } from '@/types'

/**
 * Weighted engagement score — proven formula from Level 1 analysis.
 * Saves (4x) and shares (5x) weighted higher as they signal intent.
 */
export function calculateEngagementScore(metrics: {
  likes: number
  comments: number
  shares: number
  saves: number
  views: number
}): number {
  const weighted =
    metrics.likes * 1 +
    metrics.comments * 3 +
    metrics.shares * 5 +
    metrics.saves * 4
  return Math.round((weighted / Math.max(metrics.views, 1)) * 100 * 100) / 100
}

export function calculateShareRate(metrics: { shares: number; views: number }): number {
  return Math.round((metrics.shares / Math.max(metrics.views, 1)) * 100 * 100) / 100
}

export function calculateSaveRate(metrics: { saves: number; views: number }): number {
  return Math.round((metrics.saves / Math.max(metrics.views, 1)) * 100 * 100) / 100
}

export function calculateCommentRate(metrics: { comments: number; views: number }): number {
  return Math.round((metrics.comments / Math.max(metrics.views, 1)) * 100 * 100) / 100
}

// Get the latest metrics for a post (most recent snapshot)
export function getLatestMetrics(post: PostWithMetrics): PostMetrics | null {
  if (!post.post_metrics || post.post_metrics.length === 0) return null
  return post.post_metrics.sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  )[0]
}

// Aggregate topic performance from an array of posts
export function aggregateTopicPerformance(posts: PostWithMetrics[]): TopicPerformance[] {
  const topicMap = new Map<
    string,
    { scores: number[]; views: number[]; reach: number[] }
  >()

  for (const post of posts) {
    const topic = post.topic || 'General'
    const metrics = getLatestMetrics(post)
    if (!metrics) continue

    if (!topicMap.has(topic)) {
      topicMap.set(topic, { scores: [], views: [], reach: [] })
    }
    const entry = topicMap.get(topic)!
    if (metrics.engagement_score != null) entry.scores.push(metrics.engagement_score)
    entry.views.push(metrics.views)
    entry.reach.push(metrics.reach)
  }

  const allScores = [...topicMap.values()].flatMap((v) => v.scores)
  const overallAvg = allScores.length
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : 1

  const results: TopicPerformance[] = []
  for (const [topic, data] of topicMap.entries()) {
    const avgScore = data.scores.length
      ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      : 0
    const avgViews = data.views.length
      ? data.views.reduce((a, b) => a + b, 0) / data.views.length
      : 0
    const totalReach = data.reach.reduce((a, b) => a + b, 0)

    results.push({
      topic: topic as Topic,
      post_count: data.scores.length,
      avg_engagement_score: Math.round(avgScore * 100) / 100,
      avg_views: Math.round(avgViews),
      total_reach: totalReach,
      multiplier: overallAvg > 0 ? Math.round((avgScore / overallAvg) * 100) / 100 : 1,
    })
  }

  return results.sort((a, b) => b.avg_engagement_score - a.avg_engagement_score)
}

export function aggregateFormatPerformance(posts: PostWithMetrics[]): FormatPerformance[] {
  const formatMap = new Map<
    string,
    { scores: number[]; views: number[]; reach: number[] }
  >()

  for (const post of posts) {
    const format = post.post_type || 'UNKNOWN'
    const metrics = getLatestMetrics(post)
    if (!metrics) continue

    if (!formatMap.has(format)) {
      formatMap.set(format, { scores: [], views: [], reach: [] })
    }
    const entry = formatMap.get(format)!
    if (metrics.engagement_score != null) entry.scores.push(metrics.engagement_score)
    entry.views.push(metrics.views)
    entry.reach.push(metrics.reach)
  }

  const results: FormatPerformance[] = []
  for (const [postType, data] of formatMap.entries()) {
    const avgScore = data.scores.length
      ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      : 0
    const avgViews = data.views.length
      ? data.views.reduce((a, b) => a + b, 0) / data.views.length
      : 0
    const avgReach = data.reach.length
      ? data.reach.reduce((a, b) => a + b, 0) / data.reach.length
      : 0

    results.push({
      post_type: postType as PostType,
      post_count: data.scores.length,
      avg_engagement_score: Math.round(avgScore * 100) / 100,
      avg_views: Math.round(avgViews),
      avg_reach: Math.round(avgReach),
    })
  }

  return results.sort((a, b) => b.avg_engagement_score - a.avg_engagement_score)
}

export function aggregateHookPerformance(posts: PostWithMetrics[]): HookPerformance[] {
  const hookMap = new Map<string, { scores: number[]; views: number[] }>()

  for (const post of posts) {
    const hook = post.hook_type || 'unknown'
    const metrics = getLatestMetrics(post)
    if (!metrics) continue

    if (!hookMap.has(hook)) {
      hookMap.set(hook, { scores: [], views: [] })
    }
    const entry = hookMap.get(hook)!
    if (metrics.engagement_score != null) entry.scores.push(metrics.engagement_score)
    entry.views.push(metrics.views)
  }

  const results: HookPerformance[] = []
  for (const [hookType, data] of hookMap.entries()) {
    const avgScore = data.scores.length
      ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      : 0
    const avgViews = data.views.length
      ? data.views.reduce((a, b) => a + b, 0) / data.views.length
      : 0

    results.push({
      hook_type: hookType as HookType,
      post_count: data.scores.length,
      avg_engagement_score: Math.round(avgScore * 100) / 100,
      avg_views: Math.round(avgViews),
    })
  }

  return results.sort((a, b) => b.avg_engagement_score - a.avg_engagement_score)
}

export function aggregateDayPerformance(posts: PostWithMetrics[]): DayPerformance[] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayMap = new Map<number, { scores: number[]; views: number[] }>()

  for (const post of posts) {
    const dayNum = new Date(post.published_at).getDay()
    const metrics = getLatestMetrics(post)
    if (!metrics) continue

    if (!dayMap.has(dayNum)) {
      dayMap.set(dayNum, { scores: [], views: [] })
    }
    const entry = dayMap.get(dayNum)!
    if (metrics.engagement_score != null) entry.scores.push(metrics.engagement_score)
    entry.views.push(metrics.views)
  }

  const allScores = [...dayMap.values()].flatMap((v) => v.scores)
  const overallAvg = allScores.length
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : 1

  const results: DayPerformance[] = []
  for (const [dayNum, data] of dayMap.entries()) {
    const avgScore = data.scores.length
      ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      : 0
    const avgViews = data.views.length
      ? data.views.reduce((a, b) => a + b, 0) / data.views.length
      : 0

    results.push({
      day_of_week: dayNames[dayNum],
      day_number: dayNum,
      post_count: data.scores.length,
      avg_engagement_score: Math.round(avgScore * 100) / 100,
      avg_views: Math.round(avgViews),
      multiplier: overallAvg > 0 ? Math.round((avgScore / overallAvg) * 100) / 100 : 1,
    })
  }

  // Fill missing days
  for (let i = 0; i < 7; i++) {
    if (!dayMap.has(i)) {
      results.push({
        day_of_week: dayNames[i],
        day_number: i,
        post_count: 0,
        avg_engagement_score: 0,
        avg_views: 0,
        multiplier: 0,
      })
    }
  }

  return results.sort((a, b) => a.day_number - b.day_number)
}
