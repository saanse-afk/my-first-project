"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "./chart-tooltip"
import type { WeeklyData } from "@/lib/types"

interface Props {
  data: WeeklyData[]
}

export function EngagementChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: d.week.slice(5),
  }))

  const avg = data.length > 0
    ? data.reduce((s, d) => s + d.avgScore, 0) / data.length
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Avg Engagement Score</CardTitle>
      </CardHeader>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
            <XAxis
              dataKey="label"
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
              content={<ChartTooltip formatter={(v) => [v.toFixed(2), "Score"]} />}
              cursor={{ stroke: "#2a2a2a" }}
            />
            {avg > 0 && (
              <ReferenceLine y={avg} stroke="#3a3a3a" strokeDasharray="4 4" />
            )}
            <Line
              type="monotone"
              dataKey="avgScore"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#F59E0B" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
