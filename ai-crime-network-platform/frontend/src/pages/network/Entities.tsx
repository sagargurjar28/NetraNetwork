import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntities } from '@/hooks/queries/useNetwork'
import { Table } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'

export default function Entities(){
  const [q,setQ]=useState(''); const [page,setPage]=useState(1)
  const { data, isLoading, isError } = useEntities(q)
  const nav=useNavigate()
  const pageSize=5; const rows=data?.data||[]; const total=Math.max(1, Math.ceil(rows.length/pageSize)); const paged=rows.slice((page-1)*pageSize, page*pageSize)
  if(isLoading) return <Skeleton className="h-64"/>
  if(!rows.length) return <EmptyState title="No entities" description="Try adjusting search" />
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input placeholder="Search entities..." value={q} onChange={e=>{ setQ(e.target.value); setPage(1)}} className="max-w-sm"/>
      </div>
      <Table columns={[
        { key:'id', header:'ID', render:(r:any)=> <span className="font-mono text-xs text-[#8b98a5]">{r.id}</span>},
        { key:'name', header:'Name' },
        { key:'type', header:'Type' },
        { key:'risk', header:'Risk', render:(r:any)=> <Badge variant={r.risk==='High'?'danger': r.risk==='Medium'?'warning':'success'}>{r.risk}</Badge>},
        { key:'status', header:'Status' },
        { key:'cases', header:'Cases', render:(r:any)=> r.cases.join(', ')},
      ]} data={paged} onRowClick={(r)=> nav('/network/entities/'+r.id)}/>
      <div className="flex justify-end"><Pagination page={page} totalPages={total} onChange={setPage}/></div>
    </div>
  )
}
