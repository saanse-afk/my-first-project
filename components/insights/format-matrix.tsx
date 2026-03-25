"use client"

import { Card } from "@/components/ui/card"
import type { ContentMatrixCell } from "@/lib/types"

interface Props {
  data: ContentMatrixCell[]
}

const CONTENT_TYPES = ["concept", "story", "festival", "narrative"]
const FORMATS = ["Video", "Carousel"]

export function FormatMatrix({ data }: Props) {
  if (!data.length) return null

  const getCell = (format: string, content_type: string) =>
    data.find((d) => d.format === format && d.content_type === content_type)

  const maxScore = Math.max(...data.map((d) => d.avgScore), 0.01)

  const getIntensity = (score: number) => {
    const pct = score / maxScore
    if (pct > 0.75) return "bg-amber-500/30 text-amber-300 border-amber-500/30"
    if (pct > 0.5) return "bg-orange-500/20 text-orange-300 border-orange-500/20"
    if (pct > 0.25) return "bg-zinc-700/30 text-zinc-300 border-zinc-700"
    return "bg-zinc-900/50 text-zinc-500 border-zinc-800"
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-100 mb-3">Format × Content Type Matrix</h2>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-zinc-600 w-28" />
                {CONTENT_TYPES.map((ct) => (
                  <th key={ct} className="text-center px-4 py-2 text-xs font-medium text-zinc-500 capitalize">
                    {ct}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FORMATS.map((format) => (
                <tr key={format} className="border-t border-[#1F1F1F]">
                  <td className="px-4 py-3 text-sm font-medium text-zinc-400">{format}</td>
                  {CONTENT_TYPES.map((ct) => {
                    const cell = getCell(format, ct)
                    return (
                      <td key={ct} className="px-4 py-3 text-center">
                        {cell ? (
                          <div className={`inline-flex flex-col items-center rounded-lg border px-3 py-1.5 ${getIntensity(cell.avgScore)}`}>
                            <span className="text-sm font-semibold tabular-nums">{cell.avgScore.toFixed(1)}</span>
                            <span className="text-xs opacity-60">{cell.postCount}p</span>
                          </div>
                        ) : (
                          <span className="text-zinc-700 text-xs">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-600 mt-3 px-1">Score = avg engagement score. Intensity = relative performance.</p>
      </Card>
    </div>
  )
}
