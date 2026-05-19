import { createServiceClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  aggregateTopicPerformance,
  aggregateFormatPerformance,
  aggregateHookPerformance,
  getLatestMetrics,
} from '@/lib/scoring'
import { computeOverallAvgScore, identifyContentGaps, detectPatterns } from '@/lib/recommendations'
import { formatScore, formatNumber, postTypeLabel, hookTypeLabel } from '@/lib/utils'
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import { InsightsGenerateButton } from '@/components/insights/generate-button'
import type { PostWithMetrics } from '@/types'

export default async function InsightsPage() {
  let postsRes = { data: null }, festsRes = { data: null }
  try {
    const supabase = createServiceClient()
    ;[postsRes, festsRes] = await Promise.all([
      supabase.from('posts').select(`*, post_metrics(*)`).order('published_at', { ascending: false }).limit(500),
      supabase.from('festivals').select('*').gte('date', new Date().toISOString().slice(0, 10)).order('date').limit(20),
    ])
  } catch { /* show empty state */ }

  const posts: PostWithMetrics[] = (postsRes.data || []).map((p) => ({
    ...p,
    latest_metrics: p.post_metrics?.sort(
      (a: { recorded_at: string }, b: { recorded_at: string }) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    )[0] ?? null,
  }))

  const topicPerformance = aggregateTopicPerformance(posts)
  const formatPerformance = aggregateFormatPerformance(posts)
  const hookPerformance = aggregateHookPerformance(posts)
  const overallAvg = computeOverallAvgScore(posts)
  const contentGaps = identifyContentGaps(posts)
  const patterns = detectPatterns(topicPerformance, overallAvg)

  // Topic × format matrix
  type MatrixCell = { score: number; count: number }
  const topicFormatMatrix: Record<string, Record<string, MatrixCell>> = {}
  const topics = [...new Set(posts.map((p) => p.topic).filter(Boolean))] as string[]
  const formats = ['VIDEO', 'CAROUSEL_ALBUM', 'IMAGE']

  for (const topic of topics) {
    topicFormatMatrix[topic] = {}
    for (const format of formats) {
      const matching = posts.filter((p) => p.topic === topic && p.post_type === format)
      const scores = matching.map((p) => getLatestMetrics(p)?.engagement_score).filter((s): s is number => s != null)
      topicFormatMatrix[topic][format] = {
        score: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0,
        count: scores.length,
      }
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Insights" subtitle="Data-driven content intelligence" />
      <div className="flex-1 p-6 space-y-6 overflow-auto">

        {/* Generate button */}
        <InsightsGenerateButton />

        {/* Pattern insights */}
        {patterns.length > 0 && (
          <div className="space-y-3">
            {patterns.map((p, i) => (
              <Card key={i} className={`border-white/5 ${p.severity === 'warning' ? 'bg-red-950/30 border-red-500/20' : 'bg-emerald-950/30 border-emerald-500/20'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${p.severity === 'warning' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {p.severity === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${p.severity === 'warning' ? 'text-red-300' : 'text-emerald-300'}`}>{p.title}</p>
                      <p className="text-xs text-white/50 mt-0.5">{p.description}</p>
                      <p className="text-xs text-white/70 mt-1.5 italic">{p.action}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Hook performance */}
        <Card className="bg-[#111111] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Hook Style Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {hookPerformance.map((h, i) => {
                const maxScore = hookPerformance[0]?.avg_engagement_score || 1
                const width = Math.max((h.avg_engagement_score / maxScore) * 100, 4)
                return (
                  <div key={h.hook_type} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-white/50 shrink-0">{hookTypeLabel(h.hook_type)}</div>
                    <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-white/20'}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-xs font-medium text-amber-400">{formatScore(h.avg_engagement_score)}</div>
                    <div className="w-8 text-right text-xs text-white/30">{h.post_count}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Topic × Format matrix */}
        <Card className="bg-[#111111] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Topic × Format Matrix</CardTitle>
            <p className="text-xs text-white/30">Avg engagement score (number of posts)</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs text-white/30 font-normal pb-2 pr-4">Topic</th>
                    {formats.map((f) => (
                      <th key={f} className="text-center text-xs text-white/30 font-normal pb-2 px-2">{postTypeLabel(f)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topics.map((topic) => (
                    <tr key={topic} className="border-b border-white/5 last:border-0">
                      <td className="py-2 pr-4 text-white/70 text-xs">{topic}</td>
                      {formats.map((format) => {
                        const cell = topicFormatMatrix[topic]?.[format]
                        return (
                          <td key={format} className="py-2 px-2 text-center">
                            {cell?.count > 0 ? (
                              <div>
                                <span className={`text-xs font-medium ${cell.score >= 20 ? 'text-amber-400' : 'text-white/50'}`}>
                                  {formatScore(cell.score)}
                                </span>
                                <span className="text-[10px] text-white/20 ml-1">({cell.count})</span>
                              </div>
                            ) : (
                              <span className="text-white/10 text-xs">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Content gaps */}
        <Card className="bg-[#111111] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Content Gap Analysis</CardTitle>
            <p className="text-xs text-white/30">Days since last post per topic</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {contentGaps.map((g) => (
                <div
                  key={g.topic}
                  className={`rounded-lg p-3 border ${
                    g.status === 'gap'
                      ? 'bg-red-950/20 border-red-500/20'
                      : g.status === 'stale'
                      ? 'bg-yellow-950/20 border-yellow-500/20'
                      : 'bg-emerald-950/20 border-emerald-500/20'
                  }`}
                >
                  <p className="text-xs font-medium text-white/70">{g.topic}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3 text-white/30" />
                    <p className={`text-xs ${
                      g.status === 'gap'
                        ? 'text-red-400'
                        : g.status === 'stale'
                        ? 'text-yellow-400'
                        : 'text-emerald-400'
                    }`}>
                      {g.days_since_last_post === null ? 'Never posted' : `${g.days_since_last_post}d ago`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Format + topic summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-[#111111] border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Format Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formatPerformance.map((f) => (
                  <div key={f.post_type} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/70">{postTypeLabel(f.post_type)}</p>
                      <p className="text-xs text-white/30">{f.post_count} posts · {formatNumber(f.avg_views)} avg views</p>
                    </div>
                    <span className="text-amber-400 font-semibold text-sm">{formatScore(f.avg_engagement_score)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Topic Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {topicPerformance.slice(0, 6).map((t) => (
                  <div key={t.topic} className="flex items-center justify-between">
                    <p className="text-xs text-white/70">{t.topic}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${
                        t.multiplier >= 1.2 ? 'text-emerald-400 border-emerald-400/30' : t.multiplier < 0.8 ? 'text-red-400 border-red-400/30' : 'text-white/30 border-white/10'
                      }`}>{t.multiplier.toFixed(1)}x</Badge>
                      <span className="text-amber-400 font-medium text-sm">{formatScore(t.avg_engagement_score)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
