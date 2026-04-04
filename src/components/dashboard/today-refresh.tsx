'use client'

import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export function TodayRefresh() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.refresh()}
      title="Refresh to today's data"
      className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-colors"
    >
      <RefreshCw size={15} />
    </button>
  )
}
