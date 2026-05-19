'use client'

import { Button } from '@/components/ui/button'
import { Wand2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Festival } from '@/types'

interface FestivalGenerateButtonProps {
  festival: Festival
  compact?: boolean
}

export function FestivalGenerateButton({ festival, compact }: FestivalGenerateButtonProps) {
  const router = useRouter()

  function handleClick() {
    // Navigate to generate page with pre-filled context via search params
    const params = new URLSearchParams({
      topic: festival.deity || 'Festival',
      subTopic: `${festival.name} — ${festival.content_suggestions?.[0] || ''}`,
    })
    router.push(`/dashboard/generate?${params.toString()}`)
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className="text-amber-400/50 hover:text-amber-400 transition-colors p-1"
        title="Generate content for this festival"
      >
        <Wand2 className="w-4 h-4" />
      </button>
    )
  }

  return (
    <Button
      size="sm"
      onClick={handleClick}
      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/30 border gap-1.5"
    >
      <Wand2 className="w-3.5 h-3.5" />
      Generate Content
    </Button>
  )
}
