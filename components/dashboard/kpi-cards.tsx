"use client"

import { Card } from "@/components/ui/card"
import { formatNumber, formatScore } from "@/lib/utils"
import { Eye, TrendingUp, Flame, LayoutGrid } from "lucide-react"
import type { KPIData } from "@/lib/types"

interface KPICardsProps {
  data: KPIData
}

export function KPICards({ data }: KPICardsProps) {
  const cards = [
    {
      label: "Total Reach",
      value: formatNumber(data.totalReach),
      icon: Eye,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Avg Engagement Score",
      value: formatScore(data.avgEngagementScore),
      icon: TrendingUp,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      label: "Viral Posts (100K+)",
      value: data.viralPosts.toString(),
      icon: Flame,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
    {
      label: "Total Posts",
      value: data.totalPosts.toString(),
      icon: LayoutGrid,
      color: "text-zinc-300",
      bg: "bg-zinc-400/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <Card key={c.label} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{c.label}</span>
              <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                <Icon size={15} className={c.color} />
              </div>
            </div>
            <div className={`text-3xl font-semibold ${c.color}`}>{c.value}</div>
          </Card>
        )
      })}
    </div>
  )
}
