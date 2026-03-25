"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { WeeklyViewsChart } from "@/components/dashboard/weekly-views-chart"
import { EngagementChart } from "@/components/dashboard/engagement-chart"
import { FormatComparisonChart } from "@/components/dashboard/format-comparison-chart"
import { BestPostingDaysChart } from "@/components/dashboard/best-posting-days-chart"
import { TopPostsChart } from "@/components/dashboard/top-posts-chart"
import { EmptyState } from "@/components/layout/empty-state"
import { useAnalytics, usePosts } from "@/lib/use-analytics"

export default function OverviewPage() {
  const { data, loading } = useAnalytics()
  const { posts } = usePosts()

  if (loading) {
    return (
      <MainLayout title="Overview" subtitle="Ancient India by SAANSE">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
      </MainLayout>
    )
  }

  const hasData = data && data.kpis.totalPosts > 0

  return (
    <MainLayout title="Overview" subtitle="Ancient India by SAANSE">
      {!hasData ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          <KPICards data={data.kpis} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WeeklyViewsChart data={data.weekly} />
            <EngagementChart data={data.weekly} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormatComparisonChart data={data.byFormat} />
            <BestPostingDaysChart data={data.byDay} />
          </div>

          <TopPostsChart posts={posts} />
        </div>
      )}
    </MainLayout>
  )
}
