"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Copy, Check } from "lucide-react"

export function HooksTab() {
  const [topic, setTopic] = useState("")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [error, setError] = useState("")

  const generate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/generate/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
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

  const copyHook = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  // Parse hooks from output text
  const hookBlocks = output
    ? output.split(/\*\*(?:Myth-buster|Declarative|Scene-setter|Character-lead|Common-belief)/i).filter(Boolean)
    : []

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Topic *</label>
          <Input
            placeholder="e.g. Vishnu's Sudarshana Chakra, Sati's sacrifice"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
        </div>
      </div>

      <Button variant="amber" onClick={generate} disabled={loading || !topic.trim()}>
        <Sparkles size={14} />
        {loading ? "Generating..." : "Generate 5 Hooks"}
      </Button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {output && (
        <Card className="relative">
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">{output}</pre>
        </Card>
      )}
    </div>
  )
}
