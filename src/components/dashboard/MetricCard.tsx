'use client'

import { formatDistanceToNow } from 'date-fns'

interface MetricCardProps {
  title: string
  value: string | number | null
  unit?: string
  lastUpdated: Date | null
  subtitle?: string
}

export function MetricCard({ title, value, unit, lastUpdated, subtitle }: MetricCardProps) {
  const displayValue = value == null ? '—' : `${value}${unit ? ` ${unit}` : ''}`

  let timestampText: string
  if (lastUpdated) {
    timestampText = `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`
  } else {
    timestampText = 'No data yet — click Refresh'
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold mt-2 truncate">{displayValue}</p>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      <p className="text-xs text-muted-foreground mt-3">{timestampText}</p>
    </div>
  )
}
