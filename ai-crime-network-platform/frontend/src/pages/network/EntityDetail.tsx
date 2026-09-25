import { useParams, Link } from 'react-router-dom'
import { useEntity } from '@/hooks/queries/useNetwork'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Skeleton } from '@/components/ui/Skeleton'

export default function EntityDetail(){
  const { id } = useParams(); const { data, isLoading } = useEntity(id!)
  if(isLoading) return <Skeleton className="h-64"/>
  if(!data) return <div className="text-sm text-[#ef4444]">Not found</div>
  return (
    <div className="space-y-4">
      <Breadcrumb items={[{label:'Entities', href:'/network/entities'}, {label:data.name}]}/>
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 col-span-1 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#161d24] overflow-hidden mb-3">{data.photo? <img src={data.photo} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-xl">{data.name[0]}</div>}</div>
          <h2 className="font-semibold text-[#e6edf3]">{data.name}</h2>
          <div className="text-xs font-mono text-[#5a6672]">{data.id}</div>
          <Badge variant={data.risk==='High'?'danger':'warning'} className="mt-2">{data.risk} Risk</Badge>
          <div className="text-sm text-[#8b98a5] mt-3">Aliases: {data.aliases.join(', ')||'—'}<br/>Phone: {data.phone}<br/>Last seen: {data.lastSeen}</div>
        </Card>
        <div className="col-span-2 space-y-4">
          <Card className="p-4"><h3 className="font-medium text-[#e6edf3] mb-2">Relations</h3><div className="space-y-2">{data.associates.map((a:string)=> <div key={a} className="flex items-center justify-between p-2 rounded-lg bg-[#0b1015] border border-[rgba(255,255,255,0.06)] text-sm text-[#8b98a5] font-mono">{a} <Link to={'/network/entities/'+a} className="text-[#dc2626]">View</Link></div>)} {data.associates.length===0 && <div className="text-xs text-[#5a6672]">No associates</div>}</div></Card>
          <Card className="p-4"><h3 className="font-medium text-[#e6edf3] mb-2">Timeline</h3><div className="space-y-2 text-sm text-[#8b98a5]"><div>2024-11-02 — Sighted near sector 7</div><div>2024-10-28 — Call with ENT-002 (12 mins)</div><div>2024-09-12 — Linked to case C-2024-018</div></div></Card>
          <Card className="p-4"><h3 className="font-medium text-[#e6edf3] mb-2">Linked Documents & Cases</h3><div className="text-sm text-[#8b98a5]">Cases: {data.cases.join(', ')} • <Link to="/documents/library" className="text-[#dc2626]">View documents</Link></div></Card>
        </div>
      </div>
    </div>
  )
}
