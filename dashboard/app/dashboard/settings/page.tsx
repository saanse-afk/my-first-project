import { createServiceClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SettingsClient } from '@/components/settings/settings-client'
import { formatRelativeTime, formatDate } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = createServiceClient()

  const [accountsRes, syncLogsRes] = await Promise.all([
    supabase.from('social_accounts').select('*').order('created_at'),
    supabase.from('sync_logs').select('*').order('started_at', { ascending: false }).limit(20),
  ])

  const accounts = accountsRes.data || []
  const syncLogs = syncLogsRes.data || []

  const igAccount = accounts.find((a) => a.platform === 'instagram')
  const ytAccount = accounts.find((a) => a.platform === 'youtube')

  const tokenExpiry = igAccount?.token_expires_at ? new Date(igAccount.token_expires_at) : null
  const daysUntilExpiry = tokenExpiry
    ? Math.ceil((tokenExpiry.getTime() - Date.now()) / 86_400_000)
    : null

  const statusIcon = (ok: boolean) =>
    ok ? (
      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    ) : (
      <XCircle className="w-4 h-4 text-white/20" />
    )

  return (
    <div className="flex flex-col flex-1">
      <Header title="Settings" subtitle="API connections, sync management, and configuration" />
      <div className="flex-1 p-6 space-y-6 overflow-auto">

        {/* API Status */}
        <Card className="bg-[#111111] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">API Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Instagram */}
            <div className="flex items-start justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-start gap-3">
                {statusIcon(!!igAccount)}
                <div>
                  <p className="text-sm font-medium text-white">Instagram Graph API</p>
                  {igAccount ? (
                    <div className="text-xs text-white/40 mt-0.5 space-y-0.5">
                      <p>@{igAccount.account_name || igAccount.account_id}</p>
                      <p>{igAccount.followers_count?.toLocaleString()} followers</p>
                      {igAccount.last_synced_at && <p>Last synced: {formatRelativeTime(igAccount.last_synced_at)}</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-white/30 mt-0.5">Not connected — set INSTAGRAM_ACCESS_TOKEN in env</p>
                  )}
                </div>
              </div>
              {igAccount && daysUntilExpiry !== null && (
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={`text-xs ${daysUntilExpiry <= 10 ? 'text-red-400 border-red-400/30' : daysUntilExpiry <= 20 ? 'text-amber-400 border-amber-400/30' : 'text-emerald-400 border-emerald-400/30'}`}
                  >
                    Token expires in {daysUntilExpiry}d
                  </Badge>
                  {tokenExpiry && <p className="text-xs text-white/20 mt-1">{formatDate(tokenExpiry.toISOString())}</p>}
                </div>
              )}
            </div>

            {/* YouTube */}
            <div className="flex items-start justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex items-start gap-3">
                {statusIcon(!!ytAccount)}
                <div>
                  <p className="text-sm font-medium text-white">YouTube Analytics API</p>
                  {ytAccount ? (
                    <p className="text-xs text-white/40 mt-0.5">Channel: {ytAccount.account_name || ytAccount.account_id}</p>
                  ) : (
                    <p className="text-xs text-white/30 mt-0.5">Optional — set YOUTUBE_CHANNEL_ID + GOOGLE credentials in env</p>
                  )}
                </div>
              </div>
            </div>

            {/* Anthropic */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              {statusIcon(!!process.env.ANTHROPIC_API_KEY)}
              <div>
                <p className="text-sm font-medium text-white">Anthropic (Claude) API</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {process.env.ANTHROPIC_API_KEY ? 'Connected — using claude-sonnet-4-20250514' : 'Not configured — set ANTHROPIC_API_KEY in env'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive controls */}
        <SettingsClient />

        {/* Sync history */}
        <Card className="bg-[#111111] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Sync History</CardTitle>
          </CardHeader>
          <CardContent>
            {syncLogs.length === 0 ? (
              <p className="text-sm text-white/20 py-4 text-center">No sync history yet.</p>
            ) : (
              <div className="space-y-2">
                {syncLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-xs py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {log.status === 'error' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                      {log.status === 'running' && <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                      <span className="text-white/60">{formatRelativeTime(log.started_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/40">
                      {log.status === 'success' && <span>{log.posts_synced} posts synced</span>}
                      {log.status === 'error' && <span className="text-red-400/70 truncate max-w-xs">{log.error_message}</span>}
                      {log.status === 'running' && <span>Running…</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment variable reference */}
        <Card className="bg-[#111111] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Required Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 font-mono text-xs">
              {[
                { key: 'NEXT_PUBLIC_SUPABASE_URL', desc: 'Supabase project URL' },
                { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', desc: 'Supabase anon key' },
                { key: 'SUPABASE_SERVICE_ROLE_KEY', desc: 'Supabase service role (server only)' },
                { key: 'INSTAGRAM_ACCESS_TOKEN', desc: 'Long-lived IG token (60 days)' },
                { key: 'INSTAGRAM_BUSINESS_ACCOUNT_ID', desc: 'Numeric IG business account ID' },
                { key: 'ANTHROPIC_API_KEY', desc: 'Anthropic API key' },
                { key: 'NEXT_PUBLIC_APP_URL', desc: 'Deployed app URL (for cron)' },
                { key: 'GOOGLE_CLIENT_ID', desc: 'Optional — YouTube OAuth' },
                { key: 'GOOGLE_CLIENT_SECRET', desc: 'Optional — YouTube OAuth' },
                { key: 'YOUTUBE_REFRESH_TOKEN', desc: 'Optional — YouTube refresh token' },
                { key: 'YOUTUBE_CHANNEL_ID', desc: 'Optional — YouTube channel ID' },
                { key: 'CRON_SECRET', desc: 'Optional — protects cron endpoint' },
              ].map(({ key, desc }) => (
                <div key={key} className="flex gap-3">
                  <span className="text-amber-400/70 shrink-0">{key}</span>
                  <span className="text-white/30"># {desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
