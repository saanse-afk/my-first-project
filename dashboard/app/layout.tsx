import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAANSE — Content Intelligence Dashboard',
  description: 'Social media content intelligence for Ancient India by SAANSE',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-white font-sans">{children}</body>
    </html>
  )
}
