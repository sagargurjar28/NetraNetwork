import { useParams } from 'react-router-dom'
import { useCase } from '@/hooks/queries/useNetwork'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Skeleton } from '@/components/ui/Skeleton'

export default function CaseDetail(){
  const { id } = useParams(); const { data, isLoading } = useCase(id!)
  if(isLoading) return <Skeleton className="h-64"/>
  if(!data) return <div>Not found</div>
  return (
    <div className="space-y-4">
      <Breadcrumb items={[{label:'Cases', href:'/network/cases'}, {label:data.title}]}/>
      <Card className="p-6">
        <div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold text-[#e6edf3]">{data.title}</h2><div className="text-xs font-mono text-[#5a6672] mt-1">{data.id} • Officer: {data.officer} • Created: {data.created}</div><p className="text-sm text-[#8b98a5] mt-3">{data.summary}</p></div><Badge variant={data.priority==='High'?'danger':'warning'}>{data.priority}</Badge></div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4"><h3 className="font-medium text-[#e6edf3] mb-2">Entities Involved</h3><div className="text-sm text-[#8b98a5]">3 entities linked — see Entities page</div></Card>
        <Card className="p-4"><h3 className="font-medium text-[#e6edf3] mb-2">Graph Embed</h3><div className="h-32 rounded bg-[#0b1015] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-xs text-[#5a6672]">Mini graph</div></Card>
        <Card className="p-4"><h3 className="font-medium text-[#e6edf3] mb-2">Timeline</h3><div className="text-sm text-[#8b98a5] space-y-1"><div>2024-11-05 — New link discovered</div><div>2024-10-01 — Case opened</div></div></Card>
        <Card className="p-4"><h3 className="font-medium text-[#e6edf3] mb-2">Documents & Notes</h3><div className="text-sm text-[#8b98a5]">2 documents • 5 notes</div></Card>
      </div>
    </div>
  )
}
