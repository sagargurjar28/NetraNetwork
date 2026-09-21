import { cn } from '@/utils/cn'
import React from 'react'
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-panel bg-[#0a0e12] border border-[rgba(255,255,255,0.04)] hover:shadow-card transition-shadow', className)} {...props}>{children}</div>
}
export function Panel({ className, children, title, ...props }: React.HTMLAttributes<HTMLDivElement> & {title?:string}) {
  return <div className={cn('rounded-panel bg-[#10161c] border border-[rgba(255,255,255,0.06)]', className)} {...props}>
    {title && <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] font-medium text-sm text-[#e6edf3]">{title}</div>}
    <div className="p-4">{children}</div>
  </div>
}
