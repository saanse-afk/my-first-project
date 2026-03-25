import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  getUploadsPlaylistId,
  fetchAllVideoIds,
  fetchVideoMetadataBatch,
  fetchVideoAnalytics,
  buildYTPostRecord,
} from '@/lib/youtube'

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()

  const body = await request.json().catch(() => ({}))
  const channelId = body.channelId || process.env.YOUTUBE_CHANNEL_ID

  if (!channelId) {
    return Response.json({ error: 'Missing YouTube channel ID' }, { status: 400 })
  }

  // Find or create social_accounts record
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'ancient-india-saanse')
    .single()

  let { data: account } = await supabase
    .from('social_accounts')
    .select('id')
    .eq('account_id', channelId)
    .eq('platform', 'youtube')
    .single()

  if (!account) {
    const { data: newAccount } = await supabase
      .from('social_accounts')
      .insert({
        organization_id: org?.id,
        platform: 'youtube',
        account_id: channelId,
        account_name: channelId,
      })
      .select('id')
      .single()
    account = newAccount
  }

  const socialAccountId = account!.id

  const { data: syncLog } = await supabase
    .from('sync_logs')
    .insert({ social_account_id: socialAccountId })
    .select('id')
    .single()
  const syncLogId = syncLog?.id

  try {
    const uploadsPlaylistId = await getUploadsPlaylistId(channelId)
    const videoIds = await fetchAllVideoIds(uploadsPlaylistId)
    const metadataList = await fetchVideoMetadataBatch(videoIds)

    const today = new Date().toISOString().slice(0, 10)
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    const startDate = twoYearsAgo.toISOString().slice(0, 10)

    let postsSynced = 0

    for (const meta of metadataList) {
      const analytics = await fetchVideoAnalytics(meta.id, startDate, today)
      const { post, metrics } = buildYTPostRecord(socialAccountId, meta, analytics)

      const { data: upsertedPost, error: postError } = await supabase
        .from('posts')
        .upsert(post, { onConflict: 'social_account_id,platform_post_id' })
        .select('id')
        .single()

      if (postError) {
        console.error('YT post upsert error:', postError)
        continue
      }

      await supabase.from('post_metrics').upsert(
        { ...metrics, post_id: upsertedPost.id, recorded_at: new Date().toISOString() },
        { onConflict: 'post_id,recorded_at::date' }
      )

      postsSynced++
      await new Promise((r) => setTimeout(r, 100))
    }

    await supabase
      .from('social_accounts')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', socialAccountId)

    await supabase
      .from('sync_logs')
      .update({ status: 'success', completed_at: new Date().toISOString(), posts_synced: postsSynced })
      .eq('id', syncLogId)

    return Response.json({ success: true, posts_synced: postsSynced })
  } catch (err) {
    await supabase
      .from('sync_logs')
      .update({ status: 'error', completed_at: new Date().toISOString(), error_message: String(err) })
      .eq('id', syncLogId)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
