"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "./chart-tooltip"
import type { Post } from "@/lib/types"

interface Props {
  posts: Post[]
}

export function TopPostsChart({ posts }: Props) {
  const top10 = [...posts]
    .filter((p) => p.engagement_score !== null)
    .sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0))
    .slice(0, 10)
    .map((p) => ({
      label: (p.title || p.full_caption || "Untitled").slice(0, 30),
      score: p.engagement_score || 0,
      type: p.post_type,
    }))
    .reverse()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Posts by Engagement Score</CardTitle>
      </CardHeader>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={top10}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={150}
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip formatter={(v) => [v.toFixed(2), "Score"]} />}
              cursor={{ fill: "#1a1a1a" }}
            />
            <Bar dataKey="score" fill="#F59E0B" radius={[0, 4, 4, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
