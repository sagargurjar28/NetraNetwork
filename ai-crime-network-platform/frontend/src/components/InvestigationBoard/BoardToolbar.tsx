import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ShareReportButton } from './ShareReportButton'

type Props = {
  onFit: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onExport: () => void
  onNewBoard: () => void
  onImport: () => void
}

/**
 * Bottom toolbar. Every button is wired — the old force-graph layout toggle
 * was removed (no layouts in React Flow) and replaced with working
 * New Board + Import actions.
 */
export function BoardToolbar({ onFit, onZoomIn, onZoomOut, onExport, onNewBoard, onImport }: Props) {
  const [searchParams] = useSearchParams()
  const caseId = searchParams.get('caseId')
  const boardId = searchParams.get('boardId') ?? ''
  return (
    <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2">
      <Button size="sm" variant="secondary" onClick={onFit}>Fit</Button>
      <Button size="sm" variant="secondary" onClick={onZoomIn}>Zoom In</Button>
      <Button size="sm" variant="secondary" onClick={onZoomOut}>Zoom Out</Button>
      <Button size="sm" variant="secondary" onClick={onExport}>Export PNG</Button>
      <Button size="sm" variant="secondary" onClick={onNewBoard}>New Board</Button>
      <Button size="sm" variant="secondary" onClick={onImport}>Import</Button>
      {caseId ? (
        <ShareReportButton caseId={caseId} boardId={boardId} />
      ) : (
        <Button size="sm" variant="secondary" disabled title="Open a case board to share a report">
          Share Report
        </Button>
      )}
    </div>
  )
}
