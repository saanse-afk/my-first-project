'use client'

interface SentimentBadgeProps {
  positive_pct: number
  neutral_pct: number
  negative_pct: number
  summary?: string | null
}

export function SentimentBadge({ positive_pct, neutral_pct, negative_pct, summary }: SentimentBadgeProps) {
  const dominant =
    positive_pct >= neutral_pct && positive_pct >= negative_pct
      ? 'positive'
      : negative_pct >= neutral_pct
      ? 'negative'
      : 'neutral'

  const colorClass =
    dominant === 'positive'
      ? 'bg-green-100 text-green-800 border-green-200'
      : dominant === 'negative'
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-gray-100 text-gray-800 border-gray-200'

  return (
    <div className={`rounded-md border px-2 py-1 text-xs inline-block ${colorClass}`}>
      <div className="flex gap-2 font-medium">
        <span title="Positive">+{positive_pct}%</span>
        <span title="Neutral">~{neutral_pct}%</span>
        <span title="Negative">-{negative_pct}%</span>
      </div>
      {summary && <p className="mt-0.5 text-xs opacity-80">{summary}</p>}
    </div>
  )
}
