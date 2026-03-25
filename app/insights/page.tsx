"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { KeyFindings } from "@/components/insights/key-findings"
import { TopicPerformance } from "@/components/insights/topic-performance"
import { FormatMatrix } from "@/components/insights/format-matrix"
import { HookAnalysis } from "@/components/insights/hook-analysis"
import { Recommendations } from "@/components/insights/recommendations"
import { EmptyState } from "@/components/layout/empty-state"
import { useAnalytics } from "@/lib/use-analytics"

export default function InsightsPage() {
  const { data, loading } = useAnalytics()

  if (loading) {
    return (
      <MainLayout title="Insights" subtitle="Data-driven content strategy">
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
      </MainLayout>
    )
  }

  const hasData = data && data.kpis.totalPosts > 0

  return (
    <MainLayout title="Insights" subtitle="Data-driven content strategy">
      {!hasData ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          <KeyFindings insights={data.insights} />
          <TopicPerformance topics={data.byTopic} />
          <FormatMatrix data={data.contentMatrix} />
          <HookAnalysis data={data.byHook} />
          <Recommendations recommendations={data.recommendations as Parameters<typeof Recommendations>[0]["recommendations"]} />
        </div>
      )}
    </MainLayout>
  )
}
