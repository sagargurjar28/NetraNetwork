import { cn } from '@/utils/cn'
import React from 'react'
export function IconButton({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('inline-flex items-center justify-center w-9 h-9 rounded-control bg-[#10161c] border border-[rgba(255,255,255,0.06)] text-[#8b98a5] hover:text-[#e6edf3] hover:bg-[#161d24] transition-colors focus-visible:ring-2 focus-visible:ring-[#dc2626] disabled:opacity-50', className)} {...props}>{children}</button>
}
