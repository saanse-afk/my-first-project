"use client"

import { Card } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

interface Props {
  insights: string[]
}

export function KeyFindings({ insights }: Props) {
  if (!insights.length) return null

  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-100 mb-3">Key Findings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, i) => (
          <Card key={i} className="flex gap-3 p-4">
            <div className="mt-0.5 w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Lightbulb size={13} className="text-amber-400" />
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{insight}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
