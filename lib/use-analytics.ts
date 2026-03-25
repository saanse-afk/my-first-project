"use client"

import { useState, useEffect } from "react"
import type { KPIData, WeeklyData, DayData, FormatData, TopicStats, HookData, ContentMatrixCell } from "./types"
import type { Post } from "./types"

interface AnalyticsData {
  kpis: KPIData
  weekly: WeeklyData[]
  byDay: DayData[]
  byFormat: FormatData[]
  byTopic: TopicStats[]
  byHook: HookData[]
  contentMatrix: ContentMatrixCell[]
  insights: string[]
  recommendations: ReturnType<typeof import("./analytics").generateRecommendations>
}

const DEFAULT_KPIS: KPIData = { totalReach: 0, avgEngagementScore: 0, viralPosts: 0, totalPosts: 0 }

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}

export function usePosts(format?: string) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = format && format !== "all"
      ? `/api/posts?format=${format}`
      : "/api/posts"
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setPosts(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [format])

  return { posts, loading, error, setPosts }
}
