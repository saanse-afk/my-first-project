'use client'

import Image from 'next/image'
import { InstagramPost, YouTubeVideo } from '@/types'

interface TopContentTableProps {
  platform: 'instagram' | 'youtube'
  items: InstagramPost[] | YouTubeVideo[]
  onSentiment?: (videoId: string) => void
  sentimentData?: Record<string, { positive_pct: number; neutral_pct: number; negative_pct: number; summary: string | null }>
}

export function TopContentTable({ platform, items, onSentiment, sentimentData }: TopContentTableProps) {
  if (!items.length) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No data yet — click Refresh to fetch
      </div>
    )
  }

  if (platform === 'instagram') {
    const posts = items as InstagramPost[]
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="rounded-lg border overflow-hidden bg-card">
            {post.thumbnail_url ? (
              <div className="relative aspect-square bg-muted">
                <Image
                  src={post.thumbnail_url}
                  alt={post.caption?.slice(0, 30) ?? 'Post'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-xs">
                {post.media_type ?? 'Post'}
              </div>
            )}
            <div className="p-3">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {post.caption ?? '—'}
              </p>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                <span>♥ {post.likes?.toLocaleString() ?? 0}</span>
                <span>💬 {post.comments?.toLocaleString() ?? 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const videos = items as YouTubeVideo[]
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium">Video</th>
            <th className="text-right p-3 font-medium">Views</th>
            <th className="text-right p-3 font-medium">Likes</th>
            <th className="text-right p-3 font-medium">Watch hrs</th>
            <th className="text-right p-3 font-medium">CTR</th>
            <th className="text-right p-3 font-medium">Published</th>
            <th className="p-3 font-medium">Sentiment</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {videos.map((video) => {
            const sentiment = sentimentData?.[video.id]
            return (
              <tr key={video.id} className="hover:bg-muted/50">
                <td className="p-3 flex items-center gap-3 max-w-xs">
                  {video.thumbnail_url && (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title ?? 'Video'}
                      width={64}
                      height={36}
                      className="rounded object-cover flex-shrink-0"
                    />
                  )}
                  <span className="line-clamp-2 text-xs">{video.title ?? '—'}</span>
                </td>
                <td className="p-3 text-right">{video.views?.toLocaleString() ?? '—'}</td>
                <td className="p-3 text-right">{video.likes?.toLocaleString() ?? '—'}</td>
                <td className="p-3 text-right">
                  {video.watch_time_hours ? Number(video.watch_time_hours).toFixed(1) : '—'}
                </td>
                <td className="p-3 text-right">
                  {video.ctr ? `${Number(video.ctr).toFixed(1)}%` : '—'}
                </td>
                <td className="p-3 text-right text-xs text-muted-foreground">
                  {video.published_at ? new Date(video.published_at).toLocaleDateString() : '—'}
                </td>
                <td className="p-3">
                  {sentiment ? (
                    <div className="text-xs">
                      <div className="flex gap-1">
                        <span className="text-green-600">+{sentiment.positive_pct}%</span>
                        <span className="text-gray-400">{sentiment.neutral_pct}%</span>
                        <span className="text-red-500">-{sentiment.negative_pct}%</span>
                      </div>
                      {sentiment.summary && (
                        <p className="text-muted-foreground mt-1 line-clamp-1">{sentiment.summary}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onSentiment?.(video.id)}
                      className="text-xs px-2 py-1 rounded border hover:bg-muted transition-colors"
                    >
                      Analyse
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
