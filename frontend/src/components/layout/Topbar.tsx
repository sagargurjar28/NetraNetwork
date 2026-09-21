import { Search, Bell, Bot } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useLocation } from 'react-router-dom'
import { IconButton } from '@/components/ui/IconButton'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/authStore'

function titleFromPath(path: string) {
  if (path.startsWith('/network/graph')) return 'Graph Explorer'
  if (path.startsWith('/network/entities')) return 'Entities'
  if (path.startsWith('/network/cases')) return 'Cases'
  if (path.startsWith('/network')) return 'Criminal Network'
  if (path.startsWith('/documents/upload')) return 'Upload Document'
  if (path.startsWith('/documents/library')) return 'Document Library'
  if (path.startsWith('/documents')) return 'Document Management'
  if (path.startsWith('/copilot')) return 'Copilot'
  if (path.startsWith('/settings')) return 'Settings'
  if (path.startsWith('/admin')) return 'Admin'
  return 'Dashboard'
}

export function Topbar() {
  const loc = useLocation()
  const setCopilotOpen = useUIStore((s) => s.setCopilotOpen)
  const copilotOpen = useUIStore((s) => s.copilotOpen)
  const user = useAuthStore((s) => s.user)
  return (
    <header className="h-14 flex items-center justify-between gap-3 px-4 bg-transparent sticky top-0 z-30">
      <h1 className="font-semibold text-text-primary whitespace-nowrap">{titleFromPath(loc.pathname)}</h1>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 bg-base border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-1.5 text-sm text-text-muted">
          <Search size={14} /> <input id="global-search" placeholder="Search (press /)" className="bg-transparent outline-none text-text-primary placeholder:text-text-muted w-40" />
        </div>
        <IconButton aria-label="Notifications"><Bell size={16} /></IconButton>
        <IconButton aria-label="Toggle copilot (Cmd+K)" onClick={() => setCopilotOpen(!copilotOpen)} className={copilotOpen ? 'bg-accent-primary text-white border-accent-primary' : ''}><Bot size={16} /></IconButton>
        <Dropdown trigger={<button aria-label="Profile menu" className="flex items-center gap-2"><Avatar name={user?.name} size="sm" /></button>}>
          <DropdownItem>Profile</DropdownItem>
          <DropdownItem>Settings</DropdownItem>
          <DropdownItem onClick={() => useAuthStore.getState().logout()}>Logout</DropdownItem>
        </Dropdown>
      </div>
    </header>
  )
}
