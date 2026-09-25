import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { CopilotChat } from '@/components/Copilot/CopilotPanel'
import { ConversationList } from '@/components/Copilot/ConversationList'
import { useCopilotStore } from '@/stores/copilotStore'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function CopilotPage() {
  const conversations = useCopilotStore((s) => s.conversations)
  const activeId = useCopilotStore((s) => s.activeId)
  const active = conversations.find((c) => c.id === activeId)
  const [rightOpen, setRightOpen] = useState(true)

  const cited = active?.messages.flatMap((m) => m.citations || []) || []
  const uniqCited = Array.from(new Map(cited.map((c) => [c.refId, c])).values())

  return (
    <div className="flex gap-4 h-[calc(100vh-96px)]">
      <ConversationList />

      {/* center */}
      <Card className="flex-1 p-0 flex flex-col overflow-hidden min-w-0">
        <CopilotChat mode="page" />
      </Card>

      {/* right rail collapsible */}
      <div className={cn('transition-all', rightOpen ? 'w-[260px]' : 'w-[36px]')}>
        <Card className="h-full p-3 overflow-auto">
          <button onClick={() => setRightOpen(!rightOpen)} className="p-1 rounded hover:bg-surface-3 text-text-secondary mb-2" aria-label="Toggle context panel">
            {rightOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          {rightOpen && (
            <div className="space-y-3">
              <div><div className="text-xs font-medium text-text-primary mb-1">Active domain</div><div className="text-sm text-text-secondary">{active?.domain || 'auto'}</div></div>
              <div><div className="text-xs font-medium text-text-primary mb-1">Cited sources ({uniqCited.length})</div>
                {uniqCited.length === 0 ? <div className="text-xs text-text-muted">No citations yet.</div> :
                  <div className="space-y-1">{uniqCited.map((c) => <div key={c.refId} className="p-2 rounded-lg bg-base border border-[rgba(255,255,255,0.06)] text-xs"><div className="font-mono text-text-primary">[{c.refId}]</div><div className="text-text-secondary truncate">{c.title}</div></div>)}</div>}
              </div>
              <div><div className="text-xs font-medium text-text-primary mb-1">Attached docs</div><div className="text-xs text-text-muted">Attachments appear above the input; ids go into copilot:send.</div></div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
