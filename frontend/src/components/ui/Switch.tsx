import { cn } from '@/utils/cn'
import React from 'react'
export function Switch({ checked, onCheckedChange, label }: {checked?:boolean, onCheckedChange?:(v:boolean)=>void, label?:string}) {
  return <label className="inline-flex items-center gap-2 cursor-pointer">
    <button role="switch" aria-checked={checked} onClick={()=>onCheckedChange?.(!checked)} className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', checked?'bg-[#dc2626]':'bg-[#161d24] border border-[rgba(255,255,255,0.08)]')}>
      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition', checked?'translate-x-6':'translate-x-1')}/>
    </button>
    {label && <span className="text-sm text-[#e6edf3]">{label}</span>}
  </label>
}
