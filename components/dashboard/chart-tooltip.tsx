"use client"

import { formatNumber } from "@/lib/utils"

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color?: string }>
  label?: string
  formatter?: (value: number, name: string) => [string, string]
}

export function ChartTooltip({ active, payload, label, formatter }: TooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 shadow-xl text-xs">
      {label && <p className="text-zinc-400 mb-1">{label}</p>}
      {payload.map((entry, i) => {
        const [formattedValue, formattedName] = formatter
          ? formatter(entry.value, entry.name)
          : [formatNumber(entry.value), entry.name]
        return (
          <p key={i} className="text-zinc-100 font-medium">
            <span className="text-zinc-400">{formattedName}: </span>
            {formattedValue}
          </p>
        )
      })}
    </div>
  )
}
