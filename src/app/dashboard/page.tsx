'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { IngestStatusBadge } from '@/components/dashboard/IngestStatusBadge'
import { InstagramMetric, YouTubeMetric, IngestionJob, InstagramPost, YouTubeVideo } from '@/types'

interface DashboardData {
  ig: {
    metrics: InstagramMetric[]
    posts: InstagramPost[]
    last_updated: string | null
    accounts: Array<{ id: string; username: string; name: string | null }>
    jobs: IngestionJob[]
  }
  yt: {
    metrics: YouTubeMetric[]
    videos: YouTubeVideo[]
    last_updated: string | null
    channels: Array<{ id: string; channel_id: string; name: string | null }>
    jobs: IngestionJob[]
  }
}

export default function DashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [igRes, ytRes] = await Promise.all([
        fetch('/api/instagram/metrics?days=7'),
        fetch('/api/youtube/metrics?days=7'),
      ])
      const [ig, yt] = await Promise.all([igRes.json(), ytRes.json()]) as [DashboardData['ig'], DashboardData['yt']]
      setData({ ig, yt })
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleRefreshAll = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetch('/api/instagram/ingest', { method: 'POST' }),
        fetch('/api/youtube/ingest', { method: 'POST' }),
      ])
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  // Aggregate totals
  const latestIgMetrics = data?.ig.metrics.reduce((acc, m) => {
    if (!acc[m.account_id] || m.date > acc[m.account_id].date) acc[m.account_id] = m
    return acc
  }, {} as Record<string, InstagramMetric>)

  const totalFollowers = latestIgMetrics
    ? Object.values(latestIgMetrics).reduce((s, m) => s + (m.followers ?? 0), 0)
    : null

  const latestYtMetrics = data?.yt.metrics.reduce((acc, m) => {
    if (!acc[m.channel_id] || m.date > acc[m.channel_id].date) acc[m.channel_id] = m
    return acc
  }, {} as Record<string, YouTubeMetric>)

  const totalSubscribers = latestYtMetrics
    ? Object.values(latestYtMetrics).reduce((s, m) => s + (m.subscribers ?? 0), 0)
    : null

  const totalAudience =
    totalFollowers != null && totalSubscribers != null
      ? totalFollowers + totalSubscribers
      : null

  const totalIgReach = data?.ig.metrics.reduce((s, m) => s + (m.reach ?? 0), 0) ?? null
  const totalYtViews = data?.yt.metrics.reduce((s, m) => s + (m.total_views ?? 0), 0) ?? null

  const igLastUpdated = data?.ig.last_updated ? new Date(data.ig.last_updated) : null
  const ytLastUpdated = data?.yt.last_updated ? new Date(data.yt.last_updated) : null

  // Top 3 content across both platforms
  const allPosts = data?.ig.posts ?? []
  const allVideos = data?.yt.videos ?? []

  type ContentItem = {
    id: string
    title: string
    platform: 'instagram' | 'youtube'
    engagement: number
  }

  const combined: ContentItem[] = [
    ...allPosts.map((p) => ({
      id: p.id,
      title: p.caption?.slice(0, 50) ?? 'Instagram post',
      platform: 'instagram' as const,
      engagement: (p.likes ?? 0) + (p.comments ?? 0),
    })),
    ...allVideos.map((v) => ({
      id: v.id,
      title: v.title ?? 'YouTube video',
      platform: 'youtube' as const,
      engagement: (v.likes ?? 0) + (v.comments ?? 0),
    })),
  ]
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 3)

  const allJobs = [
    ...(data?.ig.accounts.map((a) => ({
      label: a.name ?? a.username ?? a.id,
      job: data.ig.jobs.find((j) => j.account_id === a.id) ?? null,
    })) ?? []),
    ...(data?.yt.channels.map((c) => ({
      label: c.name ?? c.id,
      job: data.yt.jobs.find((j) => j.account_id === c.id) ?? null,
    })) ?? []),
  ]

  return (
    <div>
      <Header
        title="Overview"
        description="Across all Instagram accounts and YouTube channels"
        actions={
          <button
            onClick={handleRefreshAll}
            disabled={refreshing}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {refreshing ? 'Refreshing…' : 'Refresh All'}
          </button>
        }
      />

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Audience"
          value={totalAudience?.toLocaleString() ?? null}
          lastUpdated={igLastUpdated ?? ytLastUpdated}
        />
        <MetricCard
          title="Instagram Followers"
          value={totalFollowers?.toLocaleString() ?? null}
          lastUpdated={igLastUpdated}
        />
        <MetricCard
          title="YouTube Subscribers"
          value={totalSubscribers?.toLocaleString() ?? null}
          lastUpdated={ytLastUpdated}
        />
        <MetricCard
          title="IG Reach (7d)"
          value={totalIgReach?.toLocaleString() ?? null}
          lastUpdated={igLastUpdated}
        />
      </div>

      {/* Side-by-side */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <MetricCard
          title="Instagram Total Reach (7d)"
          value={totalIgReach?.toLocaleString() ?? null}
          lastUpdated={igLastUpdated}
        />
        <MetricCard
          title="YouTube Total Views (7d)"
          value={totalYtViews?.toLocaleString() ?? null}
          lastUpdated={ytLastUpdated}
        />
      </div>

      {/* Top 3 content */}
      <div className="mb-8">
        <h3 className="font-semibold mb-3">Top Content (by engagement)</h3>
        {combined.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet — click Refresh to fetch</p>
        ) : (
          <div className="space-y-2">
            {combined.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <span className="text-muted-foreground font-mono text-sm w-5">{i + 1}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  item.platform === 'instagram'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {item.platform}
                </span>
                <span className="flex-1 text-sm truncate">{item.title}</span>
                <span className="text-sm text-muted-foreground">{item.engagement.toLocaleString()} eng</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ingestion status strip */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold text-sm mb-3">Sync Status</h3>
        <div className="flex flex-wrap gap-4">
          {allJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accounts configured yet</p>
          ) : (
            allJobs.map(({ label, job }) => (
              <IngestStatusBadge key={label} job={job} label={label} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
