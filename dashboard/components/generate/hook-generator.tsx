'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Wand2, Copy, RefreshCw } from 'lucide-react'
import { hookTypeLabel } from '@/lib/utils'
import type { HookVariation } from '@/types'

const TOPICS = ['Krishna/Vishnu', 'Shiva', 'Ramayana', 'Devi/Shakti', 'Mahabharata', 'Vedas/Philosophy', 'Festival', 'General']

export function HookGenerator() {
  const [topic, setTopic] = useState('')
  const [angle, setAngle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HookVariation[]>([])
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    if (!topic || !angle) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, angle }),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const hookColors: Record<string, string> = {
    myth_buster: 'text-amber-400 border-amber-400/30 bg-amber-400/5',
    common_belief: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
    scene_setter: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
    character_lead: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
    declarative: 'text-rose-400 border-rose-400/30 bg-rose-400/5',
    default: 'text-white/40 border-white/10',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-2 bg-[#111111] border-white/5">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-medium text-white">Hook Settings</h3>

          <div className="space-y-2">
            <Label className="text-xs text-white/50">Topic *</Label>
            <Select value={topic} onValueChange={(v) => v && setTopic(v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                <SelectValue placeholder="Choose topic…" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {TOPICS.map((t) => (
                  <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-white/50">Story angle *</Label>
            <Input
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              placeholder="e.g. Why Shiva is not angry — he is grief"
              className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20"
            />
          </div>

          <Button
            onClick={generate}
            disabled={!topic || !angle || loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-medium gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {loading ? 'Generating…' : 'Generate 5 Hooks'}
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-3 space-y-3">
        {error && (
          <Card className="bg-red-950/30 border-red-500/20">
            <CardContent className="p-4 text-sm text-red-300">{error}</CardContent>
          </Card>
        )}

        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="bg-[#111111] border-white/5">
                <CardContent className="p-4">
                  <Skeleton className="h-3 w-24 mb-2 bg-white/10" />
                  <Skeleton className="h-4 w-full bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {result.length > 0 && !loading && result.map((h, i) => (
          <Card key={i} className="bg-[#111111] border-white/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge
                      variant="outline"
                      className={`text-xs ${hookColors[h.hook_type] || hookColors.default}`}
                    >
                      {hookTypeLabel(h.hook_type)}
                    </Badge>
                    {h.avg_score > 0 && (
                      <span className="text-xs text-white/30">avg score: {h.avg_score}</span>
                    )}
                  </div>
                  <p className="text-sm text-white/90 font-medium">&ldquo;{h.hook}&rdquo;</p>
                  {h.reasoning && (
                    <p className="text-xs text-white/30 mt-1.5 italic">{h.reasoning}</p>
                  )}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(h.hook)}
                  className="text-white/20 hover:text-white/60 transition-colors shrink-0 mt-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}

        {result.length === 0 && !loading && !error && (
          <Card className="bg-[#111111] border-white/5">
            <CardContent className="py-16 text-center text-white/20 text-sm">
              Enter a topic and angle, then generate 5 hook variations
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
