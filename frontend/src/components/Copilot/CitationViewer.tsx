import { Link } from 'react-router-dom'
import type { Citation } from '@/stores/copilotStore'

export function sourceHref(c: Citation): string {
  if (c.type === 'document') return '/documents/' + c.refId
  if (c.type === 'entity') return '/network/entities/' + c.refId
  if (c.type === 'case') return '/network/cases/' + c.refId
  return '/copilot'
}

export function SourceDrawer({ citation, onClose }: { citation: Citation | null; onClose: () => void }) {
  if (!citation) return null
  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Source">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-[360px] max-w-[90vw] bg-surface-1 border-l border-[rgba(255,255,255,0.08)] p-5 space-y-3 overflow-auto">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-text-primary">{citation.title}</h3>
          <button onClick={onClose} aria-label="Close source" className="p-1 rounded hover:bg-surface-3 text-text-secondary">✕</button>
        </div>
        <div className="text-xs font-mono text-text-muted">cite:{citation.id} • {citation.type} • {citation.refId}</div>
        <p className="text-sm text-text-secondary leading-relaxed">{citation.excerpt}</p>
        <div className="text-xs text-text-muted">Doc ID: <span className="font-mono text-text-primary">{citation.type === 'document' ? citation.refId : '—'}</span> • Entity ID: <span className="font-mono text-text-primary">{citation.type === 'entity' ? citation.refId : '—'}</span></div>
        <Link to={sourceHref(citation)} onClick={onClose} className="inline-block px-3 py-1.5 rounded-lg bg-accent-primary text-white text-sm hover:bg-accent-hover">Open in domain →</Link>
      </div>
    </div>
  )
}
