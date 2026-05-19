'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'

interface WeeklyData {
  week: string
  views: number
  score: number
  posts: number
}

interface EngagementChartProps {
  data: WeeklyData[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-xs">
        <p className="text-white/60 mb-2">{label}</p>
        {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000
              ? `${(entry.value / 1000).toFixed(1)}K`
              : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function WeeklyViewsChart({ data }: EngagementChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="views" name="Views" fill="#F59E0B" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function WeeklyScoreChart({ data }: EngagementChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          name="Avg Score"
          stroke="#F59E0B"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#F59E0B' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface FormatData {
  format: string
  score: number
  views: number
}

export function FormatComparisonChart({ data }: { data: FormatData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 20, bottom: 0, left: 10 }}>
        <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="format"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="score" name="Avg Score" fill="#F59E0B" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface DayData {
  day: string
  score: number
  multiplier: number
}

export function DayOfWeekHeatmap({ data }: { data: DayData[] }) {
  const maxScore = Math.max(...data.map((d) => d.score), 1)

  return (
    <div className="flex gap-2 items-end h-[120px]">
      {data.map((d) => {
        const height = Math.max((d.score / maxScore) * 100, 4)
        const isStrong = d.multiplier >= 1.5
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={`w-full rounded-sm transition-all ${isStrong ? 'bg-amber-500' : 'bg-white/10'}`}
              style={{ height: `${height}%` }}
              title={`${d.day}: ${d.score}`}
            />
            <span className="text-[10px] text-white/30">{d.day.slice(0, 2)}</span>
          </div>
        )
      })}
    </div>
  )
}
