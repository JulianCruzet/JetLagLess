import * as React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JetLagLess - Smart Jet Lag Calculator',
  description: 'Calculate the optimal sleep schedule to minimize jet lag during your travels',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-[#36393f] text-[#dcddde] min-h-screen w-full h-full">
      <body className={`${inter.className} bg-[#36393f] text-[#dcddde] min-h-screen w-full h-full flex flex-col`}>
        <header className="w-full bg-[#23272a] py-4 px-6 flex items-center justify-between shadow-md">
          <span className="text-2xl font-bold text-[#5865f2] tracking-tight">JetLagLess</span>
          <nav className="space-x-6">
            <a href="/" className="text-[#dcddde] hover:text-[#5865f2] font-medium">Calculator</a>
            <a href="/about" className="text-[#dcddde] hover:text-[#5865f2] font-medium">About</a>
            <a href="https://juliancruzet.ca" target="_blank" rel="noopener noreferrer" className="text-[#dcddde] hover:text-[#5865f2] font-medium">Creator</a>
          </nav>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center w-full h-full bg-[#36393f]">
          {children}
        </main>
        <footer className="w-full bg-[#23272a] py-4 px-6 text-center text-[#72767d] text-sm">
          &copy; {new Date().getFullYear()} JetLagLess. Not affiliated with Discord.
        </footer>
      </body>
    </html>
  )
}
