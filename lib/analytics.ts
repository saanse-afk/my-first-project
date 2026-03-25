import type {
  Post,
  KPIData,
  TopicStats,
  WeeklyData,
  DayData,
  FormatData,
  HookData,
  ContentMatrixCell,
} from "./types"

export function computeKPIs(posts: Post[]): KPIData {
  if (!posts.length) return { totalReach: 0, avgEngagementScore: 0, viralPosts: 0, totalPosts: 0 }

  const totalReach = posts.reduce((sum, p) => sum + (p.views || 0), 0)
  const scored = posts.filter((p) => p.engagement_score !== null)
  const avgEngagementScore =
    scored.length > 0
      ? scored.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / scored.length
      : 0
  const viralPosts = posts.filter((p) => (p.views || 0) >= 100_000).length

  return {
    totalReach,
    avgEngagementScore: parseFloat(avgEngagementScore.toFixed(2)),
    viralPosts,
    totalPosts: posts.length,
  }
}

export function computeWeeklyData(posts: Post[]): WeeklyData[] {
  const byWeek: Record<string, { views: number; scores: number[] }> = {}

  for (const p of posts) {
    if (!p.published_at) continue
    const d = new Date(p.published_at)
    // ISO week start (Monday)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d)
    monday.setDate(diff)
    const week = monday.toISOString().split("T")[0]

    if (!byWeek[week]) byWeek[week] = { views: 0, scores: [] }
    byWeek[week].views += p.views || 0
    if (p.engagement_score !== null) byWeek[week].scores.push(p.engagement_score)
  }

  return Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-16) // last 16 weeks
    .map(([week, data]) => ({
      week,
      views: data.views,
      avgScore: data.scores.length > 0
        ? parseFloat((data.scores.reduce((s, v) => s + v, 0) / data.scores.length).toFixed(2))
        : 0,
    }))
}

export function computeDayData(posts: Post[]): DayData[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const byDay: Record<string, { scores: number[]; count: number }> = {}
  days.forEach((d) => (byDay[d] = { scores: [], count: 0 }))

  for (const p of posts) {
    if (!p.published_at || p.engagement_score === null) continue
    const d = new Date(p.published_at)
    const dayIdx = (d.getDay() + 6) % 7 // Mon=0
    const dayName = days[dayIdx]
    byDay[dayName].scores.push(p.engagement_score)
    byDay[dayName].count++
  }

  return days.map((day) => ({
    day,
    avgScore:
      byDay[day].scores.length > 0
        ? parseFloat(
            (byDay[day].scores.reduce((s, v) => s + v, 0) / byDay[day].scores.length).toFixed(2)
          )
        : 0,
    postCount: byDay[day].count,
  }))
}

export function computeFormatData(posts: Post[]): FormatData[] {
  const byFormat: Record<string, { scores: number[]; views: number[]; count: number }> = {}

  for (const p of posts) {
    const format = p.post_type === "CAROUSEL_ALBUM" ? "Carousel" : "Video"
    if (!byFormat[format]) byFormat[format] = { scores: [], views: [], count: 0 }
    if (p.engagement_score !== null) byFormat[format].scores.push(p.engagement_score)
    byFormat[format].views.push(p.views || 0)
    byFormat[format].count++
  }

  return Object.entries(byFormat).map(([format, data]) => ({
    format,
    avgScore:
      data.scores.length > 0
        ? parseFloat((data.scores.reduce((s, v) => s + v, 0) / data.scores.length).toFixed(2))
        : 0,
    avgViews:
      data.views.length > 0
        ? Math.round(data.views.reduce((s, v) => s + v, 0) / data.views.length)
        : 0,
    postCount: data.count,
  }))
}

export function computeTopicStats(posts: Post[]): TopicStats[] {
  const overall = posts.filter((p) => p.engagement_score !== null)
  const baseline =
    overall.length > 0
      ? overall.reduce((s, p) => s + (p.engagement_score || 0), 0) / overall.length
      : 1

  const byTopic: Record<string, { scores: number[]; views: number[]; dates: string[] }> = {}

  for (const p of posts) {
    const topic = p.topic || "Uncategorized"
    if (!byTopic[topic]) byTopic[topic] = { scores: [], views: [], dates: [] }
    if (p.engagement_score !== null) byTopic[topic].scores.push(p.engagement_score)
    byTopic[topic].views.push(p.views || 0)
    if (p.published_at) byTopic[topic].dates.push(p.published_at)
  }

  return Object.entries(byTopic)
    .map(([topic, data]) => {
      const avgScore =
        data.scores.length > 0
          ? data.scores.reduce((s, v) => s + v, 0) / data.scores.length
          : 0
      const avgViews =
        data.views.length > 0
          ? Math.round(data.views.reduce((s, v) => s + v, 0) / data.views.length)
          : 0
      const sortedDates = [...data.dates].sort()
      const lastPosted = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null

      return {
        topic,
        postCount: data.scores.length,
        avgScore: parseFloat(avgScore.toFixed(2)),
        avgViews,
        baselineMultiplier: baseline > 0 ? parseFloat((avgScore / baseline).toFixed(2)) : 0,
        lastPosted,
      }
    })
    .sort((a, b) => b.avgScore - a.avgScore)
}

export function computeHookData(posts: Post[]): HookData[] {
  const byHook: Record<string, number[]> = {}

  for (const p of posts) {
    const hook = p.hook_type || "unknown"
    if (!byHook[hook]) byHook[hook] = []
    if (p.engagement_score !== null) byHook[hook].push(p.engagement_score)
  }

  return Object.entries(byHook)
    .filter(([, scores]) => scores.length >= 2)
    .map(([hook_type, scores]) => ({
      hook_type: hook_type.replace(/_/g, " "),
      avgScore: parseFloat((scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(2)),
      postCount: scores.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
}

export function computeContentMatrix(posts: Post[]): ContentMatrixCell[] {
  const matrix: Record<string, number[]> = {}

  for (const p of posts) {
    if (!p.engagement_score || !p.content_type) continue
    const format = p.post_type === "CAROUSEL_ALBUM" ? "Carousel" : "Video"
    const key = `${format}__${p.content_type}`
    if (!matrix[key]) matrix[key] = []
    matrix[key].push(p.engagement_score)
  }

  return Object.entries(matrix).map(([key, scores]) => {
    const [format, content_type] = key.split("__")
    return {
      format,
      content_type,
      avgScore: parseFloat((scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(2)),
      postCount: scores.length,
    }
  })
}

export function generateInsights(posts: Post[]): string[] {
  const insights: string[] = []
  if (!posts.length) return insights

  // Format comparison
  const carousels = posts.filter((p) => p.post_type === "CAROUSEL_ALBUM" && p.engagement_score !== null)
  const videos = posts.filter((p) => p.post_type !== "CAROUSEL_ALBUM" && p.engagement_score !== null)

  if (carousels.length > 0 && videos.length > 0) {
    const carouselAvg = carousels.reduce((s, p) => s + (p.engagement_score || 0), 0) / carousels.length
    const videoAvg = videos.reduce((s, p) => s + (p.engagement_score || 0), 0) / videos.length
    const carouselViews = carousels.reduce((s, p) => s + p.views, 0) / carousels.length
    const videoViews = videos.reduce((s, p) => s + p.views, 0) / videos.length
    const reachRatio = videoViews > 0 ? Math.round(videoViews / Math.max(carouselViews, 1)) : 1

    insights.push(
      `Carousels avg ${carouselAvg.toFixed(1)} engagement score vs videos at ${videoAvg.toFixed(1)} — but videos drive ${reachRatio}x more reach. Use carousels for deep concepts, reels for emotional stories.`
    )
  }

  // Hook analysis
  const byHook: Record<string, number[]> = {}
  for (const p of posts) {
    if (p.hook_type && p.engagement_score !== null) {
      if (!byHook[p.hook_type]) byHook[p.hook_type] = []
      byHook[p.hook_type].push(p.engagement_score)
    }
  }
  const hookEntries = Object.entries(byHook)
    .filter(([, s]) => s.length >= 2)
    .map(([k, s]) => ({ hook: k, avg: s.reduce((a, b) => a + b, 0) / s.length, count: s.length }))
    .sort((a, b) => b.avg - a.avg)

  if (hookEntries.length >= 2) {
    const best = hookEntries[0]
    const worst = hookEntries[hookEntries.length - 1]
    // Check myth_buster in viral posts
    const viralPosts = posts.filter((p) => p.views >= 100_000)
    const mythBusterViralCount = viralPosts.filter((p) => p.hook_type === "myth_buster").length
    if (mythBusterViralCount > 0 && viralPosts.length > 0) {
      insights.push(
        `Myth-buster hooks appear in ${mythBusterViralCount} of ${viralPosts.length} viral posts. "${best.hook.replace(/_/g, " ")}" hooks avg ${best.avg.toFixed(1)} vs "${worst.hook.replace(/_/g, " ")}" at ${worst.avg.toFixed(1)}.`
      )
    } else {
      insights.push(
        `"${best.hook.replace(/_/g, " ")}" hooks deliver ${best.avg.toFixed(1)} avg score (${best.count} posts) — ${((best.avg / Math.max(worst.avg, 0.1)) - 1).toFixed(0)}x better than "${worst.hook.replace(/_/g, " ")}" hooks.`
      )
    }
  }

  // Day of week
  const dayData = computeDayData(posts)
  const sorted = [...dayData].filter((d) => d.postCount > 0).sort((a, b) => b.avgScore - a.avgScore)
  if (sorted.length >= 2) {
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    if (worst.avgScore > 0) {
      insights.push(
        `${best.day} posts score ${(best.avgScore / worst.avgScore).toFixed(1)}x higher than ${worst.day} posts (${best.avgScore.toFixed(1)} vs ${worst.avgScore.toFixed(1)} avg score).`
      )
    }
  }

  // Top topic
  const topicStats = computeTopicStats(posts)
  if (topicStats.length > 0) {
    const top = topicStats[0]
    const bottom = topicStats[topicStats.length - 1]
    if (top.topic !== bottom.topic) {
      insights.push(
        `${top.topic} content leads with ${top.avgScore.toFixed(1)} avg score across ${top.postCount} posts. ${bottom.topic} trails at ${bottom.avgScore.toFixed(1)} — consider refreshing your approach there.`
      )
    }
  }

  return insights.slice(0, 4)
}

export function generateRecommendations(posts: Post[]) {
  const topicStats = computeTopicStats(posts)
  const hookData = computeHookData(posts)
  const bestHook = hookData[0]?.hook_type?.replace(/ /g, "_") || "myth_buster"

  const underservedTopics = topicStats
    .filter((t) => t.lastPosted)
    .sort((a, b) => {
      const da = a.lastPosted ? new Date(a.lastPosted).getTime() : 0
      const db = b.lastPosted ? new Date(b.lastPosted).getTime() : 0
      return da - db
    })

  const highPerfTopics = topicStats.filter((t) => t.baselineMultiplier >= 1.2)

  const recommendations = []

  // Recommend high-performing topics not posted recently
  for (const t of highPerfTopics.slice(0, 2)) {
    recommendations.push({
      rank: recommendations.length + 1,
      topic: t.topic,
      storyIdea: `A deep-dive ${t.topic} story exploring a lesser-known aspect`,
      format: t.avgScore > 15 ? "carousel" : "reel",
      hookStyle: bestHook,
      reasoning: `${t.topic} averages ${t.avgScore.toFixed(1)} score — ${t.baselineMultiplier}x your baseline. High performer worth repeating.`,
      festivalConnection: null,
    })
  }

  // Recommend underserved topics
  for (const t of underservedTopics.slice(0, 2)) {
    if (recommendations.find((r) => r.topic === t.topic)) continue
    recommendations.push({
      rank: recommendations.length + 1,
      topic: t.topic,
      storyIdea: `Revisit ${t.topic} with a fresh angle — you haven't posted about this recently`,
      format: "reel",
      hookStyle: bestHook,
      reasoning: `Last posted ${t.lastPosted} — audience may be ready for fresh ${t.topic} content.`,
      festivalConnection: null,
    })
  }

  // Fill remaining slots with generic high-value recs
  const genericRecs = [
    {
      topic: "Krishna/Vishnu",
      storyIdea: "The cosmic form of Vishnu — what Arjuna actually saw on the battlefield",
      format: "carousel",
      hookStyle: "myth_buster",
      reasoning: "Visually rich stories with myth-buster framing outperform in carousels.",
    },
    {
      topic: "Vedas/Philosophy",
      storyIdea: "One Upanishad verse that explains the meaning of life in 10 seconds",
      format: "reel",
      hookStyle: "declarative",
      reasoning: "Short, punchy philosophy content drives high saves and shares.",
    },
    {
      topic: "Devi/Shakti",
      storyIdea: "The night Durga defeated Mahishasura — a cinematic retelling",
      format: "reel",
      hookStyle: "scene_setter",
      reasoning: "Scene-setter hooks + emotional stories = high engagement reels.",
    },
  ]

  for (const r of genericRecs) {
    if (recommendations.length >= 5) break
    if (recommendations.find((rec) => rec.topic === r.topic)) continue
    recommendations.push({
      rank: recommendations.length + 1,
      ...r,
      festivalConnection: null,
    })
  }

  return recommendations.slice(0, 5).map((r, i) => ({ ...r, rank: i + 1 }))
}
