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
import { formatNumber } from "@/lib/utils"
import type { WeeklyData } from "@/lib/types"

interface Props {
  data: WeeklyData[]
}

export function WeeklyViewsChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: d.week.slice(5), // MM-DD
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Views</CardTitle>
      </CardHeader>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
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
              tickFormatter={formatNumber}
            />
            <Tooltip
              content={<ChartTooltip formatter={(v) => [formatNumber(v), "Views"]} />}
              cursor={{ fill: "#1f1f1f" }}
            />
            <Bar dataKey="views" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
