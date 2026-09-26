import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '@/services/api/client'
import { networkApi } from '@/services/api'
import { isMock } from '@/mocks/helpers'
import { Table } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'

export default function Entities(){
  const [q,setQ]=useState(''); const [page,setPage]=useState(1)
  const [rows,setRows]=useState<any[]>([]); const [loading,setLoading]=useState(true)
  const nav=useNavigate()
  useEffect(()=>{
    let cancelled=false
    setLoading(true)
    ;(async()=>{
      try{
        let list:any[]=[]
        if(isMock()){
          const res=await networkApi.getEntities({q})
          list=(res?.data||[]).map((e:any)=>({id:e.id,name:e.name,type:e.type,color:e.color}))
        }else{
          const {data}=await client.get('/network/entities',{params:q?{q}:undefined})
          list=Array.isArray(data)?data:[]
        }
        if(!cancelled) setRows(list)
      }catch(err){ console.error('[entities] fetch',err); if(!cancelled) setRows([]) }
      finally{ if(!cancelled) setLoading(false) }
    })()
    return ()=>{cancelled=true}
  },[q])
  const pageSize=5; const total=Math.max(1, Math.ceil(rows.length/pageSize)); const paged=rows.slice((page-1)*pageSize, page*pageSize)
  if(loading) return <Skeleton className="h-64"/>
  if(!rows.length) return (
    <div className="space-y-4">
      <Input placeholder="Search entities..." value={q} onChange={e=>{ setQ(e.target.value); setPage(1)}} className="max-w-sm"/>
      <EmptyState title="No entities yet" description="Try adjusting search" />
    </div>
  )
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input placeholder="Search entities..." value={q} onChange={e=>{ setQ(e.target.value); setPage(1)}} className="max-w-sm"/>
      </div>
      <Table columns={[
        { key:'id', header:'ID', render:(r:any)=> <span className="font-mono text-xs text-[#8b98a5]">{r.id}</span>},
        { key:'name', header:'Name', render:(r:any)=> <span className="inline-flex items-center gap-2">{r.color ? <span className="h-2.5 w-2.5 rounded-full" style={{background:r.color}}/> : null}{r.name}</span>},
        { key:'type', header:'Type' },
      ]} data={paged} onRowClick={(r)=> nav('/network/entities/'+r.id)}/>
      <div className="flex justify-end"><Pagination page={page} totalPages={total} onChange={setPage}/></div>
    </div>
  )
}
