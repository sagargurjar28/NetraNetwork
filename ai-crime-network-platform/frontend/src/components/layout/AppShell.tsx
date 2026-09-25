import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MeshBackground } from '@/components/MeshBackground'
import { CopilotDrawer } from '@/pages/copilot/CopilotDrawer'
import { CopilotSplitHandle } from './SplitPane'
import { GradientDivider } from '@/components/ui/GradientDivider'
import { useUIStore } from '@/stores/uiStore'
import { useEffect } from 'react'
import { cn } from '@/utils/cn'

export function AppShell() {
  const setCopilotOpen = useUIStore((s) => s.setCopilotOpen)
  const copilotOpen = useUIStore((s) => s.copilotOpen)
  const copilotWidth = useUIStore((s) => s.copilotWidth)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCopilotOpen(!useUIStore.getState().copilotOpen) }
      if (e.key === 'Escape') { setCopilotOpen(false) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [setCopilotOpen])
  return (
    <div className="app-background min-h-screen p-3">
      <MeshBackground />
      {/* Unified rounded shell floating above the mesh. Body shows through the outer padding. */}
      <div
        className="mx-auto flex w-full max-w-[1920px] overflow-hidden rounded-shell border border-[rgba(255,255,255,0.04)] bg-surface-1"
        style={{ position: 'relative', zIndex: 10, minHeight: 'calc(100vh - 1.5rem)' }}
      >
        <Sidebar />
        <GradientDivider orientation="vertical" />
        {/* Nested rounding: outer edge matches shell when aside closed, square when open. */}
        <div className={cn('flex min-w-0 flex-1 flex-col', copilotOpen ? 'rounded-none' : 'rounded-l-none rounded-r-shell')}>
          <Topbar />
          <GradientDivider orientation="horizontal" />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
        {copilotOpen && (
          <div className="flex min-h-0 shrink-0">
            <GradientDivider orientation="vertical" />
            <CopilotSplitHandle />
            <div
              style={{ width: copilotWidth }}
              className={cn('max-w-[90vw] min-h-0 flex rounded-r-shell rounded-l-none bg-surface-2 overflow-hidden')}
            >
              <CopilotDrawer />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
