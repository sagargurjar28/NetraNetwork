import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Network, FileText, Bot, Settings, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { UserMenu } from './UserMenu'

const nav = [
  { label: 'Network', href: '/network', icon: Network },
  { label: 'Graph', href: '/network/graph', icon: Network },
  { label: 'Entities', href: '/network/entities', icon: LayoutDashboard },
  { label: 'Cases', href: '/network/cases', icon: Shield },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Copilot', href: '/copilot', icon: Bot },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Admin', href: '/admin', icon: Shield },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const loc = useLocation()
  const user = useAuthStore((s) => s.user)
  return (
    <aside className={cn('flex flex-col bg-transparent rounded-l-shell rounded-r-none transition-all duration-200 shrink-0', sidebarCollapsed ? 'w-[64px]' : 'w-[240px]')}>
      <div className="h-14 flex items-center px-3 justify-between">
        {!sidebarCollapsed && (
          /* LOGO: asset lives at /assets/netra-logo.svg (user-supplied).
             Accepted formats: .svg (preferred) or .png.
             Recommended dimensions: SVG any size; PNG ≥ 128×128 with
             transparent background. */
          <div className="flex items-center gap-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] px-3 py-2">
            <img
              src="/assets/netra-logo.svg"
              alt="NetraNetwork"
              className="h-8 w-auto select-none"
              draggable={false}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement
                img.style.display = 'none'
                const fb = img.nextElementSibling as HTMLElement | null
                if (fb) fb.style.display = 'inline-block'
              }}
            />
            <span
              className="hidden text-base font-semibold tracking-tight"
              aria-hidden="true"
            >
              NetraNetwork
            </span>
          </div>
        )}
        <button onClick={toggleSidebar} aria-label="Toggle sidebar" className="p-1.5 rounded-lg bg-surface-2 border border-[rgba(255,255,255,0.06)] text-text-secondary hover:text-text-primary">
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <nav className="flex-1 overflow-auto py-2 px-2 space-y-1" aria-label="Primary">
        {nav.map((item) => {
          const active = loc.pathname === item.href || (item.href !== '/network' && loc.pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-none text-sm transition-colors border-l-2',
                active ? 'bg-surface-hover text-text-primary border-accent-primary' : 'text-text-secondary border-transparent hover:bg-surface-hover hover:text-text-primary',
              )}
            >
              <item.icon size={18} className="shrink-0" />{!sidebarCollapsed && item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
        <UserMenu
          align="left"
          trigger={
            <>
              <div className="w-8 h-8 shrink-0 rounded-full bg-surface-3 flex items-center justify-center text-xs font-medium text-text-secondary">{user?.name?.[0] || 'A'}</div>
              {!sidebarCollapsed && <div className="flex-1 min-w-0"><div className="text-sm font-medium text-text-primary truncate">{user?.name || 'Inspector Arjun'}</div><div className="text-xs text-text-muted truncate">{user?.role}</div></div>}
            </>
          }
        />
      </div>
    </aside>
  )
}
