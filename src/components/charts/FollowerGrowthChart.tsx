'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { InstagramMetric } from '@/types'

interface FollowerGrowthChartProps {
  data: InstagramMetric[]
}

export function FollowerGrowthChart({ data }: FollowerGrowthChartProps) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center rounded-lg border text-muted-foreground text-sm">
        No data yet — click Refresh to fetch
      </div>
    )
  }

  const chartData = data.map((d) => ({
    date: d.date,
    followers: d.followers ?? 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="followers" stroke="#6366f1" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
