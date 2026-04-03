'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Moon,
  Kanban,
  FileText,
  Users,
  BarChart2,
} from 'lucide-react'

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    color: '#e4e4e7', // zinc-200
    exact: true,
  },
  {
    href: '/plan',
    label: 'Night Planner',
    icon: Moon,
    color: '#8B5CF6', // DEEP_BUILD
    exact: false,
  },
  {
    href: '/backlog',
    label: 'Backlog',
    icon: Kanban,
    color: '#F59E0B', // BIZ_OPS
    exact: false,
  },
  {
    href: '/content',
    label: 'Content',
    icon: FileText,
    color: '#3B82F6', // CONTENT_PUBLISH
    exact: false,
  },
  {
    href: '/outreach',
    label: 'Outreach',
    icon: Users,
    color: '#10B981', // OUTREACH
    exact: false,
  },
  {
    href: '/review',
    label: 'Weekly Review',
    icon: BarChart2,
    color: '#06B6D4', // LEARNING
    exact: false,
  },
]

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname.startsWith(href)
}

export function AppNav() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col bg-zinc-900 border-r border-white/10 z-40">
        {/* Logo / wordmark */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <div className="h-6 w-6 rounded bg-violet-500 flex items-center justify-center text-white font-bold text-xs">
            CC
          </div>
          <span className="text-sm font-semibold text-white tracking-wide">
            Command Center
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map(({ href, label, icon: Icon, color, exact }) => {
            const active = isActive(pathname, href, exact)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon
                  size={18}
                  style={{ color: active ? color : undefined }}
                  className={active ? '' : 'text-zinc-500'}
                />
                <span>{label}</span>
                {active && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-xs text-zinc-600">Alejandro Diaz</p>
        </div>
      </aside>

      {/* ── Mobile bottom nav ───────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-900 border-t border-white/10 flex items-center justify-around px-2 z-40">
        {navItems.map(({ href, label, icon: Icon, color, exact }) => {
          const active = isActive(pathname, href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                active ? 'text-white' : 'text-zinc-500'
              }`}
            >
              <Icon size={20} style={{ color: active ? color : undefined }} />
              <span className="text-[10px] font-medium leading-none">
                {label.split(' ')[0]}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
