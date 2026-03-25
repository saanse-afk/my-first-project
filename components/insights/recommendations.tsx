"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, LayoutGrid, Calendar } from "lucide-react"

interface Recommendation {
  rank: number
  topic: string
  storyIdea: string
  format: string
  hookStyle: string
  reasoning: string
  festivalConnection: string | null
}

interface Props {
  recommendations: Recommendation[]
}

export function Recommendations({ recommendations }: Props) {
  if (!recommendations.length) return null

  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-100 mb-3">What to Post Next</h2>
      <div className="space-y-3">
        {recommendations.map((r) => (
          <Card key={r.rank} className="flex gap-4">
            {/* Rank */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 text-sm font-bold">{r.rank}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-zinc-100 font-medium text-sm">{r.topic}</span>
                <Badge variant="amber">
                  {r.format === "reel" ? <><Video size={10} className="mr-1" />Reel</> : <><LayoutGrid size={10} className="mr-1" />Carousel</>}
                </Badge>
                <Badge variant="gray">
                  {r.hookStyle.replace(/_/g, " ")}
                </Badge>
                {r.festivalConnection && (
                  <Badge variant="default">
                    <Calendar size={10} className="mr-1" />{r.festivalConnection}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-zinc-300 mb-1.5">{r.storyIdea}</p>
              <p className="text-xs text-zinc-600">{r.reasoning}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
