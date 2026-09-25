import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCases } from '@/hooks/queries/useNetwork'
import { Table } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export default function Cases() {
  const [q, setQ] = useState('')
  const { data, isLoading } = useCases(q)
  const nav = useNavigate()
  if (isLoading) return <Skeleton className="h-64" />
  const rows = data?.data || []
  if (!rows.length) return (
    <div className="space-y-4">
      <Input placeholder="Search cases..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <EmptyState title="No cases found" description="No cases match your search. Create a case or clear filters." actionLabel="Clear search" onAction={() => setQ('')} />
    </div>
  )
  return (
    <div className="space-y-4">
      <Input placeholder="Search cases..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <Table columns={[
        { key: 'id', header: 'ID', render: (r: any) => <span className="font-mono text-xs">{r.id}</span> },
        { key: 'title', header: 'Title' },
        { key: 'status', header: 'Status', render: (r: any) => <Badge variant={r.status === 'Open' ? 'danger' : 'default'}>{r.status}</Badge> },
        { key: 'priority', header: 'Priority', render: (r: any) => <Badge variant={r.priority === 'High' ? 'danger' : r.priority === 'Medium' ? 'warning' : 'info'}>{r.priority}</Badge> },
        { key: 'officer', header: 'Officer' },
        { key: 'created', header: 'Created' },
      ]} data={rows} onRowClick={(r) => nav('/network/cases/' + r.id)} />
    </div>
  )
}
