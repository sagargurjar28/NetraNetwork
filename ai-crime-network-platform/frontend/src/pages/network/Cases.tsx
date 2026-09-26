import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '@/services/api/client'
import { networkApi } from '@/services/api'
import { isMock } from '@/mocks/helpers'
import { Table } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export default function Cases() {
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        let list: any[] = []
        if (isMock()) {
          const res = await networkApi.getCases({ q })
          list = (res?.data || []).map((c: any) => ({ id: c.id, title: c.title, status: c.status, createdAt: c.created }))
        } else {
          const { data } = await client.get('/network/cases', { params: q ? { q } : undefined })
          list = Array.isArray(data) ? data : []
        }
        if (!cancelled) setRows(list)
      } catch (err) { console.error('[cases] fetch', err); if (!cancelled) setRows([]) }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [q])
  if (loading) return <Skeleton className="h-64" />
  if (!rows.length) return (
    <div className="space-y-4">
      <Input placeholder="Search cases..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <EmptyState title="No cases yet" description="No cases match your search. Create a case or clear filters." actionLabel="Clear search" onAction={() => setQ('')} />
    </div>
  )
  return (
    <div className="space-y-4">
      <Input placeholder="Search cases..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <Table columns={[
        { key: 'id', header: 'ID', render: (r: any) => <span className="font-mono text-xs">{r.id}</span> },
        { key: 'title', header: 'Title' },
        { key: 'status', header: 'Status', render: (r: any) => <Badge variant={r.status === 'Open' || r.status === 'open' ? 'danger' : 'default'}>{r.status}</Badge> },
        { key: 'createdAt', header: 'Created', render: (r: any) => <span>{String(r.createdAt || '').slice(0, 10)}</span> },
      ]} data={rows} onRowClick={(r) => nav('/network/cases/' + r.id)} />
    </div>
  )
}
