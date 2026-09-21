import React from 'react'
export function Radio({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & {label?:string}) {
  return <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-[#e6edf3]">
    <input type="radio" className="w-4 h-4 border-[rgba(255,255,255,0.12)] bg-[#0b1015] text-[#dc2626] focus:ring-[#dc2626]" {...props}/>
    {label}
  </label>
}
export function RadioGroup({ children, className }: {children:React.ReactNode, className?:string}) {
  return <div className={className}>{children}</div>
}
