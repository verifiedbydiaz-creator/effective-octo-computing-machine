'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const SHORTCUTS: Record<string, string> = {
  d: '/',
  n: '/plan',
  b: '/backlog',
  c: '/content',
  o: '/outreach',
  r: '/review',
}

/** Global keyboard shortcuts for navigation. Ignored when an input is focused. */
export function KeyboardNav() {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if modifier keys held
      if (e.metaKey || e.ctrlKey || e.altKey) return
      // Skip if user is typing
      const tag = (e.target as HTMLElement).tagName
      const role = (e.target as HTMLElement).getAttribute('role')
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || role === 'textbox') return
      if ((e.target as HTMLElement).isContentEditable) return

      const path = SHORTCUTS[e.key.toLowerCase()]
      if (path) router.push(path)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return null
}
