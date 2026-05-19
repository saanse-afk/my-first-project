import { createServiceClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { WeeklyViewsChart, WeeklyScoreChart, FormatComparisonChart, DayOfWeekHeatmap } from '@/components/dashboard/engagement-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  aggregateTopicPerformance,
  aggregateFormatPerformance,
  aggregateDayPerformance,
  getLatestMetrics,
} from '@/lib/scoring'
import { formatNumber, formatScore, postTypeLabel, hookTypeLabel, formatDate, groupByWeek, getLast30DaysPosts } from '@/lib/utils'
import { Eye, TrendingUp, Zap, Users } from 'lucide-react'
import type { PostWithMetrics } from '@/types'

async function getDashboardData() {
  try {
  const supabase = createServiceClient()

  const [postsRes, accountsRes] = await Promise.all([
    supabase
      .from('posts')
      .select(`*, post_metrics(*)`)
      .order('published_at', { ascending: false })
      .limit(500),
    supabase
      .from('social_accounts')
      .select('followers_count, last_synced_at, platform')
      .order('created_at'),
  ])

  const posts: PostWithMetrics[] = (postsRes.data || []).map((p) => ({
    ...p,
    latest_metrics: p.post_metrics?.sort(
      (a: { recorded_at: string }, b: { recorded_at: string }) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    )[0] ?? null,
  }))

  const accounts = accountsRes.data || []
  const followersCount = accounts.reduce((sum, a) => sum + (a.followers_count || 0), 0)
  const lastSynced = accounts.find((a) => a.platform === 'instagram')?.last_synced_at

  return { posts, followersCount, lastSynced }
  } catch {
    return { posts: [] as PostWithMetrics[], followersCount: 0, lastSynced: null }
  }
}

export default async function DashboardPage() {
  const { posts, followersCount, lastSynced } = await getDashboardData()

  const posts30d = getLast30DaysPosts(posts)

  // KPIs
  const totalReach30d = posts30d.reduce(
    (sum, p) => sum + (getLatestMetrics(p)?.reach || 0),
    0
  )
  const allScores = posts
    .map((p) => getLatestMetrics(p)?.engagement_score)
    .filter((s): s is number => s != null)
  const avgEngagementScore = allScores.length
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : 0
  const viralPosts = posts.filter(
    (p) => (getLatestMetrics(p)?.views || 0) >= 100_000
  ).length
  const totalEngagement = posts30d.reduce((sum, p) => {
    const m = getLatestMetrics(p)
    return sum + (m ? m.likes + m.comments + m.shares + m.saves : 0)
  }, 0)

  // Top 10 posts
  const top10 = [...posts]
    .sort((a, b) => (getLatestMetrics(b)?.engagement_score || 0) - (getLatestMetrics(a)?.engagement_score || 0))
    .slice(0, 10)

  // Format performance
  const formatPerf = aggregateFormatPerformance(posts)
  const formatChartData = formatPerf.map((f) => ({
    format: postTypeLabel(f.post_type),
    score: f.avg_engagement_score,
    views: f.avg_views,
  }))

  // Day of week
  const dayPerf = aggregateDayPerformance(posts)
  const dayChartData = dayPerf.map((d) => ({
    day: d.day_of_week,
    score: d.avg_engagement_score,
    multiplier: d.multiplier,
  }))

  // Topic performance
  const topicPerf = aggregateTopicPerformance(posts)

  // Weekly trends (last 12 weeks)
  const weeklyGroups = groupByWeek(posts).slice(-12)
  const weeklyChartData = weeklyGroups.map(({ week, posts: weekPosts }) => {
    const weekViews = weekPosts.reduce((sum, p) => sum + (getLatestMetrics(p)?.views || 0), 0)
    const weekScores = weekPosts
      .map((p) => getLatestMetrics(p)?.engagement_score)
      .filter((s): s is number => s != null)
    const avgScore = weekScores.length ? weekScores.reduce((a, b) => a + b, 0) / weekScores.length : 0
    return {
      week: week.slice(5), // MM-DD
      views: weekViews,
      score: Math.round(avgScore * 100) / 100,
      posts: weekPosts.length,
    }
  })

  const subtitleText = lastSynced
    ? `Last synced ${new Date(lastSynced).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
    : 'No sync yet — connect Instagram in Settings'

  return (
    <div className="flex flex-col flex-1">
      <Header title="Overview" subtitle={subtitleText} showSync />
      <div className="flex-1 p-6 space-y-6 overflow-auto">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Reach (30d)" value={formatNumber(totalReach30d)} icon={Eye} subtitle={`${posts30d.length} posts`} />
          <KpiCard title="Avg Engagement Score" value={formatScore(avgEngagementScore)} icon={TrendingUp} accent subtitle="All time" />
          <KpiCard title="Viral Posts" value={viralPosts.toString()} icon={Zap} subtitle="100K+ views" />
          <KpiCard title="Followers" value={formatNumber(followersCount)} icon={Users} subtitle="Instagram" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-[#111111] border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Weekly Views</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyViewsChart data={weeklyChartData} />
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Weekly Avg Score</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyScoreChart data={weeklyChartData} />
            </CardContent>
          </Card>
        </div>

        {/* Format + Day grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-[#111111] border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Format Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <FormatComparisonChart data={formatChartData} />
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Best Days to Post</CardTitle>
              <p className="text-xs text-white/30">Bar height = avg engagement score</p>
            </CardHeader>
            <CardContent>
              <DayOfWeekHeatmap data={dayChartData} />
            </CardContent>
          </Card>
        </div>

        {/* Topic performance */}
        <Card className="bg-[#111111] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Topic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs text-white/30 font-normal pb-2">Topic</th>
                    <th className="text-right text-xs text-white/30 font-normal pb-2">Posts</th>
                    <th className="text-right text-xs text-white/30 font-normal pb-2">Avg Score</th>
                    <th className="text-right text-xs text-white/30 font-normal pb-2">Avg Views</th>
                    <th className="text-right text-xs text-white/30 font-normal pb-2">vs Baseline</th>
                  </tr>
                </thead>
                <tbody>
                  {topicPerf.map((t) => (
                    <tr key={t.topic} className="border-b border-white/5 last:border-0">
                      <td className="py-2.5 text-white/80">{t.topic}</td>
                      <td className="py-2.5 text-right text-white/50">{t.post_count}</td>
                      <td className="py-2.5 text-right text-amber-400 font-medium">{formatScore(t.avg_engagement_score)}</td>
                      <td className="py-2.5 text-right text-white/50">{formatNumber(t.avg_views)}</td>
                      <td className="py-2.5 text-right">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            t.multiplier >= 1.2
                              ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5'
                              : t.multiplier < 0.8
                              ? 'text-red-400 border-red-400/30 bg-red-400/5'
                              : 'text-white/40 border-white/10'
                          }`}
                        >
                          {t.multiplier.toFixed(1)}x
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top 10 posts */}
        <Card className="bg-[#111111] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Top 10 Posts by Engagement Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs text-white/30 font-normal pb-2">#</th>
                    <th className="text-left text-xs text-white/30 font-normal pb-2">Post</th>
                    <th className="text-left text-xs text-white/30 font-normal pb-2">Format</th>
                    <th className="text-left text-xs text-white/30 font-normal pb-2">Hook</th>
                    <th className="text-right text-xs text-white/30 font-normal pb-2">Score</th>
                    <th className="text-right text-xs text-white/30 font-normal pb-2">Views</th>
                    <th className="text-right text-xs text-white/30 font-normal pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {top10.map((post, i) => {
                    const m = getLatestMetrics(post)
                    return (
                      <tr key={post.id} className="border-b border-white/5 last:border-0">
                        <td className="py-2.5 text-white/30 text-xs">{i + 1}</td>
                        <td className="py-2.5 max-w-xs">
                          <p className="text-white/80 truncate text-xs">{post.title || '(no caption)'}</p>
                          {post.topic && <p className="text-white/30 text-xs">{post.topic}</p>}
                        </td>
                        <td className="py-2.5">
                          <Badge variant="outline" className="text-xs text-white/40 border-white/10">
                            {postTypeLabel(post.post_type)}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-xs text-white/40">{hookTypeLabel(post.hook_type)}</td>
                        <td className="py-2.5 text-right text-amber-400 font-semibold">{formatScore(m?.engagement_score)}</td>
                        <td className="py-2.5 text-right text-white/50 text-xs">{formatNumber(m?.views || 0)}</td>
                        <td className="py-2.5 text-right text-white/30 text-xs">{formatDate(post.published_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
