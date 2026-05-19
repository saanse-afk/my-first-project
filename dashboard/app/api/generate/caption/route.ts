import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateCaptions } from '@/lib/claude'
import type { GenerateCaptionInput } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const input: GenerateCaptionInput = await request.json()
    if (!input.topic || !input.key_message) {
      return Response.json({ error: 'topic and key_message are required' }, { status: 400 })
    }

    const result = await generateCaptions(input)

    const supabase = createServiceClient()
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'ancient-india-saanse')
      .single()

    await supabase.from('ai_generations').insert({
      organization_id: org?.id,
      generation_type: 'caption',
      input_context: input as unknown as Record<string, unknown>,
      output_content: JSON.stringify(result),
      model: 'claude-sonnet-4-20250514',
    })

    return Response.json(result)

  } catch (err) {
    console.error('Generate caption error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
