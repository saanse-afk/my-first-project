import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ancient India by SAANSE — Analytics",
  description: "Social media analytics dashboard for Ancient India by SAANSE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#0A0A0A] text-zinc-100">{children}</body>
    </html>
  );
}
