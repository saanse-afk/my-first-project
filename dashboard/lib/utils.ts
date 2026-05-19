import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatScore(score: number | null | undefined): string {
  if (score == null) return '—'
  return score.toFixed(2)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return formatDate(dateStr)
}

export function truncate(str: string | null | undefined, maxLen: number): string {
  if (!str) return ''
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}

export function postTypeLabel(postType: string | null): string {
  const labels: Record<string, string> = {
    VIDEO: 'Reel',
    CAROUSEL_ALBUM: 'Carousel',
    IMAGE: 'Image',
    YOUTUBE_SHORT: 'YT Short',
    YOUTUBE_LONG: 'YT Video',
  }
  return labels[postType || ''] || postType || 'Unknown'
}

export function hookTypeLabel(hookType: string | null): string {
  const labels: Record<string, string> = {
    myth_buster: 'Myth Buster',
    declarative: 'Declarative',
    scene_setter: 'Scene Setter',
    character_lead: 'Character Lead',
    common_belief: 'Common Belief',
    name_first: 'Name First',
    timely_intro: 'Timely Intro',
    question: 'Question',
  }
  return labels[hookType || ''] || hookType || 'Unknown'
}

export function getDayOfWeek(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date(dateStr).getDay()]
}

export function getLast30DaysPosts<T extends { published_at: string }>(posts: T[]): T[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  return posts.filter((p) => new Date(p.published_at) >= cutoff)
}

export function groupByWeek<T extends { published_at: string }>(
  posts: T[]
): { week: string; posts: T[] }[] {
  const groups = new Map<string, T[]>()
  for (const post of posts) {
    const d = new Date(post.published_at)
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const key = monday.toISOString().slice(0, 10)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(post)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, posts]) => ({ week, posts }))
}
