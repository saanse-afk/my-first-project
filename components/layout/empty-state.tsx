import { Upload } from "lucide-react"
import Link from "next/link"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4">
        <Upload size={22} className="text-zinc-500" />
      </div>
      <h3 className="text-zinc-300 font-medium mb-1">No data yet</h3>
      <p className="text-zinc-600 text-sm mb-5 max-w-xs">
        Upload your Instagram CSV export to see analytics.
      </p>
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        <Upload size={14} />
        Upload CSV
      </Link>
    </div>
  )
}
