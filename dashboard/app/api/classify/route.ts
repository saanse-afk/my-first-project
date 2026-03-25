import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { classifyPost } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const { postId, caption } = await request.json()
    if (!postId || !caption) {
      return Response.json({ error: 'postId and caption are required' }, { status: 400 })
    }

    const classification = await classifyPost(caption)

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('posts')
      .update({
        topic: classification.topic,
        content_type: classification.content_type,
        hook_type: classification.hook_type,
      })
      .eq('id', postId)

    if (error) throw error

    return Response.json({ success: true, classification })
  } catch (err) {
    console.error('Classify error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
