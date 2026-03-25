"use client"

import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}

export function Select({ options, className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50",
        className
      )}
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
