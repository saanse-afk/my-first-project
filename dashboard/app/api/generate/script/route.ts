import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateScript } from '@/lib/claude'
import { getLatestMetrics, aggregateHookPerformance } from '@/lib/scoring'
import { getUpcomingFestivals } from '@/lib/festivals'
import type { PostWithMetrics, GenerateScriptInput } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const input: GenerateScriptInput = await request.json()
    if (!input.topic) {
      return Response.json({ error: 'topic is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Get top 5 posts for this topic
    const { data: postsData } = await supabase
      .from('posts')
      .select(`*, post_metrics(*)`)
      .eq('topic', input.topic)
      .order('published_at', { ascending: false })
      .limit(20)

    const posts: PostWithMetrics[] = (postsData || []).map((p) => ({
      ...p,
      latest_metrics: p.post_metrics?.sort(
        (a: { recorded_at: string }, b: { recorded_at: string }) =>
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      )[0] ?? null,
    }))

    const topPosts = posts
      .sort((a, b) => (getLatestMetrics(b)?.engagement_score || 0) - (getLatestMetrics(a)?.engagement_score || 0))
      .slice(0, 5)

    // Get hook performance
    const { data: allPostsData } = await supabase
      .from('posts')
      .select(`*, post_metrics(*)`)
      .limit(200)

    const allPosts: PostWithMetrics[] = (allPostsData || []).map((p) => ({
      ...p,
      latest_metrics: p.post_metrics?.sort(
        (a: { recorded_at: string }, b: { recorded_at: string }) =>
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      )[0] ?? null,
    }))
    const hookPerformance = aggregateHookPerformance(allPosts)

    // Get upcoming festivals
    const { data: festData } = await supabase
      .from('festivals')
      .select('*')
      .gte('date', new Date().toISOString().slice(0, 10))
      .order('date')
      .limit(10)

    const upcomingFestivals = getUpcomingFestivals(festData || [], 21)

    const result = await generateScript(input, topPosts, hookPerformance, upcomingFestivals)

    // Save to ai_generations
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'ancient-india-saanse')
      .single()

    await supabase.from('ai_generations').insert({
      organization_id: org?.id,
      generation_type: 'script',
      input_context: input as unknown as Record<string, unknown>,
      output_content: JSON.stringify(result),
      model: 'claude-sonnet-4-20250514',
    })

    return Response.json(result)
  } catch (err) {
    console.error('Generate script error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
