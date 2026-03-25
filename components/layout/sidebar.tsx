"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart2,
  FileText,
  Lightbulb,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/", label: "Overview", icon: BarChart2 },
  { href: "/posts", label: "All Posts", icon: FileText },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/generate", label: "Generate", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#0D0D0D] border-r border-[#1F1F1F] transition-all duration-200 shrink-0 h-screen sticky top-0",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-[#1F1F1F]", collapsed && "justify-center px-0")}>
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
          <span className="text-amber-400 text-xs font-bold">S</span>
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-zinc-100 truncate">SAANSE</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-[#1F1F1F]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors text-sm"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}
