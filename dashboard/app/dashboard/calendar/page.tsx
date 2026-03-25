import { createServiceClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDaysUntilFestival, getFestivalStatus, getDeityColor } from '@/lib/festivals'
import { formatDate } from '@/lib/utils'
import { CalendarDays, Clock, AlertCircle } from 'lucide-react'
import { FestivalGenerateButton } from '@/components/calendar/festival-generate-button'
import type { Festival } from '@/types'

export default async function CalendarPage() {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('festivals')
    .select('*')
    .gte('date', new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10))
    .order('date')
    .limit(50)

  const festivals: Festival[] = data || []

  const upcoming = festivals.filter((f) => getDaysUntilFestival(f) >= 0)
  const past = festivals.filter((f) => getDaysUntilFestival(f) < 0).slice(0, 5)

  const statusBadge = (festival: Festival) => {
    const status = getFestivalStatus(festival)
    const days = getDaysUntilFestival(festival)
    if (status === 'urgent') return { label: `${days}d — Post NOW`, className: 'text-red-400 border-red-400/30 bg-red-400/5' }
    if (status === 'upcoming') return { label: `${days}d — Prepare`, className: 'text-amber-400 border-amber-400/30 bg-amber-400/5' }
    if (status === 'future') return { label: `${days}d away`, className: 'text-white/40 border-white/10' }
    return { label: 'Past', className: 'text-white/20 border-white/10' }
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Festival Calendar" subtitle="Hindu festival calendar with content timing guidance" />
      <div className="flex-1 p-6 space-y-6 overflow-auto">

        {/* Urgent / action needed */}
        {upcoming.filter((f) => getFestivalStatus(f) === 'urgent').length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-medium text-red-300">Post NOW — Festival approaching</h2>
            </div>
            {upcoming
              .filter((f) => getFestivalStatus(f) === 'urgent')
              .map((f) => (
                <Card key={f.id} className="bg-red-950/20 border-red-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: getDeityColor(f.deity) }}
                          />
                          <p className="text-sm font-semibold text-white">{f.name}</p>
                          <Badge variant="outline" className="text-xs text-red-400 border-red-400/30">
                            {getDaysUntilFestival(f)} days left
                          </Badge>
                        </div>
                        <p className="text-xs text-white/50">{formatDate(f.date)} · {f.deity}</p>
                        {f.content_suggestions && f.content_suggestions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {f.content_suggestions.map((s) => (
                              <span key={s} className="text-xs text-white/40 bg-white/5 rounded px-2 py-0.5">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <FestivalGenerateButton festival={f} />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Upcoming festivals */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-medium text-white">Upcoming Festivals</h2>
          </div>
          <div className="space-y-2">
            {upcoming.map((f) => {
              const badge = statusBadge(f)
              const status = getFestivalStatus(f)
              return (
                <Card
                  key={f.id}
                  className={`border-white/5 ${status === 'upcoming' ? 'bg-amber-950/10 border-amber-500/10' : 'bg-[#111111]'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 mt-1"
                          style={{ backgroundColor: getDeityColor(f.deity) }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 mb-0.5">
                            <p className="text-sm font-medium text-white">{f.name}</p>
                            <Badge variant="outline" className={`text-xs ${badge.className}`}>
                              {badge.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-white/40">
                            {formatDate(f.date)} · {f.deity}
                          </p>
                          {f.content_suggestions && f.content_suggestions.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {f.content_suggestions.slice(0, 3).map((s) => (
                                <span key={s} className="text-xs text-white/30 bg-white/5 rounded px-1.5 py-0.5">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-white/30 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            Start posting {f.days_before_to_post}d before
                          </p>
                        </div>
                        <FestivalGenerateButton festival={f} compact />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Past festivals (recent) */}
        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-white/30 mb-3">Recently Passed</h2>
            <div className="space-y-2">
              {past.map((f) => (
                <Card key={f.id} className="bg-[#0e0e0e] border-white/5 opacity-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white/20 shrink-0" />
                      <p className="text-xs text-white/40">{f.name}</p>
                      <p className="text-xs text-white/20">{formatDate(f.date)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
