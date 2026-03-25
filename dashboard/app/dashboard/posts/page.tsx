import { createServiceClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getLatestMetrics } from '@/lib/scoring'
import { formatNumber, formatScore, formatDate, postTypeLabel, hookTypeLabel } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import type { PostWithMetrics } from '@/types'

export default async function PostsPage() {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('posts')
    .select(`*, post_metrics(*)`)
    .order('published_at', { ascending: false })
    .limit(200)

  const posts: PostWithMetrics[] = (data || []).map((p) => ({
    ...p,
    latest_metrics: p.post_metrics?.sort(
      (a: { recorded_at: string }, b: { recorded_at: string }) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    )[0] ?? null,
  }))

  const formatBadgeClass = (type: string | null) => {
    if (type === 'CAROUSEL_ALBUM') return 'text-amber-400 border-amber-400/30 bg-amber-400/5'
    if (type === 'VIDEO') return 'text-purple-400 border-purple-400/30 bg-purple-400/5'
    return 'text-white/40 border-white/10'
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Posts" subtitle={`${posts.length} posts across all platforms`} showSync />
      <div className="flex-1 p-6 overflow-auto">
        <Card className="bg-[#111111] border-white/5">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs text-white/30 font-normal px-4 py-3">Post</th>
                    <th className="text-left text-xs text-white/30 font-normal px-4 py-3">Format</th>
                    <th className="text-left text-xs text-white/30 font-normal px-4 py-3">Topic</th>
                    <th className="text-left text-xs text-white/30 font-normal px-4 py-3">Hook</th>
                    <th className="text-right text-xs text-white/30 font-normal px-4 py-3">Score</th>
                    <th className="text-right text-xs text-white/30 font-normal px-4 py-3">Views</th>
                    <th className="text-right text-xs text-white/30 font-normal px-4 py-3">Likes</th>
                    <th className="text-right text-xs text-white/30 font-normal px-4 py-3">Saves</th>
                    <th className="text-right text-xs text-white/30 font-normal px-4 py-3">Shares</th>
                    <th className="text-right text-xs text-white/30 font-normal px-4 py-3">Date</th>
                    <th className="text-right text-xs text-white/30 font-normal px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const m = getLatestMetrics(post)
                    return (
                      <tr key={post.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-white/80 truncate text-xs font-medium">{post.title || '(no caption)'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${formatBadgeClass(post.post_type)}`}>
                            {postTypeLabel(post.post_type)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/50">{post.topic || '—'}</td>
                        <td className="px-4 py-3 text-xs text-white/40">{hookTypeLabel(post.hook_type)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${(m?.engagement_score || 0) >= 20 ? 'text-amber-400' : 'text-white/70'}`}>
                            {formatScore(m?.engagement_score)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-white/50">{formatNumber(m?.views || 0)}</td>
                        <td className="px-4 py-3 text-right text-xs text-white/50">{formatNumber(m?.likes || 0)}</td>
                        <td className="px-4 py-3 text-right text-xs text-white/50">{formatNumber(m?.saves || 0)}</td>
                        <td className="px-4 py-3 text-right text-xs text-white/50">{formatNumber(m?.shares || 0)}</td>
                        <td className="px-4 py-3 text-right text-xs text-white/30">{formatDate(post.published_at)}</td>
                        <td className="px-4 py-3 text-right">
                          {post.permalink && (
                            <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-amber-400 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {posts.length === 0 && (
                <div className="py-16 text-center text-white/30 text-sm">
                  No posts yet. Connect Instagram in Settings and run a sync.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
