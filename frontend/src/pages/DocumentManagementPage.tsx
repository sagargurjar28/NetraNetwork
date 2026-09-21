import { Card } from '@/components/ui/Card'
import { useDocumentStats, useDocuments } from '@/hooks/queries/useDocuments'
import { Skeleton } from '@/components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { FileText, Clock, Flag, HardDrive } from 'lucide-react'

export default function DocsHome(){
  const { data:stats, isLoading } = useDocumentStats()
  const { data:docs } = useDocuments()
  return (
    <div className="space-y-6">
      {isLoading ? <Skeleton className="h-24"/> :
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 flex justify-between items-center"><div><div className="text-xs text-[#8b98a5]">Total Docs</div><div className="text-2xl font-bold text-[#e6edf3]">{stats.totalDocs}</div></div><FileText className="text-[#8b98a5]"/></Card>
          <Card className="p-4 flex justify-between items-center"><div><div className="text-xs text-[#8b98a5]">Pending Verification</div><div className="text-2xl font-bold text-[#f59e0b]">{stats.pending}</div></div><Clock className="text-[#f59e0b]"/></Card>
          <Card className="p-4 flex justify-between items-center"><div><div className="text-xs text-[#8b98a5]">Flagged</div><div className="text-2xl font-bold text-[#ef4444]">{stats.flagged}</div></div><Flag className="text-[#ef4444]"/></Card>
          <Card className="p-4 flex justify-between items-center"><div><div className="text-xs text-[#8b98a5]">Storage Used</div><div className="text-2xl font-bold text-[#22c55e]">{stats.storage}</div></div><HardDrive className="text-[#22c55e]"/></Card>
        </div>
      }
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex justify-between mb-3"><h3 className="font-medium text-[#e6edf3]">Recent Uploads</h3><Link to="/documents/library" className="text-sm text-[#dc2626]">Library</Link></div>
          <div className="space-y-2">{(docs?.data||[]).slice(0,3).map((d:any)=> <div key={d.id} className="p-2 rounded-lg bg-[#0b1015] border border-[rgba(255,255,255,0.06)] text-sm text-[#e6edf3] font-mono">{d.name} <span className="text-xs text-[#8b98a5]">• {d.status}</span></div>)}</div>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <h3 className="font-medium text-[#e6edf3] mb-3">Quick Actions</h3>
          <Link to="/documents/upload"><Button>Upload Document</Button></Link>
          <div className="text-xs text-[#5a6672] mt-3">Supported: PDF, DOCX, PNG, JPG • Max 25MB</div>
        </Card>
      </div>
    </div>
  )
}
