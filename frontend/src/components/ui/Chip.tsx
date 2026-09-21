import { cn } from '@/utils/cn'
import React from 'react'
export function Chip({ children, selected, onClick, className }: {children:React.ReactNode, selected?:boolean, onClick?:()=>void, className?:string}) {
  return <button onClick={onClick} className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors', selected?'bg-[#dc2626] text-white border-[#dc2626]':'bg-[#10161c] text-[#8b98a5] border-[rgba(255,255,255,0.06)] hover:bg-[#161d24]', className)}>{children}</button>
}
