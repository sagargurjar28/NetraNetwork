import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { adminApi } from '@/services/api'
import { useQuery } from '@tanstack/react-query'

export default function Admin(){
  const { data:users } = useQuery({ queryKey:['admin-users'], queryFn:()=> adminApi.listUsers() })
  const { data:logs } = useQuery({ queryKey:['admin-logs'], queryFn:()=> adminApi.auditLogs() })
  const { data:health } = useQuery({ queryKey:['admin-health'], queryFn:()=> adminApi.health() })
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {health && Object.entries(health).map(([k,v])=> <Card key={k} className="p-4"><div className="text-xs text-[#8b98a5] uppercase">{k}</div><div className="text-sm font-mono text-[#22c55e] mt-1">{String(v)}</div></Card>)}
      </div>
      <Card className="p-4">
        <h3 className="font-medium text-[#e6edf3] mb-3">Users & Roles</h3>
        <Table columns={[
          {key:'name',header:'Name'},
          {key:'email',header:'Email'},
          {key:'role',header:'Role', render:(r:any)=> <Badge variant={r.role==='admin'?'danger':'info'}>{r.role}</Badge>},
          {key:'lastActive',header:'Last Active'},
        ]} data={users||[]}/>
      </Card>
      <Card className="p-4">
        <h3 className="font-medium text-[#e6edf3] mb-3">Audit Log</h3>
        <Table columns={[
          {key:'action',header:'Action', render:(r:any)=> <span className="font-mono text-xs">{r.action}</span>},
          {key:'user',header:'User'},
          {key:'target',header:'Target', render:(r:any)=> <span className="font-mono text-xs">{r.target}</span>},
          {key:'time',header:'Time'},
          {key:'ip',header:'IP', render:(r:any)=> <span className="font-mono text-xs">{r.ip}</span>},
        ]} data={logs||[]}/>
      </Card>
    </div>
  )
}
