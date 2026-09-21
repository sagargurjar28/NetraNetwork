import { cn } from '@/utils/cn'
export function Tabs({ tabs, active, onChange }: {tabs:{key:string,label:string}[], active:string, onChange:(k:string)=>void}) {
  return <div className="flex gap-1 p-1 bg-[#0b1015] rounded-control border border-[rgba(255,255,255,0.06)]">
    {tabs.map(t=> <button key={t.key} onClick={()=>onChange(t.key)} className={cn('px-3 py-1.5 rounded-control text-sm font-medium transition-colors', active===t.key ? 'bg-[#161d24] text-[#e6edf3] shadow' : 'text-[#8b98a5] hover:text-[#e6edf3]')}>{t.label}</button>)}
  </div>
}
