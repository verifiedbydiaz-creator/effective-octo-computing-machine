import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AppNav } from '@/components/shared/app-nav'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Command Center',
  description: 'Personal productivity dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="h-full bg-zinc-950 text-zinc-100">
        <AppNav />
        {/* Offset for desktop sidebar (left) and mobile bottom nav (bottom) */}
        <main className="md:ml-56 pb-16 md:pb-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
