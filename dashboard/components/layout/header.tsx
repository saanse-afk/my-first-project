'use client'

import { RefreshCw, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title: string
  subtitle?: string
  showSync?: boolean
}

export function Header({ title, subtitle, showSync = false }: HeaderProps) {
  const [syncing, setSyncing] = useState(false)
  const router = useRouter()

  async function handleSync() {
    setSyncing(true)
    try {
      await fetch('/api/sync/instagram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A0A0A]">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {showSync && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="gap-2 text-white/60 border-white/10 hover:bg-white/5 hover:text-white bg-transparent"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync'}
          </Button>
        )}
      </div>
    </header>
  )
}
