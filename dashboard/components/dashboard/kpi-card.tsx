import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  loading?: boolean
  accent?: boolean
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, loading, accent }: KpiCardProps) {
  if (loading) {
    return (
      <Card className="bg-[#111111] border-white/5">
        <CardContent className="p-5">
          <Skeleton className="h-4 w-24 mb-3 bg-white/10" />
          <Skeleton className="h-8 w-32 mb-1 bg-white/10" />
          <Skeleton className="h-3 w-20 bg-white/10" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-white/5', accent ? 'bg-amber-500/5 border-amber-500/20' : 'bg-[#111111]')}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm text-white/50">{title}</p>
          <div className={cn('p-1.5 rounded-md', accent ? 'bg-amber-500/20' : 'bg-white/5')}>
            <Icon className={cn('w-3.5 h-3.5', accent ? 'text-amber-400' : 'text-white/40')} />
          </div>
        </div>
        <p className={cn('text-2xl font-semibold', accent ? 'text-amber-400' : 'text-white')}>{value}</p>
        {subtitle && <p className="text-xs text-white/30 mt-1">{subtitle}</p>}
        {trend && (
          <p className={cn('text-xs mt-2 font-medium', trend.value >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
