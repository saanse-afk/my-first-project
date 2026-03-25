import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-zinc-100">{title}</h1>
            {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
