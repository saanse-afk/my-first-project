'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { hookTypeLabel, postTypeLabel } from '@/lib/utils'
import type { ContentRecommendation } from '@/types'

export function InsightsGenerateButton() {
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setRecommendations(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">This Week&apos;s Content Plan</h2>
          <p className="text-xs text-white/40 mt-0.5">AI-generated recommendations based on your channel&apos;s performance data</p>
        </div>
        <Button
          onClick={generate}
          disabled={loading}
          className="gap-2 bg-amber-500 hover:bg-amber-400 text-black font-medium"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generating…' : 'Generate This Week\'s Plan'}
        </Button>
      </div>

      {error && (
        <Card className="bg-red-950/30 border-red-500/20">
          <CardContent className="p-4 text-sm text-red-300">{error}</CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <Card key={i} className="bg-[#111111] border-white/5 overflow-hidden">
              <button
                className="w-full text-left p-4"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {rec.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-white">{rec.topic}</p>
                        <Badge variant="outline" className="text-xs text-amber-400 border-amber-400/30">
                          {rec.format === 'reel' ? 'Reel' : 'Carousel'}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-white/40 border-white/10">
                          {hookTypeLabel(rec.hook_type)}
                        </Badge>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5 truncate">{rec.story_angle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-emerald-400 font-medium">{rec.predicted_engagement}</p>
                      <p className="text-xs text-white/30">{rec.best_day}</p>
                    </div>
                    {expanded === i ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                  </div>
                </div>
              </button>

              {expanded === i && (
                <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                  {rec.suggested_opening && (
                    <div>
                      <p className="text-xs text-white/30 mb-1">Suggested opening</p>
                      <p className="text-sm text-white/80 italic">&ldquo;{rec.suggested_opening}&rdquo;</p>
                    </div>
                  )}
                  {rec.festival_connection && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-400/70">Festival:</span>
                      <span className="text-xs text-white/60">{rec.festival_connection}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-white/30 mb-1">Why this works</p>
                    <p className="text-xs text-white/60">{rec.data_reasoning}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <span>Best time: {rec.best_time}</span>
                    <span>·</span>
                    <span>Post on {rec.best_day}</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
