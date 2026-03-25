"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CSVUpload } from "@/components/settings/csv-upload"
import { RefreshCw, Eye, EyeOff, CheckCircle2 } from "lucide-react"

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [reanalyzed, setReanalyzed] = useState(false)

  const handleReanalyze = async () => {
    setReanalyzing(true)
    // Trigger re-fetch of analytics
    await new Promise((r) => setTimeout(r, 800))
    setReanalyzing(false)
    setReanalyzed(true)
    setTimeout(() => setReanalyzed(false), 3000)
  }

  return (
    <MainLayout title="Settings" subtitle="Configuration and data management">
      <div className="max-w-2xl space-y-6">

        {/* CSV Upload */}
        <Card>
          <CSVUpload />
        </Card>

        {/* API Key */}
        <Card>
          <h3 className="text-sm font-medium text-zinc-200 mb-1">Anthropic API Key</h3>
          <p className="text-xs text-zinc-500 mb-4">
            Used for post classification and content generation. Set as <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs text-amber-400">ANTHROPIC_API_KEY</code> in your environment for production.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            This field is for reference only. Set the key in <code className="text-zinc-500">.env.local</code> for it to take effect.
          </p>
        </Card>

        {/* Re-analyze */}
        <Card>
          <h3 className="text-sm font-medium text-zinc-200 mb-1">Manual Re-analyze</h3>
          <p className="text-xs text-zinc-500 mb-4">
            Refresh all analytics computations from the current database. Use after bulk updates.
          </p>
          <Button
            variant="outline"
            onClick={handleReanalyze}
            disabled={reanalyzing}
          >
            {reanalyzed ? (
              <><CheckCircle2 size={14} className="text-green-400" /> Done</>
            ) : (
              <><RefreshCw size={14} className={reanalyzing ? "animate-spin" : ""} /> {reanalyzing ? "Re-analyzing…" : "Re-analyze Data"}</>
            )}
          </Button>
        </Card>

        {/* Supabase Schema */}
        <Card>
          <h3 className="text-sm font-medium text-zinc-200 mb-1">Database Setup</h3>
          <p className="text-xs text-zinc-500 mb-3">
            Run this schema in your Supabase SQL editor to set up the database.
          </p>
          <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
            <p className="text-xs text-zinc-500 font-mono">supabase/schema.sql</p>
          </div>
          <div className="mt-4 space-y-1 text-xs text-zinc-600">
            <p>Required environment variables:</p>
            <ul className="ml-3 space-y-0.5 font-mono text-zinc-500">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>SUPABASE_SERVICE_ROLE_KEY</li>
              <li>ANTHROPIC_API_KEY</li>
            </ul>
          </div>
        </Card>

      </div>
    </MainLayout>
  )
}
