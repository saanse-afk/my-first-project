"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Sparkles, Copy, Check } from "lucide-react"

export function ScriptTab() {
  const [form, setForm] = useState({ topic: "", subTopic: "", duration: "60s", format: "reel" })
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const generate = async () => {
    if (!form.topic.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/generate/script", {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Topic *</label>
          <Input
            placeholder="e.g. Krishna and Arjuna, Shiva's cosmic dance"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Sub-topic / Angle</label>
          <Input
            placeholder="e.g. The moment Arjuna dropped his bow"
            value={form.subTopic}
            onChange={(e) => setForm({ ...form, subTopic: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Duration</label>
          <Select
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            options={[
              { value: "30s", label: "30 seconds" },
              { value: "60s", label: "60 seconds" },
              { value: "90s", label: "90 seconds" },
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Format</label>
          <Select
            value={form.format}
            onChange={(e) => setForm({ ...form, format: e.target.value })}
            options={[
              { value: "reel", label: "Reel (video)" },
              { value: "carousel", label: "Carousel" },
            ]}
          />
        </div>
      </div>

      <Button variant="amber" onClick={generate} disabled={loading || !form.topic.trim()}>
        <Sparkles size={14} />
        {loading ? "Generating..." : "Generate Script"}
      </Button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {output && (
        <Card className="relative">
          <button
            onClick={copy}
            className="absolute top-3 right-3 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans pr-16">{output}</pre>
        </Card>
      )}
    </div>
  )
}
