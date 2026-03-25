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
import { ChartTooltip } from "@/components/dashboard/chart-tooltip"
import type { HookData } from "@/lib/types"

interface Props {
  data: HookData[]
}

const COLORS = ["#F59E0B", "#F97316", "#EA580C", "#DC2626", "#B45309", "#78350F"]

export function HookAnalysis({ data }: Props) {
  if (!data.length) return null

  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-100 mb-3">Hook Style Performance</h2>
      <Card>
        <CardHeader>
          <CardTitle>Avg Engagement Score by Hook Style</CardTitle>
          <span className="text-xs text-zinc-600">min. 2 posts per style</span>
        </CardHeader>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
              <XAxis
                dataKey="hook_type"
                tick={{ fill: "#71717a", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
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
              <Bar dataKey="avgScore" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {data.map((d, i) => (
            <div key={d.hook_type} className="flex items-center gap-1.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-zinc-400">{d.hook_type}</span>
              <span className="text-zinc-600">({d.postCount})</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
