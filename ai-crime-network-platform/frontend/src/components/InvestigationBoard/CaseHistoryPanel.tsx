import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { useUIStore } from '@/stores/uiStore'
import { boardsApi } from '@/services/api/boards'
import { RefreshCw, ChevronLeft, ChevronRight, FolderOpen, Plus } from 'lucide-react'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'
import { NewCaseDialog } from './NewCaseDialog'

/** Left rail: case history / boards list. Collapses to a ~40px strip. */
export function CaseHistoryPanel({
  pinCount,
  linkCount,
  onSelectCase,
  onCaseCreated,
}: {
  pinCount: number
  linkCount: number
  onSelectCase: (caseId: string) => void
  onCaseCreated?: (caseId: string, boardId: string) => void
}) {
  const collapsed = useUIStore((s) => s.boardHistoryCollapsed)
  const setCollapsed = useUIStore((s) => s.setBoardHistoryCollapsed)
  const [newOpen, setNewOpen] = useState(false)
  const [cases, setCases] = useState<any[]>([])
  const [loadingCases, setLoadingCases] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await boardsApi.getCases()
        if (!cancelled) setCases(data)
      } catch (err) {
        console.error('[case-panel] fetch failed', err)
        if (!cancelled) setCases([])
      } finally {
        if (!cancelled) setLoadingCases(false)
      }
    })()
    return () => { cancelled = true }
  }, [refreshKey])
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
      <div className="p-3 pb-0">
        <Button size="sm" variant="secondary" className="w-full" onClick={() => setNewOpen(true)}>
          <Plus size={14} className="mr-1" /> New Case
        </Button>
      </div>
      <div className="flex-1 space-y-2 overflow-auto p-3">
        {loadingCases
          ? <div className="p-3 text-xs text-text-muted">Loading cases…</div>
          : cases.length === 0
            ? <div className="p-3 text-xs text-text-muted">No cases yet</div>
            : cases.map((c) => (
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
      <NewCaseDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(caseId, boardId) => {
          setNewOpen(false)
          setRefreshKey((k) => k + 1)
          onCaseCreated?.(caseId, boardId)
        }}
      />
    </Card>
  )
}
