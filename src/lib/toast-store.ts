import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

interface ToastStore {
  toasts: Toast[]
  add: (message: string, type?: 'success' | 'error') => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type = 'success') => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Call in any client component to fire a toast */
export function useToast() {
  return useToastStore((s) => s.add)
}
