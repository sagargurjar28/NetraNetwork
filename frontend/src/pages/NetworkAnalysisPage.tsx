import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useNetworkStats, useCases } from '@/hooks/queries/useNetwork'
import { Skeleton } from '@/components/ui/Skeleton'
import { ArrowRight, AlertTriangle, Users, Link2, FileWarning } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip as RTooltip } from 'recharts'

export default function NetworkHome(){
  const { data:stats, isLoading } = useNetworkStats()
  const { data:casesData } = useCases()
  const kpis = stats ? [
    { label:'Active Cases', value: stats.activeCases, icon: FileWarning, color:'primary' },
    { label:'Entities Tracked', value: stats.entitiesTracked, icon: Users, color:'info' },
    { label:'Links Discovered', value: stats.linksDiscovered, icon: Link2, color:'success' },
    { label:'High-Risk Flags', value: stats.highRiskFlags, icon: AlertTriangle, color:'danger' },
  ] : []
  return (
    <div className="space-y-6">
      {isLoading ? <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=> <Skeleton key={i} className="h-28"/>)}</div> :
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(k=> <Card key={k.label} className="p-4 flex items-center justify-between"><div><div className="text-xs text-[#8b98a5]">{k.label}</div><div className="text-2xl font-bold text-[#e6edf3] mt-1">{k.value}</div></div><div className="w-10 h-10 rounded-lg bg-[#161d24] flex items-center justify-center"><k.icon size={18} className="text-[#8b98a5]"/></div></Card>)}
        </div>}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 col-span-2">
          <div className="flex items-center justify-between mb-4"><h3 className="font-medium text-[#e6edf3]">Recent Cases</h3><Link to="/network/cases" className="text-sm text-[#dc2626] flex items-center gap-1">View all <ArrowRight size={14}/></Link></div>
          <div className="space-y-3">
            {(casesData?.data||[]).slice(0,3).map((c:any)=> <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-[#10161c] border border-[rgba(255,255,255,0.06)]">
              <div><div className="font-medium text-sm text-[#e6edf3]">{c.title}</div><div className="text-xs text-[#8b98a5] font-mono">{c.id} • {c.officer}</div></div><Badge variant={c.priority==='High'?'danger': c.priority==='Medium'?'warning':'default'}>{c.status}</Badge>
            </div>)}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium text-[#e6edf3] mb-4">Weekly Links</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{name:'Mon',v:12},{name:'Tue',v:19},{name:'Wed',v:8},{name:'Thu',v:22},{name:'Fri',v:16}]}>
                <XAxis dataKey="name" tick={{fill:'#8b98a5', fontSize:12}} axisLine={false} tickLine={false}/>
                <RTooltip contentStyle={{background:'#10161c', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, color:'#e6edf3'}}/>
                <Bar dataKey="v" fill="#dc2626" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2 mt-4">
            <Link to="/network/graph"><Button size="sm">Open Graph</Button></Link>
            <Link to="/network/entities"><Button size="sm" variant="secondary">Entities</Button></Link>
          </div>
        </Card>
      </div>
      <Card className="p-4">
        <h3 className="font-medium text-[#e6edf3] mb-2">Mini Graph Preview</h3>
        <div className="h-48 rounded-lg bg-[#0b1015] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-sm text-[#5a6672]">Force Graph Preview — <Link to="/network/graph" className="text-[#dc2626] ml-1">Open full explorer</Link></div>
      </Card>
    </div>
  )
}
