import { useState } from 'react'
import { useDocuments } from '@/hooks/queries/useDocuments'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Link } from 'react-router-dom'
import { LayoutGrid, List } from 'lucide-react'

export default function Library() {
  const [q, setQ] = useState(''); const [view, setView] = useState<'grid' | 'list'>('grid'); const [type, setType] = useState('all')
  const { data, isLoading } = useDocuments(q)
  let docs = data?.data || []
  if (type !== 'all') docs = docs.filter((d: any) => d.type === type)
  if (isLoading) return <Skeleton className="h-64" />
  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <Input placeholder="Search documents..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <Select value={type} onChange={(e) => setType((e.target as HTMLSelectElement).value)}><option value="all">All Types</option><option value="FIR">FIR</option><option value="Memo">Memo</option><option value="Report">Report</option></Select>
        <div className="ml-auto flex gap-1 p-1 bg-surface-1 rounded-lg border border-[rgba(255,255,255,0.06)]">
          <button onClick={() => setView('grid')} aria-label="Grid view" className={'p-1.5 rounded ' + (view === 'grid' ? 'bg-surface-3 text-text-primary' : 'text-text-secondary')}><LayoutGrid size={16} /></button>
          <button onClick={() => setView('list')} aria-label="List view" className={'p-1.5 rounded ' + (view === 'list' ? 'bg-surface-3 text-text-primary' : 'text-text-secondary')}><List size={16} /></button>
        </div>
      </div>
      {docs.length === 0 ? <EmptyState title="No documents" description="No documents match your filters. Upload your first document." actionLabel="Upload document" onAction={() => (window.location.href = '/documents/upload')} /> :
        view === 'grid' ?
          <div className="grid grid-cols-3 gap-4">{docs.map((d: any) => <Link key={d.id} to={'/documents/' + d.id}><Card className="p-4 hover:border-accent-primary/30 transition-colors"><div className="font-medium text-sm text-text-primary truncate">{d.name}</div><div className="text-xs font-mono text-text-muted mt-1">{d.id} • {d.type} • {d.size}</div><div className="flex gap-2 mt-3"><Badge variant={d.status === 'Verified' ? 'success' : d.status === 'Flagged' ? 'danger' : 'warning'}>{d.status}</Badge><Badge>{d.classification}</Badge></div></Card></Link>)}</div> :
          <Card className="divide-y divide-[rgba(255,255,255,0.06)]">{docs.map((d: any) => <Link key={d.id} to={'/documents/' + d.id} className="flex items-center justify-between p-4 hover:bg-surface-2"><div><div className="text-sm text-text-primary font-mono">{d.name}</div><div className="text-xs text-text-secondary">{d.caseRef} • {d.uploadedBy}</div></div><Badge variant={d.status === 'Verified' ? 'success' : 'warning'}>{d.status}</Badge></Link>)}</Card>
      }
    </div>
  )
}
