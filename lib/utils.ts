import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatScore(score: number): string {
  return score.toFixed(1)
}

export function getScoreColor(score: number): string {
  if (score > 20) return "text-green-400 bg-green-400/10 border-green-400/20"
  if (score >= 10) return "text-amber-400 bg-amber-400/10 border-amber-400/20"
  if (score >= 5) return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20"
  return "text-red-400 bg-red-400/10 border-red-400/20"
}

export function getScoreBadgeVariant(score: number): "green" | "amber" | "gray" | "red" {
  if (score > 20) return "green"
  if (score >= 10) return "amber"
  if (score >= 5) return "gray"
  return "red"
}
