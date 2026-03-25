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
import type { FormatData } from "@/lib/types"

interface Props {
  data: FormatData[]
}

export function FormatComparisonChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Format: Avg Engagement Score</CardTitle>
      </CardHeader>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
            <XAxis
              dataKey="format"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip formatter={(v) => [v.toFixed(2), "Avg Score"]} />}
              cursor={{ fill: "#1f1f1f" }}
            />
            <Bar dataKey="avgScore" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <rect
                  key={index}
                  fill={entry.format === "Carousel" ? "#F59E0B" : "#EA580C"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex gap-4 text-xs text-zinc-500">
        {data.map((d) => (
          <span key={d.format}>
            {d.format}: <span className="text-zinc-300">{d.avgScore.toFixed(1)}</span> score •{" "}
            <span className="text-zinc-400">{d.postCount} posts</span>
          </span>
        ))}
      </div>
    </Card>
  )
}
