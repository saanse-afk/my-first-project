"use client"

import { formatNumber } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { TopicStats } from "@/lib/types"

interface Props {
  topics: TopicStats[]
}

export function TopicPerformance({ topics }: Props) {
  if (!topics.length) return null

  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-100 mb-3">Topic Performance</h2>
      <div className="rounded-xl border border-[#1F1F1F] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1F1F1F] bg-[#0D0D0D]">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Topic</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Posts</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Avg Score</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">vs Baseline</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Avg Views</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Last Posted</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((t, i) => (
              <tr
                key={t.topic}
                className={`border-b border-[#1A1A1A] ${i % 2 === 0 ? "bg-[#0D0D0D]" : "bg-[#111111]"}`}
              >
                <td className="px-4 py-3 text-zinc-200 font-medium text-sm">{t.topic}</td>
                <td className="px-4 py-3 text-right text-zinc-400 text-xs tabular-nums">{t.postCount}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`tabular-nums text-sm font-semibold ${t.avgScore > 15 ? "text-amber-400" : t.avgScore > 8 ? "text-zinc-200" : "text-zinc-500"}`}>
                    {t.avgScore.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Badge variant={t.baselineMultiplier >= 1.2 ? "amber" : t.baselineMultiplier >= 0.8 ? "gray" : "red"}>
                    {t.baselineMultiplier >= 1 ? "+" : ""}{((t.baselineMultiplier - 1) * 100).toFixed(0)}%
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right text-zinc-400 text-xs tabular-nums">{formatNumber(t.avgViews)}</td>
                <td className="px-4 py-3 text-right text-zinc-500 text-xs">
                  {t.lastPosted
                    ? new Date(t.lastPosted).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
