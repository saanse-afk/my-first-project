import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  fetchAllMediaIds,
  fetchPostsBatch,
  buildPostRecord,
  fetchAccountInfo,
  refreshLongLivedToken,
} from '@/lib/instagram'

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()

  // Support both env-based config and request body for multi-client
  let accountId: string
  let accessToken: string
  let socialAccountId: string

  try {
    const body = await request.json().catch(() => ({}))
    accountId = body.accountId || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!
    accessToken = body.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN!
    socialAccountId = body.socialAccountId

    if (!accountId || !accessToken) {
      return Response.json({ error: 'Missing Instagram credentials' }, { status: 400 })
    }
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // If no socialAccountId provided, look it up or create the record
  if (!socialAccountId) {
    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id, token_expires_at')
      .eq('account_id', accountId)
      .eq('platform', 'instagram')
      .single()

    if (existing) {
      socialAccountId = existing.id

      // Auto-refresh token if within 10 days of expiry
      if (existing.token_expires_at) {
        const expiresAt = new Date(existing.token_expires_at)
        const daysUntilExpiry = Math.ceil(
          (expiresAt.getTime() - Date.now()) / 86_400_000
        )
        if (daysUntilExpiry <= 10) {
          try {
            const refreshed = await refreshLongLivedToken(accessToken)
            const newExpiry = new Date()
            newExpiry.setSeconds(newExpiry.getSeconds() + refreshed.expires_in)
            await supabase
              .from('social_accounts')
              .update({
                access_token: refreshed.access_token,
                token_expires_at: newExpiry.toISOString(),
              })
              .eq('id', socialAccountId)
            accessToken = refreshed.access_token
          } catch (e) {
            console.warn('Token refresh failed:', e)
          }
        }
      }
    } else {
      // Find default org
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', 'ancient-india-saanse')
        .single()

      const tokenExpiry = new Date()
      tokenExpiry.setDate(tokenExpiry.getDate() + 60)

      const { data: newAccount } = await supabase
        .from('social_accounts')
        .insert({
          organization_id: org?.id,
          platform: 'instagram',
          account_id: accountId,
          access_token: accessToken,
          token_expires_at: tokenExpiry.toISOString(),
        })
        .select('id')
        .single()

      socialAccountId = newAccount!.id
    }
  }

  // Create sync log
  const { data: syncLog } = await supabase
    .from('sync_logs')
    .insert({ social_account_id: socialAccountId })
    .select('id')
    .single()
  const syncLogId = syncLog?.id

  try {
    // Get account info (followers, username)
    const accountInfo = await fetchAccountInfo(accountId, accessToken)
    await supabase
      .from('social_accounts')
      .update({
        followers_count: accountInfo.followers_count,
        account_name: accountInfo.username,
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', socialAccountId)

    // Find the most recent post we have to do incremental sync
    const { data: lastPost } = await supabase
      .from('posts')
      .select('published_at')
      .eq('social_account_id', socialAccountId)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    const since = lastPost?.published_at
      ? Math.floor(new Date(lastPost.published_at).getTime() / 1000).toString()
      : undefined

    // Fetch all media IDs (or new ones since last sync)
    const mediaIds = await fetchAllMediaIds(accountId, accessToken, since)

    if (mediaIds.length === 0) {
      await supabase
        .from('sync_logs')
        .update({ status: 'success', completed_at: new Date().toISOString(), posts_synced: 0 })
        .eq('id', syncLogId)
      return Response.json({ success: true, posts_synced: 0 })
    }

    // Fetch full details + insights in batches
    const postData = await fetchPostsBatch(mediaIds, accessToken)

    let postsSynced = 0
    const unclassifiedPostIds: { id: string; caption: string }[] = []

    for (const { media, insights } of postData) {
      const { post, metrics } = buildPostRecord(socialAccountId, media, insights)

      // Upsert post
      const { data: upsertedPost, error: postError } = await supabase
        .from('posts')
        .upsert(post, { onConflict: 'social_account_id,platform_post_id' })
        .select('id, topic')
        .single()

      if (postError) {
        console.error('Post upsert error:', postError)
        continue
      }

      // Upsert metrics (one record per day)
      await supabase.from('post_metrics').upsert(
        { ...metrics, post_id: upsertedPost.id, recorded_at: new Date().toISOString() },
        { onConflict: 'post_id,recorded_at::date' }
      )

      postsSynced++

      // Queue for classification if not yet classified
      if (!upsertedPost.topic && post.full_caption) {
        unclassifiedPostIds.push({ id: upsertedPost.id, caption: post.full_caption })
      }
    }

    // Classify unclassified posts (fire and forget — don't block response)
    if (unclassifiedPostIds.length > 0) {
      void classifyPostsInBackground(unclassifiedPostIds)
    }

    await supabase
      .from('sync_logs')
      .update({
        status: 'success',
        completed_at: new Date().toISOString(),
        posts_synced: postsSynced,
      })
      .eq('id', syncLogId)

    return Response.json({ success: true, posts_synced: postsSynced })
  } catch (err) {
    console.error('Instagram sync error:', err)
    await supabase
      .from('sync_logs')
      .update({
        status: 'error',
        completed_at: new Date().toISOString(),
        error_message: String(err),
      })
      .eq('id', syncLogId)

    return Response.json({ error: String(err) }, { status: 500 })
  }
}

async function classifyPostsInBackground(posts: { id: string; caption: string }[]) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  for (const post of posts) {
    try {
      await fetch(`${baseUrl}/api/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, caption: post.caption }),
      })
      await new Promise((r) => setTimeout(r, 200))
    } catch {
      // Best effort
    }
  }
}
