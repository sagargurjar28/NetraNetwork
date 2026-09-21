import { Bot } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { CopilotChat } from '@/components/Copilot/CopilotPanel'

export function CopilotDrawer() {
  const open = useUIStore((s) => s.copilotOpen)
  const setOpen = useUIStore((s) => s.setCopilotOpen)
  if (!open) return null
  return (
    <div className="h-full w-full bg-transparent flex flex-col min-h-0" role="complementary" aria-label="Copilot drawer">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2 font-semibold text-text-primary"><Bot size={18} className="text-accent-primary" /> Copilot</div>
        <button onClick={() => setOpen(false)} aria-label="Close copilot drawer" className="p-1 hover:bg-surface-3 rounded text-text-secondary">✕</button>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <CopilotChat mode="drawer" onClose={() => setOpen(false)} />
      </div>
    </div>
  )
}
