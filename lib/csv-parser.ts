import Papa from "papaparse"
import type { CSVRow, Post } from "./types"

export function calculateEngagementScore(
  views: number,
  likes: number,
  comments: number,
  shares: number,
  saves: number
): number {
  if (!views || views === 0) return 0
  return ((likes * 1 + comments * 3 + shares * 5 + saves * 4) / views) * 100
}

export function parseCSV(csvText: string): Omit<Post, "id" | "created_at" | "topic" | "content_type" | "hook_type">[] {
  const result = Papa.parse<CSVRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  })

  if (result.errors && result.errors.length > 0) {
    console.warn("CSV parse warnings:", result.errors)
  }

  const posts: Omit<Post, "id" | "created_at" | "topic" | "content_type" | "hook_type">[] = []

  for (const row of (result.data as CSVRow[])) {
    const postId = row["Post ID"] || row["ID"]
    if (!postId) continue

    const views = parseInt(row["Views"] || "0", 10) || 0
    const likes = parseInt(row["Likes"] || "0", 10) || 0
    const comments = parseInt(row["Comments"] || "0", 10) || 0
    const shares = parseInt(row["Shares"] || "0", 10) || 0
    const saves = parseInt(row["Saves"] || "0", 10) || 0

    const engagement_score = calculateEngagementScore(views, likes, comments, shares, saves)

    // Parse date
    let published_at: string | null = null
    const rawDate = row["Post Date"]
    if (rawDate) {
      try {
        const d = new Date(rawDate)
        if (!isNaN(d.getTime())) {
          published_at = d.toISOString().split("T")[0]
        }
      } catch {
        published_at = null
      }
    }

    posts.push({
      platform_post_id: postId.trim(),
      title: row["Post Title"] || row["Post Name"] || null,
      full_caption: row["Post Name"] || null,
      post_type: (row["Post Type"] || "").toUpperCase().trim(),
      published_at,
      views,
      likes,
      comments,
      shares,
      saves,
      engagement_score: parseFloat(engagement_score.toFixed(4)),
    })
  }

  return posts
}

export function deduplicatePosts<T extends { platform_post_id: string }>(posts: T[]): T[] {
  const seen = new Set<string>()
  return posts.filter((p) => {
    if (seen.has(p.platform_post_id)) return false
    seen.add(p.platform_post_id)
    return true
  })
}
