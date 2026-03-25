"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Copy, Check } from "lucide-react"

export function CaptionTab() {
  const [form, setForm] = useState({ topic: "", keyMessage: "" })
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const generate = async () => {
    if (!form.topic.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/generate/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setOutput(data.output)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed")
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Topic *</label>
          <Input
            placeholder="e.g. Draupadi's vow, The ocean of milk"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Key Message</label>
          <Textarea
            placeholder="e.g. The real meaning of Draupadi's vastra haran is about dharma, not humiliation"
            value={form.keyMessage}
            onChange={(e) => setForm({ ...form, keyMessage: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <Button variant="amber" onClick={generate} disabled={loading || !form.topic.trim()}>
        <Sparkles size={14} />
        {loading ? "Generating..." : "Generate 3 Captions"}
      </Button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {output && (
        <Card className="relative">
          <button
            onClick={copy}
            className="absolute top-3 right-3 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy all"}
          </button>
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans pr-16">{output}</pre>
        </Card>
      )}
    </div>
  )
}
