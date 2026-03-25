'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Wand2, Copy, RefreshCw } from 'lucide-react'
import type { GenerateScriptOutput } from '@/types'

const TOPICS = ['Krishna/Vishnu', 'Shiva', 'Ramayana', 'Devi/Shakti', 'Mahabharata', 'Vedas/Philosophy', 'Festival', 'General']
const TONES = ['Reverent and quiet', 'Dramatic', 'Poetic', 'Conversational', 'Mysterious']

export function ScriptGenerator() {
  const [topic, setTopic] = useState('')
  const [subTopic, setSubTopic] = useState('')
  const [duration, setDuration] = useState<'30' | '60' | '90'>('60')
  const [tone, setTone] = useState('Reverent and quiet')
  const [format, setFormat] = useState<'reel' | 'carousel'>('reel')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateScriptOutput | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    if (!topic) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, subTopic, duration: parseInt(duration), tone, format, platform: 'instagram' }),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Input panel */}
      <Card className="lg:col-span-2 bg-[#111111] border-white/5">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-medium text-white">Script Settings</h3>

          <div className="space-y-2">
            <Label className="text-xs text-white/50">Topic *</Label>
            <Select value={topic} onValueChange={(v) => v && setTopic(v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                <SelectValue placeholder="Choose topic…" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {TOPICS.map((t) => (
                  <SelectItem key={t} value={t} className="text-white hover:bg-white/5">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-white/50">Specific angle / sub-topic</Label>
            <Input
              value={subTopic}
              onChange={(e) => setSubTopic(e.target.value)}
              placeholder="e.g. Sudama visiting Dwaraka"
              className="bg-white/5 border-white/10 text-white text-sm placeholder:text-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-white/50">Duration</Label>
              <Select value={duration} onValueChange={(v) => v && setDuration(v as '30' | '60' | '90')}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  <SelectItem value="30" className="text-white">30s</SelectItem>
                  <SelectItem value="60" className="text-white">60s</SelectItem>
                  <SelectItem value="90" className="text-white">90s</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/50">Format</Label>
              <Select value={format} onValueChange={(v) => v && setFormat(v as 'reel' | 'carousel')}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  <SelectItem value="reel" className="text-white">Reel</SelectItem>
                  <SelectItem value="carousel" className="text-white">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-white/50">Tone</Label>
            <Select value={tone} onValueChange={(v) => v && setTone(v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {TONES.map((t) => (
                  <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generate}
            disabled={!topic || loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-medium gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {loading ? 'Generating…' : 'Generate Script'}
          </Button>
          {result && !loading && (
            <Button onClick={generate} variant="outline" className="w-full text-white/50 border-white/10 hover:bg-white/5 gap-2 bg-transparent">
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Output panel */}
      <div className="lg:col-span-3 space-y-4">
        {error && (
          <Card className="bg-red-950/30 border-red-500/20">
            <CardContent className="p-4 text-sm text-red-300">{error}</CardContent>
          </Card>
        )}

        {loading && (
          <Card className="bg-[#111111] border-white/5">
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-16 w-full bg-white/10" />
              <Skeleton className="h-4 w-24 bg-white/10 mt-3" />
              <Skeleton className="h-32 w-full bg-white/10" />
            </CardContent>
          </Card>
        )}

        {result && !loading && (
          <Card className="bg-[#111111] border-white/5">
            <CardContent className="p-5 space-y-5">
              {[
                { label: 'HOOK (first 3 seconds)', value: result.hook },
                { label: 'BODY (main story)', value: result.body },
                { label: 'CTA (closing)', value: result.cta },
                { label: 'MUSIC MOOD', value: result.music_mood },
              ].map(({ label, value }) => value && (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">{label}</p>
                    <button onClick={() => copyToClipboard(value)} className="text-white/20 hover:text-white/60 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{value}</p>
                </div>
              ))}

              {result.reasoning && (
                <div className="border-t border-white/5 pt-4">
                  <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-2">WHY THIS WORKS</p>
                  <p className="text-xs text-white/50 italic leading-relaxed">{result.reasoning}</p>
                </div>
              )}

              <button
                onClick={() => copyToClipboard(`HOOK:\n${result.hook}\n\nBODY:\n${result.body}\n\nCTA:\n${result.cta}\n\nMUSIC MOOD:\n${result.music_mood}`)}
                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                <Copy className="w-3 h-3" /> Copy full script
              </button>
            </CardContent>
          </Card>
        )}

        {!result && !loading && !error && (
          <Card className="bg-[#111111] border-white/5">
            <CardContent className="py-16 text-center text-white/20 text-sm">
              Fill in the settings and click Generate Script
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
