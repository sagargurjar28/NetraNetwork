import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/IconButton'
import { useUIStore } from '@/stores/uiStore'
import { mockCases } from '@/mocks/fixtures'
import { RefreshCw, ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

/** Left rail: case history / boards list. Collapses to a ~40px strip. */
export function CaseHistoryPanel({
  pinCount,
  linkCount,
  onSelectCase,
}: {
  pinCount: number
  linkCount: number
  onSelectCase: (caseId: string) => void
}) {
  const collapsed = useUIStore((s) => s.boardHistoryCollapsed)
  const setCollapsed = useUIStore((s) => s.setBoardHistoryCollapsed)
  if (collapsed) {
    return (
      <Card className="flex w-[40px] shrink-0 flex-col items-center gap-2 overflow-hidden py-3">
        <IconButton aria-label="Expand case history" onClick={() => setCollapsed(false)}>
          <ChevronRight size={16} />
        </IconButton>
        <FolderOpen size={16} className="rotate-90 text-text-muted" aria-hidden />
      </Card>
    )
  }

  return (
    <Card className="hidden w-[260px] shrink-0 flex-col overflow-hidden lg:flex">
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] p-3">
        <h3 className="font-medium text-sm text-text-primary">Cases</h3>
        <div className="flex gap-1">
          <IconButton aria-label="Refresh cases" onClick={() => toast('Cases refreshed', 'success')}>
            <RefreshCw size={14} />
          </IconButton>
          <IconButton aria-label="Collapse case history" onClick={() => setCollapsed(true)}>
            <ChevronLeft size={14} />
          </IconButton>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-auto p-3">
        {mockCases.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCase(c.id)}
            className={cn(
              'w-full rounded-control border border-[rgba(255,255,255,0.06)] bg-surface-1 p-2.5 text-left transition-colors',
              'hover:border-[rgba(255,255,255,0.14)]',
            )}
          >
            <div className="truncate text-sm font-medium text-text-primary">{c.title}</div>
            <div className="mt-0.5 font-mono text-[11px] text-text-muted">{c.id}</div>
            <div className="mt-1.5 flex items-center justify-between">
              <Badge variant={c.status === 'Open' ? 'danger' : c.status === 'Closed' ? 'default' : 'warning'}>{c.status}</Badge>
              <span className="font-mono text-[11px] text-text-muted">{pinCount} pins + {linkCount} links</span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}
