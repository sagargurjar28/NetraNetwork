import { useEffect, useState } from 'react'
import client from '@/services/api/client'
import { documentsApi } from '@/services/api'
import { isMock } from '@/mocks/helpers'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Link } from 'react-router-dom'
import { LayoutGrid, List } from 'lucide-react'

type DocRow = { id: string; filename: string; createdAt?: string; docHash?: string; ipfsCid?: string | null; txHash?: string | null }

export default function Library() {
  const [q, setQ] = useState(''); const [view, setView] = useState<'grid' | 'list'>('grid')
  const [docs, setDocs] = useState<DocRow[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        let list: DocRow[] = []
        if (isMock()) {
          const res = await documentsApi.list({ q })
          list = (res?.data || []).map((d: any) => ({ id: d.id, filename: d.name, createdAt: d.date }))
        } else {
          const { data } = await client.get('/documents/', { params: { limit: 100 } })
          list = Array.isArray(data) ? data : []
        }
        if (q) list = list.filter((d) => d.filename?.toLowerCase().includes(q.toLowerCase()))
        if (!cancelled) setDocs(list)
      } catch (err) { console.error('[documents] fetch', err); if (!cancelled) setDocs([]) }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [q])
  if (loading) return <Skeleton className="h-64" />
  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <Input placeholder="Search documents..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <div className="ml-auto flex gap-1 p-1 bg-surface-1 rounded-lg border border-[rgba(255,255,255,0.06)]">
          <button onClick={() => setView('grid')} aria-label="Grid view" className={'p-1.5 rounded ' + (view === 'grid' ? 'bg-surface-3 text-text-primary' : 'text-text-secondary')}><LayoutGrid size={16} /></button>
          <button onClick={() => setView('list')} aria-label="List view" className={'p-1.5 rounded ' + (view === 'list' ? 'bg-surface-3 text-text-primary' : 'text-text-secondary')}><List size={16} /></button>
        </div>
      </div>
      {docs.length === 0 ? <EmptyState title="No documents yet" description="No documents match your filters. Upload your first document." actionLabel="Upload document" onAction={() => (window.location.href = '/documents/upload')} /> :
        view === 'grid' ?
          <div className="grid grid-cols-3 gap-4">{docs.map((d: DocRow) => <Link key={d.id} to={'/documents/' + d.id}><Card className="p-4 hover:border-accent-primary/30 transition-colors"><div className="font-medium text-sm text-text-primary truncate">{d.filename}</div><div className="text-xs font-mono text-text-muted mt-1">{d.createdAt ? String(d.createdAt).slice(0, 10) : ''}{d.docHash ? ` • ${d.docHash.slice(0, 12)}...` : ''}</div><div className="flex gap-2 mt-3">{d.ipfsCid ? <Badge variant="info">IPFS</Badge> : null}{d.txHash ? <Badge variant="success">Chain</Badge> : null}</div></Card></Link>)}</div> :
          <Card className="divide-y divide-[rgba(255,255,255,0.06)]">{docs.map((d: DocRow) => <Link key={d.id} to={'/documents/' + d.id} className="flex items-center justify-between p-4 hover:bg-surface-2"><div><div className="text-sm text-text-primary font-mono">{d.filename}</div><div className="text-xs text-text-secondary">{d.createdAt ? String(d.createdAt).slice(0, 10) : ''}{d.docHash ? ` • ${d.docHash.slice(0, 12)}...` : ''}</div></div><div className="flex gap-2">{d.ipfsCid ? <Badge variant="info">IPFS</Badge> : null}{d.txHash ? <Badge variant="success">Chain</Badge> : null}</div></Link>)}</Card>
      }
    </div>
  )
}
