import { NextRequest, NextResponse } from 'next/server'
import { analyseSentiment } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { videoId?: string; comments?: string[] }

    if (!body.videoId || !Array.isArray(body.comments)) {
      return NextResponse.json(
        { error: 'videoId and comments are required' },
        { status: 400 }
      )
    }

    const result = await analyseSentiment(body.videoId, body.comments)
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/sentiment]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
