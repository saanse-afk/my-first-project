'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Play, CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SettingsClient() {
  const router = useRouter()
  const [syncStatus, setSyncStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [syncMessage, setSyncMessage] = useState('')
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')

  async function triggerSync() {
    setSyncStatus('running')
    setSyncMessage('')
    try {
      const res = await fetch('/api/sync/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const data = await res.json()
      if (res.ok) {
        setSyncStatus('success')
        setSyncMessage(`Synced ${data.posts_synced || 0} posts`)
        router.refresh()
      } else {
        setSyncStatus('error')
        setSyncMessage(data.error || 'Sync failed')
      }
    } catch (e) {
      setSyncStatus('error')
      setSyncMessage(String(e))
    }
  }

  async function refreshToken() {
    setRefreshStatus('running')
    try {
      const res = await fetch('/api/sync/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRefreshToken: true }),
      })
      if (res.ok) {
        setRefreshStatus('success')
        router.refresh()
      } else {
        setRefreshStatus('error')
      }
    } catch {
      setRefreshStatus('error')
    }
  }

  return (
    <Card className="bg-[#111111] border-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white/70">Manual Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Manual sync */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <div>
            <p className="text-sm font-medium text-white">Manual Instagram Sync</p>
            <p className="text-xs text-white/30 mt-0.5">Pull latest posts and update metrics</p>
            {syncMessage && (
              <p className={`text-xs mt-1 ${syncStatus === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {syncMessage}
              </p>
            )}
          </div>
          <Button
            size="sm"
            onClick={triggerSync}
            disabled={syncStatus === 'running'}
            className="gap-2 bg-white/5 hover:bg-white/10 text-white border-white/10 border"
          >
            {syncStatus === 'running' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : syncStatus === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : syncStatus === 'error' ? (
              <XCircle className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {syncStatus === 'running' ? 'Syncing…' : 'Run Sync'}
          </Button>
        </div>

        {/* Token refresh */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <div>
            <p className="text-sm font-medium text-white">Refresh Instagram Token</p>
            <p className="text-xs text-white/30 mt-0.5">Extend token expiry by 60 days (auto-triggered when &lt;10 days remaining)</p>
          </div>
          <Button
            size="sm"
            onClick={refreshToken}
            disabled={refreshStatus === 'running'}
            variant="outline"
            className="gap-2 text-white/50 border-white/10 hover:bg-white/5 bg-transparent"
          >
            {refreshStatus === 'running' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Refresh Token
          </Button>
        </div>

        {/* Cron info */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <p className="text-sm font-medium text-white">Daily Auto-Sync (Cron)</p>
          <p className="text-xs text-white/30 mt-0.5">
            Runs daily at 6:00 AM IST (00:30 UTC) via Vercel Cron.
            Configured in <code className="text-amber-400/70">vercel.json</code>.
          </p>
          <p className="text-xs text-white/20 mt-1">Path: /api/cron/daily-sync · Requires CRON_SECRET env var for security</p>
        </div>
      </CardContent>
    </Card>
  )
}
