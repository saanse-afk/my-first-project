import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "green" | "amber" | "gray" | "red" | "default"
  className?: string
}

const variantStyles: Record<string, string> = {
  green: "text-green-400 bg-green-400/10 border border-green-400/20",
  amber: "text-amber-400 bg-amber-400/10 border border-amber-400/20",
  gray: "text-zinc-400 bg-zinc-400/10 border border-zinc-400/20",
  red: "text-red-400 bg-red-400/10 border border-red-400/20",
  default: "text-zinc-300 bg-zinc-800 border border-zinc-700",
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", variantStyles[variant], className)}>
      {children}
    </span>
  )
}
