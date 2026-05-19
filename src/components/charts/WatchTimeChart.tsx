'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { YouTubeMetric } from '@/types'

interface WatchTimeChartProps {
  data: YouTubeMetric[]
}

export function WatchTimeChart({ data }: WatchTimeChartProps) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center rounded-lg border text-muted-foreground text-sm">
        No data yet — click Refresh to fetch
      </div>
    )
  }

  const chartData = data.map((d) => ({
    date: d.date,
    watch_time: Number(d.watch_time_hours ?? 0).toFixed(1),
  }))

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="watch_time" stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
