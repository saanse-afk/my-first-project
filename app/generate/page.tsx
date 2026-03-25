"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ScriptTab } from "@/components/generate/script-tab"
import { CaptionTab } from "@/components/generate/caption-tab"
import { HooksTab } from "@/components/generate/hooks-tab"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "script", label: "Script" },
  { id: "caption", label: "Caption" },
  { id: "hooks", label: "Hooks" },
] as const

type TabId = typeof TABS[number]["id"]

export default function GeneratePage() {
  const [activeTab, setActiveTab] = useState<TabId>("script")

  return (
    <MainLayout title="Generate" subtitle="AI-powered content for Ancient India by SAANSE">
      <div className="max-w-3xl">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 mb-6 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === tab.id
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "script" && <ScriptTab />}
        {activeTab === "caption" && <CaptionTab />}
        {activeTab === "hooks" && <HooksTab />}
      </div>
    </MainLayout>
  )
}
