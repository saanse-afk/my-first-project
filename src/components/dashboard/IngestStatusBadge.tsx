'use client'

import { formatDistanceToNow } from 'date-fns'
import { IngestionJob } from '@/types'

interface IngestStatusBadgeProps {
  job: IngestionJob | null
  label: string
}

export function IngestStatusBadge({ job, label }: IngestStatusBadgeProps) {
  if (!job) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-gray-300" />
        <span className="font-medium">{label}</span>
        <span>No data</span>
      </div>
    )
  }

  if (job.status === 'running') {
    return (
      <div className="flex items-center gap-2 text-xs text-blue-600">
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="font-medium">{label}</span>
        <span>Syncing…</span>
      </div>
    )
  }

  if (job.status === 'success') {
    const when = job.completed_at
      ? formatDistanceToNow(new Date(job.completed_at), { addSuffix: true })
      : 'recently'
    return (
      <div className="flex items-center gap-2 text-xs text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="font-medium">{label}</span>
        <span>Synced {when}</span>
      </div>
    )
  }

  if (job.status === 'failed') {
    const shortError = (job.error_message ?? 'Unknown error').slice(0, 60)
    return (
      <div className="flex items-center gap-2 text-xs text-red-700">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <span className="font-medium">{label}</span>
        <span title={job.error_message ?? ''}>Failed — {shortError}</span>
      </div>
    )
  }

  return null
}
