'use client'

import { X, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToastStore } from '@/lib/toast-store'

export function Toaster() {
  const { toasts, remove } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border animate-in slide-in-from-right-4 fade-in duration-200 ${
            t.type === 'error'
              ? 'bg-zinc-900 border-red-500/30 text-red-300'
              : 'bg-zinc-900 border-green-500/30 text-green-300'
          }`}
        >
          {t.type === 'error' ? (
            <AlertCircle size={15} className="flex-shrink-0 text-red-400" />
          ) : (
            <CheckCircle2 size={15} className="flex-shrink-0 text-green-400" />
          )}
          <span className="text-zinc-200">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="ml-1 text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
