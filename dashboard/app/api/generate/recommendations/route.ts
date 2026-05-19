import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateRecommendations } from '@/lib/claude'
import {
  aggregateTopicPerformance,
  aggregateFormatPerformance,
  aggregateHookPerformance,
  getLatestMetrics,
} from '@/lib/scoring'
import { getUpcomingFestivals } from '@/lib/festivals'
import { computeOverallAvgScore } from '@/lib/recommendations'
import type { PostWithMetrics } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    const { data: allPostsData } = await supabase
      .from('posts')
      .select(`*, post_metrics(*)`)
      .order('published_at', { ascending: false })
      .limit(500)

    const allPosts: PostWithMetrics[] = (allPostsData || []).map((p) => ({
      ...p,
      latest_metrics: p.post_metrics?.sort(
        (a: { recorded_at: string }, b: { recorded_at: string }) =>
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      )[0] ?? null,
    }))

    const topicPerformance = aggregateTopicPerformance(allPosts)
    const formatPerformance = aggregateFormatPerformance(allPosts)
    const hookPerformance = aggregateHookPerformance(allPosts)
    const overallAvgScore = computeOverallAvgScore(allPosts)

    const recentPosts = allPosts
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 10)
      .map((p) => ({ ...p, latest_metrics: getLatestMetrics(p) ?? undefined }))

    const { data: festData } = await supabase
      .from('festivals')
      .select('*')
      .gte('date', new Date().toISOString().slice(0, 10))
      .order('date')
      .limit(20)

    const upcomingFestivals = getUpcomingFestivals(festData || [], 21)

    const recommendations = await generateRecommendations({
      topicPerformance,
      formatPerformance,
      hookPerformance,
      recentPosts,
      upcomingFestivals,
      overallAvgScore,
    })

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'ancient-india-saanse')
      .single()

    await supabase.from('ai_generations').insert({
      organization_id: org?.id,
      generation_type: 'recommendations',
      input_context: { generated_at: new Date().toISOString() },
      output_content: JSON.stringify(recommendations),
      model: 'claude-sonnet-4-20250514',
    })

    return Response.json(recommendations)
  } catch (err) {
    console.error('Generate recommendations error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
