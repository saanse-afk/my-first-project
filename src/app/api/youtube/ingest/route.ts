import { NextRequest, NextResponse } from 'next/server'
import { ingestAllYouTube, ingestYouTubeChannel } from '@/lib/ingestion'
import { getYouTubeChannels } from '@/lib/youtube'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { channelId?: string }

    if (body.channelId) {
      const channels = await getYouTubeChannels()
      const channel = channels.find((c) => c.id === body.channelId)
      if (!channel) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
      }
      await ingestYouTubeChannel(channel)
      return NextResponse.json({ success: true, channelId: body.channelId })
    }

    const result = await ingestAllYouTube()
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/youtube/ingest]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
