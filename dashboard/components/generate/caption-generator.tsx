'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Wand2, Copy, RefreshCw } from 'lucide-react'
import type { CaptionVariation } from '@/types'

const TOPICS = ['Krishna/Vishnu', 'Shiva', 'Ramayana', 'Devi/Shakti', 'Mahabharata', 'Vedas/Philosophy', 'Festival', 'General']

export function CaptionGenerator() {
  const [topic, setTopic] = useState('')
  const [keyMessage, setKeyMessage] = useState('')
  const [hashtagDensity, setHashtagDensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CaptionVariation[]>([])
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    if (!topic || !keyMessage) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, key_message: keyMessage, hashtag_density: hashtagDensity }),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function copyCaption(v: CaptionVariation) {
    const full = `${v.caption}\n\n${v.hashtags.map((h) => `#${h}`).join(' ')}`
    navigator.clipboard.writeText(full)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-2 bg-[#111111] border-white/5">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-medium text-white">Caption Settings</h3>

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
            <Label className="text-xs text-white/50">Key message *</Label>
            <Textarea
              value={keyMessage}
              onChange={(e) => setKeyMessage(e.target.value)}
              placeholder="What's the core story or insight you want to share?"
              rows={3}
              className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-white/50">Hashtag density</Label>
            <Select value={hashtagDensity} onValueChange={(v) => v && setHashtagDensity(v as 'low' | 'medium' | 'high')}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                <SelectItem value="low" className="text-white">Low (~5 hashtags)</SelectItem>
                <SelectItem value="medium" className="text-white">Medium (~15 hashtags)</SelectItem>
                <SelectItem value="high" className="text-white">High (~25 hashtags)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generate}
            disabled={!topic || !keyMessage || loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-medium gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {loading ? 'Generating…' : 'Generate Captions'}
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-3 space-y-4">
        {error && (
          <Card className="bg-red-950/30 border-red-500/20">
            <CardContent className="p-4 text-sm text-red-300">{error}</CardContent>
          </Card>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-[#111111] border-white/5">
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-32 mb-3 bg-white/10" />
                  <Skeleton className="h-24 w-full bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {result.length > 0 && !loading && result.map((v, i) => (
          <Card key={i} className="bg-[#111111] border-white/5">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs text-amber-400 border-amber-400/30">
                    Optimized for {v.optimized_for}
                  </Badge>
                  <span className="text-xs text-white/30">{v.tone}</span>
                </div>
                <button onClick={() => copyCaption(v)} className="text-white/20 hover:text-white/60 transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{v.caption}</p>
              <div className="flex flex-wrap gap-1">
                {v.hashtags?.map((h) => (
                  <span key={h} className="text-xs text-amber-400/60">#{h}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {result.length === 0 && !loading && !error && (
          <Card className="bg-[#111111] border-white/5">
            <CardContent className="py-16 text-center text-white/20 text-sm">
              Fill in topic and message, then click Generate
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
