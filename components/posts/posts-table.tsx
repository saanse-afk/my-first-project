"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { formatNumber, getScoreBadgeVariant } from "@/lib/utils"
import { usePosts } from "@/lib/use-analytics"
import { EmptyState } from "@/components/layout/empty-state"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { Post } from "@/lib/types"

type SortKey = "published_at" | "views" | "engagement_score" | "likes" | "shares" | "saves"

function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: "asc" | "desc" }) {
  if (col !== sortKey) return <ArrowUpDown size={12} className="text-zinc-600" />
  return dir === "asc" ? <ArrowUp size={12} className="text-amber-400" /> : <ArrowDown size={12} className="text-amber-400" />
}

export function PostsTable() {
  const [format, setFormat] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("published_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const { posts, loading } = usePosts()

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const filtered = posts.filter((p) => {
    if (format === "video") return p.post_type === "VIDEO"
    if (format === "carousel") return p.post_type === "CAROUSEL_ALBUM"
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a[sortKey] ?? 0) as number | string
    const bVal = (b[sortKey] ?? 0) as number | string
    const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number)
    return sortDir === "asc" ? cmp : -cmp
  })

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-zinc-900 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!posts.length) return <EmptyState />

  const cols: { key: SortKey; label: string; align?: string }[] = [
    { key: "published_at", label: "Date" },
    { key: "views", label: "Views", align: "right" },
    { key: "likes", label: "Likes", align: "right" },
    { key: "shares", label: "Shares", align: "right" },
    { key: "saves", label: "Saves", align: "right" },
    { key: "engagement_score", label: "Score", align: "right" },
  ]

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <Select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          options={[
            { value: "all", label: "All formats" },
            { value: "video", label: "Video only" },
            { value: "carousel", label: "Carousel only" },
          ]}
        />
        <span className="text-sm text-zinc-500">{sorted.length} posts</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#1F1F1F] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1F1F1F] bg-[#0D0D0D]">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Type
                </th>
                {cols.map((c) => (
                  <th
                    key={c.key}
                    className={`px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors ${c.align === "right" ? "text-right" : "text-left"}`}
                    onClick={() => toggleSort(c.key)}
                  >
                    <div className={`flex items-center gap-1 ${c.align === "right" ? "justify-end" : ""}`}>
                      {c.label}
                      <SortIcon col={c.key} sortKey={sortKey} dir={sortDir} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((post, i) => (
                <PostRow key={post.id} post={post} even={i % 2 === 0} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PostRow({ post, even }: { post: Post; even: boolean }) {
  const score = post.engagement_score ?? 0
  return (
    <tr className={`border-b border-[#1A1A1A] ${even ? "bg-[#0D0D0D]" : "bg-[#111111]"} hover:bg-zinc-900/50 transition-colors`}>
      <td className="px-4 py-3 max-w-[240px]">
        <p className="text-zinc-200 text-xs truncate">{post.title || post.full_caption || "—"}</p>
        {post.topic && <p className="text-zinc-600 text-xs mt-0.5">{post.topic}</p>}
      </td>
      <td className="px-4 py-3">
        <Badge variant={post.post_type === "CAROUSEL_ALBUM" ? "amber" : "gray"}>
          {post.post_type === "CAROUSEL_ALBUM" ? "Carousel" : "Video"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right text-zinc-400 text-xs">
        {post.published_at ? new Date(post.published_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}
      </td>
      <td className="px-4 py-3 text-right text-zinc-300 text-xs tabular-nums">{formatNumber(post.views)}</td>
      <td className="px-4 py-3 text-right text-zinc-400 text-xs tabular-nums">{formatNumber(post.likes)}</td>
      <td className="px-4 py-3 text-right text-zinc-400 text-xs tabular-nums">{formatNumber(post.shares)}</td>
      <td className="px-4 py-3 text-right text-zinc-400 text-xs tabular-nums">{formatNumber(post.saves)}</td>
      <td className="px-4 py-3 text-right">
        <Badge variant={getScoreBadgeVariant(score)}>{score.toFixed(1)}</Badge>
      </td>
    </tr>
  )
}
