import { cn } from '@/utils/cn'
export function SegmentedControl({ options, value, onChange }: {options:{value:string,label:string}[], value:string, onChange:(v:string)=>void}) {
  return <div className="inline-flex p-1 bg-[#0b1015] rounded-full border border-[rgba(255,255,255,0.06)]">
    {options.map(o=> <button key={o.value} onClick={()=>onChange(o.value)} className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-all', value===o.value ? 'bg-[#dc2626] text-white shadow' : 'text-[#8b98a5] hover:text-[#e6edf3]')}>{o.label}</button>)}
  </div>
}
