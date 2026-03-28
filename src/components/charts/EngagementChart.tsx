'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { InstagramMetric } from '@/types'

interface EngagementChartProps {
  data: InstagramMetric[]
}

export function EngagementChart({ data }: EngagementChartProps) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center rounded-lg border text-muted-foreground text-sm">
        No data yet — click Refresh to fetch
      </div>
    )
  }

  const chartData = data.map((d) => ({
    date: d.date,
    reach: d.reach ?? 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="reach" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
