import { cn } from '@/utils/cn'
import React from 'react'
export function Select({ label, error, children, className, id, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & {label?:string, error?:string}) {
  const iid=id||label?.toLowerCase().replace(/\s+/g,"-")
  return <div className="flex flex-col gap-1.5">
    {label && <label htmlFor={iid} className="text-sm font-medium text-[#8b98a5]">{label}</label>}
    <select id={iid} className={cn('h-9 w-full rounded-control bg-[#0b1015] border border-[rgba(255,255,255,0.06)] px-3 text-sm text-[#e6edf3] focus:outline-none focus:border-[#dc2626]', className)} {...props}>{children}</select>
    {error && <span className="text-xs text-[#ef4444]">{error}</span>}
  </div>
}
