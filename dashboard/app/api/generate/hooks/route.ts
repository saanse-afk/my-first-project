import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateHooks } from '@/lib/claude'
import { aggregateHookPerformance } from '@/lib/scoring'
import type { GenerateHooksInput, PostWithMetrics } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const input: GenerateHooksInput = await request.json()
    if (!input.topic || !input.angle) {
      return Response.json({ error: 'topic and angle are required' }, { status: 400 })
    }

    const supabase = createServiceClient()

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
    const result = await generateHooks(input, hookPerformance)

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'ancient-india-saanse')
      .single()

    await supabase.from('ai_generations').insert({
      organization_id: org?.id,
      generation_type: 'hooks',
      input_context: input as unknown as Record<string, unknown>,
      output_content: JSON.stringify(result),
      model: 'claude-sonnet-4-20250514',
    })

    return Response.json(result)
  } catch (err) {
    console.error('Generate hooks error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
