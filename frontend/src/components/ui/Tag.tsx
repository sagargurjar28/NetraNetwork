import { cn } from '@/utils/cn'
import React from 'react'
export function Tag({ children, className }: {children:React.ReactNode, className?:string}) {
  return <span className={cn('inline-flex items-center px-2 py-1 rounded-control bg-[#10161c] border border-[rgba(255,255,255,0.06)] text-xs text-[#8b98a5]', className)}>{children}</span>
}
