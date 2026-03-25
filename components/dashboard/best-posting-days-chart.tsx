"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "./chart-tooltip"
import type { DayData } from "@/lib/types"

interface Props {
  data: DayData[]
}

const COLORS = ["#F59E0B", "#F97316", "#EA580C", "#DC2626", "#B91C1C", "#92400E", "#78350F"]

export function BestPostingDaysChart({ data }: Props) {
  const maxScore = Math.max(...data.map((d) => d.avgScore), 0.1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Posting Days</CardTitle>
      </CardHeader>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
            <XAxis
              dataKey="day"
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
              content={
                <ChartTooltip
                  formatter={(v, n) =>
                    n === "avgScore" ? [v.toFixed(2), "Avg Score"] : [v.toString(), "Posts"]
                  }
                />
              }
              cursor={{ fill: "#1f1f1f" }}
            />
            <Bar dataKey="avgScore" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[Math.floor((entry.avgScore / maxScore) * (COLORS.length - 1))]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
