import { cn } from '@/utils/cn'
import React from 'react'
const variants:Record<string,string> = {
  default:'bg-[#161d24] text-[#8b98a5] border border-[rgba(255,255,255,0.06)]',
  primary:'bg-[#dc2626]/15 text-[#dc2626] border border-[#dc2626]/30',
  success:'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30',
  warning:'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30',
  danger:'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30',
  info:'bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/30',
}
export function Badge({ variant='default', className, children }: {variant?:string, className?:string, children:React.ReactNode}) {
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant]||variants.default, className)}>{children}</span>
}
