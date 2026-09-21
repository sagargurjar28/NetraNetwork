import { cn } from '@/utils/cn'
import React from 'react'
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & {label?:string, error?:string}>(({label,error,className,id,...props},ref)=>{
  const iid=id||label?.toLowerCase().replace(/\s+/g,"-")
  return <div className="flex flex-col gap-1.5">
    {label && <label htmlFor={iid} className="text-sm font-medium text-[#8b98a5]">{label}</label>}
    <textarea ref={ref} id={iid} className={cn('min-h-[80px] w-full rounded-control bg-[#0b1015] border border-[rgba(255,255,255,0.06)] px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#5a6672] focus:outline-none focus:border-[#dc2626]', error && 'border-[#ef4444]', className)} {...props}/>
    {error && <span className="text-xs text-[#ef4444]">{error}</span>}
  </div>
})
Textarea.displayName='Textarea'
