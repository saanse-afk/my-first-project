'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { AccountSwitcher } from '@/components/dashboard/AccountSwitcher'
import { DateRangePicker } from '@/components/dashboard/DateRangePicker'
import { TopContentTable } from '@/components/dashboard/TopContentTable'
import { IngestStatusBadge } from '@/components/dashboard/IngestStatusBadge'
import { ViewsChart } from '@/components/charts/ViewsChart'
import { WatchTimeChart } from '@/components/charts/WatchTimeChart'
import { YouTubeMetric, YouTubeVideo, IngestionJob, SentimentData, DateRange } from '@/types'

interface YouTubeData {
  metrics: YouTubeMetric[]
  videos: YouTubeVideo[]
  last_updated: string | null
  channels: Array<{ id: string; channel_id: string; name: string | null }>
  jobs: IngestionJob[]
  sentiment: SentimentData[]
}

export default function YouTubePage() {
  const [data, setData] = useState<YouTubeData | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<string>('all')
  const [days, setDays] = useState<DateRange>(30)
  const [refreshing, setRefreshing] = useState(false)
  const [sentimentMap, setSentimentMap] = useState<
    Record<string, { positive_pct: number; neutral_pct: number; negative_pct: number; summary: string | null }>
  >({})
  const [sentimentLoading, setSentimentLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    const params = new URLSearchParams({ days: String(days) })
    if (selectedChannel !== 'all') params.set('channelId', selectedChannel)
    try {
      const res = await fetch(`/api/youtube/metrics?${params}`)
      const json = await res.json() as YouTubeData
      setData(json)
      // Pre-populate sentiment map from cached results
      const map: typeof sentimentMap = {}
      for (const s of json.sentiment ?? []) {
        map[s.video_id] = {
          positive_pct: Number(s.positive_pct),
          neutral_pct: Number(s.neutral_pct),
          negative_pct: Number(s.negative_pct),
          summary: s.summary,
        }
      }
      setSentimentMap(map)
    } catch (err) {
      console.error('Failed to load YouTube data:', err)
    }
  }, [selectedChannel, days])

  useEffect(() => { load() }, [load])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const body = selectedChannel !== 'all' ? { channelId: selectedChannel } : {}
      await fetch('/api/youtube/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  const handleSentiment = async (videoId: string) => {
    setSentimentLoading(videoId)
    try {
      // We pass empty comments; the API will use cache or error gracefully
      // In production, comments would be fetched from YouTube Data API
      const res = await fetch('/api/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, comments: [] }),
      })
      const result = await res.json() as {
        positive_pct: number
        neutral_pct: number
        negative_pct: number
        summary: string | null
      }
      if (res.ok) {
        setSentimentMap((prev) => ({ ...prev, [videoId]: result }))
      }
    } catch (err) {
      console.error('Sentiment analysis failed:', err)
    } finally {
      setSentimentLoading(null)
    }
  }

  // Aggregate latest metrics
  const getLatestMetric = (): YouTubeMetric | null => {
    if (!data?.metrics.length) return null
    if (selectedChannel !== 'all') return data.metrics.at(-1) ?? null

    return data.metrics.reduce(
      (acc, m) => ({
        ...acc,
        subscribers: (acc.subscribers ?? 0) + (m.subscribers ?? 0),
        total_views: (acc.total_views ?? 0) + (m.total_views ?? 0),
        watch_time_hours: Number(acc.watch_time_hours ?? 0) + Number(m.watch_time_hours ?? 0),
        impressions: (acc.impressions ?? 0) + (m.impressions ?? 0),
        avg_view_duration: null,
        ctr: null,
        engagement_rate: null,
      }),
      {} as Partial<YouTubeMetric>
    ) as YouTubeMetric
  }

  const latest = getLatestMetric()
  const lastUpdated = data?.last_updated ? new Date(data.last_updated) : null

  const currentJob =
    selectedChannel !== 'all'
      ? (data?.jobs.find((j) => j.account_id === selectedChannel) ?? null)
      : null

  // Build sentiment map with loading state
  const displaySentimentMap = { ...sentimentMap }

  const channelAccounts = (data?.channels ?? []).map((c) => ({
    id: c.id,
    username: c.name ?? c.id,
    name: c.name,
  }))

  return (
    <div>
      <Header
        title="YouTube"
        actions={
          <div className="flex items-center gap-3">
            <AccountSwitcher
              accounts={channelAccounts}
              selected={selectedChannel}
              onChange={setSelectedChannel}
              allLabel="All Channels"
            />
            <DateRangePicker value={days} onChange={setDays} />
            <button
              onClick={() => {
                const params = new URLSearchParams({ platform: 'youtube', type: 'metrics', days: String(days) })
                if (selectedChannel !== 'all') params.set('channelId', selectedChannel)
                window.open(`/api/export?${params}`)
              }}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        }
      />

      {currentJob && (
        <div className="mb-4">
          <IngestStatusBadge
            job={currentJob}
            label={data?.channels.find((c) => c.id === selectedChannel)?.name ?? selectedChannel}
          />
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard title="Subscribers" value={latest?.subscribers?.toLocaleString() ?? null} lastUpdated={lastUpdated} />
        <MetricCard title="Total Views" value={latest?.total_views?.toLocaleString() ?? null} lastUpdated={lastUpdated} />
        <MetricCard
          title="Watch Time (hrs)"
          value={latest?.watch_time_hours != null ? Number(latest.watch_time_hours).toFixed(0) : null}
          lastUpdated={lastUpdated}
        />
        <MetricCard
          title="Avg View Duration"
          value={latest?.avg_view_duration != null ? `${latest.avg_view_duration}s` : null}
          lastUpdated={lastUpdated}
        />
        <MetricCard
          title="CTR"
          value={latest?.ctr != null ? `${Number(latest.ctr).toFixed(2)}%` : null}
          lastUpdated={lastUpdated}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm mb-4">Subscriber Growth</h3>
          <WatchTimeChart data={data?.metrics ?? []} />
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm mb-4">Daily Views</h3>
          <ViewsChart data={data?.metrics ?? []} />
        </div>
      </div>

      {/* Top videos */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Top Videos</h3>
          <button
            onClick={() => {
              const params = new URLSearchParams({ platform: 'youtube', type: 'videos' })
              if (selectedChannel !== 'all') params.set('channelId', selectedChannel)
              window.open(`/api/export?${params}`)
            }}
            className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors"
          >
            Export Videos CSV
          </button>
        </div>
        <TopContentTable
          platform="youtube"
          items={
            sentimentLoading
              ? data?.videos ?? []
              : data?.videos ?? []
          }
          onSentiment={handleSentiment}
          sentimentData={displaySentimentMap}
        />
      </div>
    </div>
  )
}
