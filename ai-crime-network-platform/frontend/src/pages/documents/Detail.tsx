import { useParams } from 'react-router-dom'
import { useDocument } from '@/hooks/queries/useDocuments'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Skeleton } from '@/components/ui/Skeleton'

export default function DocumentDetail(){
  const { id } = useParams(); const { data, isLoading } = useDocument(id!)
  if(isLoading) return <Skeleton className="h-64"/>
  if(!data) return <div>Not found</div>
  return (
    <div className="space-y-4">
      <Breadcrumb items={[{label:'Library', href:'/documents/library'}, {label:data.name}]}/>
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 col-span-1 space-y-3">
          <h3 className="font-medium text-[#e6edf3]">Metadata</h3>
          <div className="text-sm space-y-1 text-[#8b98a5]"><div>Name: <span className="text-[#e6edf3] font-mono">{data.name}</span></div><div>Type: {data.type}</div><div>Classification: {data.classification}</div><div>Case: {data.caseRef}</div><div>Uploaded By: {data.uploadedBy}</div><div>Date: {data.date}</div><div>Size: {data.size}</div></div>
          <Badge variant={data.status==='Verified'?'success':'warning'}>{data.status}</Badge>
          <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]"><h4 className="text-xs font-medium text-[#e6edf3] mb-1">Version History</h4><div className="text-xs text-[#8b98a5]">v1 — 2024-10-11 • Verified<br/>v0 — 2024-10-10 • Uploaded</div></div>
        </Card>
        <div className="col-span-2 space-y-4">
          <Card className="p-4"><h3 className="font-medium text-[#e6edf3] mb-2">Preview</h3><div className="h-64 rounded bg-[#0b1015] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-sm text-[#5a6672]">PDF Preview Placeholder — {data.name}</div></Card>
          <Card className="p-4"><h3 className="font-medium text-[#e6edf3] mb-2">Verification Status</h3><div className="text-sm text-[#22c55e]">✓ Hash verified on chain • IPFS pinned</div><div className="text-xs font-mono text-[#8b98a5] mt-1">Hash: 0xabc...123 • CID: QmXy... • Tx: 0x9f...</div></Card>
          <Card className="p-4"><h3 className="font-medium text-[#e6edf3] mb-2">Audit Trail</h3><div className="text-sm text-[#8b98a5] space-y-1"><div>2024-10-11 10:32 — Verified by SI Meena</div><div>2024-10-11 09:15 — Uploaded by Insp. Arjun</div></div></Card>
        </div>
      </div>
    </div>
  )
}
