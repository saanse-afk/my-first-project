import { query } from './db'

const GRAPH_BASE = 'https://graph.instagram.com'

export interface InstagramAccount {
  id: string
  username: string
  name: string | null
  access_token: string
  token_expires_at: Date | null
}

export interface InstagramProfileMetrics {
  followers_count: number
  follows_count: number
  media_count: number
}

export interface InstagramInsights {
  reach: number
  impressions: number
  profile_visits: number
  website_clicks: number
}

export interface InstagramPost {
  id: string
  media_type: string
  thumbnail_url: string | null
  caption: string | null
  like_count: number
  comments_count: number
  timestamp: string
}

async function refreshTokenIfNeeded(account: InstagramAccount): Promise<string> {
  const now = new Date()
  const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)

  if (!account.token_expires_at || account.token_expires_at <= tenDaysFromNow) {
    console.log(`[instagram] Refreshing token for account ${account.id}`)
    const url = `${GRAPH_BASE}/refresh_access_token?grant_type=ig_refresh_token&access_token=${account.access_token}`
    const res = await fetch(url)
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Token refresh failed for account ${account.id}: ${body}`)
    }
    const data = await res.json() as { access_token: string; expires_in: number }
    const newExpiry = new Date(now.getTime() + data.expires_in * 1000)
    await query(
      'UPDATE instagram_accounts SET access_token = $1, token_expires_at = $2 WHERE id = $3',
      [data.access_token, newExpiry, account.id]
    )
    return data.access_token
  }

  return account.access_token
}

export async function getInstagramAccounts(): Promise<InstagramAccount[]> {
  const result = await query<InstagramAccount>(
    'SELECT id, username, name, access_token, token_expires_at FROM instagram_accounts'
  )
  return result.rows
}

export async function fetchProfileMetrics(account: InstagramAccount): Promise<InstagramProfileMetrics> {
  const token = await refreshTokenIfNeeded(account)
  const url = `${GRAPH_BASE}/${account.id}?fields=followers_count,follows_count,media_count&access_token=${token}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Profile metrics fetch failed for ${account.id}: ${body}`)
  }
  const data = await res.json() as InstagramProfileMetrics
  return data
}

export async function fetchInsights(account: InstagramAccount): Promise<InstagramInsights> {
  const token = await refreshTokenIfNeeded(account)
  const url = `${GRAPH_BASE}/${account.id}/insights?metric=reach,impressions,profile_views,website_clicks&period=day&access_token=${token}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Insights fetch failed for ${account.id}: ${body}`)
  }
  const data = await res.json() as {
    data: Array<{ name: string; values: Array<{ value: number }> }>
  }

  const getValue = (name: string): number => {
    const metric = data.data.find((m) => m.name === name)
    if (!metric || !metric.values.length) return 0
    // sum last day's values
    return metric.values[metric.values.length - 1]?.value ?? 0
  }

  return {
    reach: getValue('reach'),
    impressions: getValue('impressions'),
    profile_visits: getValue('profile_views'),
    website_clicks: getValue('website_clicks'),
  }
}

export async function fetchTopPosts(account: InstagramAccount): Promise<InstagramPost[]> {
  const token = await refreshTokenIfNeeded(account)
  const url = `${GRAPH_BASE}/${account.id}/media?fields=id,media_type,thumbnail_url,caption,like_count,comments_count,timestamp&limit=12&access_token=${token}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Top posts fetch failed for ${account.id}: ${body}`)
  }
  const data = await res.json() as { data: InstagramPost[] }
  return data.data ?? []
}

export function initAccountsFromEnv(): Array<{ id: string; access_token: string }> {
  const ids = (process.env.INSTAGRAM_ACCOUNT_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const tokens = (process.env.INSTAGRAM_ACCESS_TOKENS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  return ids.map((id, i) => ({ id, access_token: tokens[i] ?? '' }))
}
