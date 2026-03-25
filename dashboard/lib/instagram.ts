import { calculateEngagementScore } from './scoring'

const IG_API_BASE = 'https://graph.instagram.com/v21.0'

export interface IGMediaItem {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  timestamp: string
  permalink: string
  thumbnail_url?: string
  like_count?: number
  comments_count?: number
}

export interface IGInsights {
  reach: number
  impressions: number
  likes: number
  comments: number
  shares: number
  saves: number
  plays: number
  total_interactions: number
}

export interface IGPostData {
  media: IGMediaItem
  insights: IGInsights
}

async function igFetch(path: string, accessToken: string) {
  const url = `${IG_API_BASE}${path}${path.includes('?') ? '&' : '?'}access_token=${accessToken}`
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Instagram API error [${res.status}]: ${err}`)
  }
  return res.json()
}

/**
 * Fetch all media IDs for an account (paginated).
 * On first sync fetches everything; subsequent calls can be filtered by since param.
 */
export async function fetchAllMediaIds(
  accountId: string,
  accessToken: string,
  since?: string
): Promise<string[]> {
  const ids: string[] = []
  let cursor: string | null = null
  let path = `/${accountId}/media?fields=id,timestamp&limit=100`
  if (since) path += `&since=${since}`

  do {
    const cursorParam = cursor ? `&after=${cursor}` : ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await igFetch(path + cursorParam, accessToken)
    if (data.data) ids.push(...data.data.map((m: { id: string }) => m.id))
    cursor = data.paging?.cursors?.after && data.paging?.next ? data.paging.cursors.after : null
  } while (cursor)

  return ids
}

/**
 * Fetch full details for a single media item.
 */
export async function fetchMediaDetails(
  mediaId: string,
  accessToken: string
): Promise<IGMediaItem> {
  const fields =
    'id,caption,media_type,timestamp,permalink,thumbnail_url,like_count,comments_count'
  return igFetch(`/${mediaId}?fields=${fields}`, accessToken)
}

/**
 * Fetch insights for a single media item.
 */
export async function fetchMediaInsights(
  mediaId: string,
  mediaType: string,
  accessToken: string
): Promise<IGInsights> {
  let metrics: string
  if (mediaType === 'VIDEO') {
    metrics = 'plays,reach,likes,comments,shares,saved,total_interactions'
  } else if (mediaType === 'CAROUSEL_ALBUM') {
    metrics = 'reach,impressions,carousel_album_reach,carousel_album_impressions,saves,likes,comments'
  } else {
    metrics = 'reach,impressions,likes,comments,saved'
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await igFetch(`/${mediaId}/insights?metric=${metrics}`, accessToken)
    const result: IGInsights = {
      reach: 0,
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      plays: 0,
      total_interactions: 0,
    }

    if (data.data) {
      for (const item of data.data) {
        const name = item.name?.replace('carousel_album_', '')
        const val = item.values?.[0]?.value ?? item.value ?? 0
        if (name === 'reach') result.reach = val
        else if (name === 'impressions') result.impressions = val
        else if (name === 'likes') result.likes = val
        else if (name === 'comments') result.comments = val
        else if (name === 'shares') result.shares = val
        else if (name === 'saved' || name === 'saves') result.saves = val
        else if (name === 'plays') result.plays = val
        else if (name === 'total_interactions') result.total_interactions = val
      }
    }
    return result
  } catch {
    // Insights unavailable for some posts — return zeros
    return { reach: 0, impressions: 0, likes: 0, comments: 0, shares: 0, saves: 0, plays: 0, total_interactions: 0 }
  }
}

/**
 * Refresh a long-lived Instagram access token.
 * Should be called when token is within 10 days of expiry (60-day tokens).
 */
export async function refreshLongLivedToken(
  accessToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`)
  return res.json()
}

/**
 * Get account info (followers, name).
 */
export async function fetchAccountInfo(
  accountId: string,
  accessToken: string
): Promise<{ followers_count: number; username: string }> {
  return igFetch(`/${accountId}?fields=followers_count,username`, accessToken)
}

/**
 * Build the full post + computed metrics object ready to upsert into Supabase.
 */
export function buildPostRecord(
  socialAccountId: string,
  media: IGMediaItem,
  insights: IGInsights
) {
  const views = insights.plays || insights.reach || 0
  const engagementScore = calculateEngagementScore({
    likes: insights.likes,
    comments: insights.comments,
    shares: insights.shares,
    saves: insights.saves,
    views,
  })

  const post = {
    social_account_id: socialAccountId,
    platform_post_id: media.id,
    title: media.caption ? media.caption.slice(0, 120) : null,
    full_caption: media.caption || null,
    post_type: media.media_type,
    published_at: media.timestamp,
    permalink: media.permalink || null,
    thumbnail_url: media.thumbnail_url || null,
  }

  const metrics = {
    views,
    likes: insights.likes,
    comments: insights.comments,
    shares: insights.shares,
    saves: insights.saves,
    reach: insights.reach,
    impressions: insights.impressions,
    engagement_score: engagementScore,
  }

  return { post, metrics }
}

/**
 * Batch fetch details + insights with rate-limit-aware concurrency (5 at a time).
 */
export async function fetchPostsBatch(
  mediaIds: string[],
  accessToken: string
): Promise<IGPostData[]> {
  const results: IGPostData[] = []
  const BATCH_SIZE = 5

  for (let i = 0; i < mediaIds.length; i += BATCH_SIZE) {
    const batch = mediaIds.slice(i, i + BATCH_SIZE)
    const settled = await Promise.allSettled(
      batch.map(async (id) => {
        const media = await fetchMediaDetails(id, accessToken)
        const insights = await fetchMediaInsights(id, media.media_type, accessToken)
        return { media, insights }
      })
    )
    for (const result of settled) {
      if (result.status === 'fulfilled') results.push(result.value)
    }
    // Brief pause between batches to respect rate limits
    if (i + BATCH_SIZE < mediaIds.length) {
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  return results
}
