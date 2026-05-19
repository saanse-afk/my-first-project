'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { AccountSwitcher } from '@/components/dashboard/AccountSwitcher'
import { DateRangePicker } from '@/components/dashboard/DateRangePicker'
import { TopContentTable } from '@/components/dashboard/TopContentTable'
import { IngestStatusBadge } from '@/components/dashboard/IngestStatusBadge'
import { FollowerGrowthChart } from '@/components/charts/FollowerGrowthChart'
import { EngagementChart } from '@/components/charts/EngagementChart'
import { InstagramMetric, InstagramPost, IngestionJob, DateRange } from '@/types'

interface InstagramData {
  metrics: InstagramMetric[]
  posts: InstagramPost[]
  last_updated: string | null
  accounts: Array<{ id: string; username: string; name: string | null }>
  jobs: IngestionJob[]
}

export default function InstagramPage() {
  const [data, setData] = useState<InstagramData | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [days, setDays] = useState<DateRange>(30)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const params = new URLSearchParams({ days: String(days) })
    if (selectedAccount !== 'all') params.set('accountId', selectedAccount)
    try {
      const res = await fetch(`/api/instagram/metrics?${params}`)
      const json = await res.json() as InstagramData
      setData(json)
    } catch (err) {
      console.error('Failed to load Instagram data:', err)
    }
  }, [selectedAccount, days])

  useEffect(() => { load() }, [load])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const body = selectedAccount !== 'all' ? { accountId: selectedAccount } : {}
      await fetch('/api/instagram/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  const handleExport = () => {
    const params = new URLSearchParams({
      platform: 'instagram',
      type: 'metrics',
      days: String(days),
    })
    if (selectedAccount !== 'all') params.set('accountId', selectedAccount)
    window.open(`/api/export?${params}`)
  }

  // Aggregate or single account metrics
  const getLatestMetric = (): InstagramMetric | null => {
    if (!data?.metrics.length) return null
    if (selectedAccount !== 'all') {
      return data.metrics.at(-1) ?? null
    }
    // Aggregate across accounts for the latest date
    const latest = data.metrics.reduce(
      (acc, m) => ({
        ...acc,
        followers: (acc.followers ?? 0) + (m.followers ?? 0),
        reach: (acc.reach ?? 0) + (m.reach ?? 0),
        impressions: (acc.impressions ?? 0) + (m.impressions ?? 0),
        profile_visits: (acc.profile_visits ?? 0) + (m.profile_visits ?? 0),
        engagement_rate: null, // averaged separately
      }),
      {} as Partial<InstagramMetric>
    ) as InstagramMetric
    const engRates = data.metrics.map((m) => Number(m.engagement_rate ?? 0)).filter((n) => n > 0)
    latest.engagement_rate = engRates.length
      ? engRates.reduce((a, b) => a + b, 0) / engRates.length
      : null
    return latest
  }

  const latest = getLatestMetric()
  const lastUpdated = data?.last_updated ? new Date(data.last_updated) : null

  const currentJob =
    selectedAccount !== 'all'
      ? (data?.jobs.find((j) => j.account_id === selectedAccount) ?? null)
      : null

  return (
    <div>
      <Header
        title="Instagram"
        actions={
          <div className="flex items-center gap-3">
            <AccountSwitcher
              accounts={data?.accounts ?? []}
              selected={selectedAccount}
              onChange={setSelectedAccount}
            />
            <DateRangePicker value={days} onChange={setDays} />
            <button
              onClick={handleExport}
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
            label={data?.accounts.find((a) => a.id === selectedAccount)?.name ?? selectedAccount}
          />
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard title="Followers" value={latest?.followers?.toLocaleString() ?? null} lastUpdated={lastUpdated} />
        <MetricCard title="Reach" value={latest?.reach?.toLocaleString() ?? null} lastUpdated={lastUpdated} />
        <MetricCard title="Impressions" value={latest?.impressions?.toLocaleString() ?? null} lastUpdated={lastUpdated} />
        <MetricCard
          title="Engagement Rate"
          value={latest?.engagement_rate != null ? `${Number(latest.engagement_rate).toFixed(2)}%` : null}
          lastUpdated={lastUpdated}
        />
        <MetricCard title="Profile Visits" value={latest?.profile_visits?.toLocaleString() ?? null} lastUpdated={lastUpdated} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm mb-4">Follower Growth</h3>
          <FollowerGrowthChart data={data?.metrics ?? []} />
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm mb-4">Daily Reach</h3>
          <EngagementChart data={data?.metrics ?? []} />
        </div>
      </div>

      {/* Top posts */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Top Posts</h3>
          <button
            onClick={() => {
              const params = new URLSearchParams({ platform: 'instagram', type: 'posts' })
              if (selectedAccount !== 'all') params.set('accountId', selectedAccount)
              window.open(`/api/export?${params}`)
            }}
            className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors"
          >
            Export Posts CSV
          </button>
        </div>
        <TopContentTable platform="instagram" items={data?.posts ?? []} />
      </div>
    </div>
  )
}
