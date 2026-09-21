import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'
export function Dropdown({ trigger, children, className }: {trigger:React.ReactNode, children:React.ReactNode, className?:string}) {
  const [open,setOpen]=useState(false)
  const ref=useRef<HTMLDivElement>(null)
  useEffect(()=>{ const h=(e:MouseEvent)=>{ if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false)}; document.addEventListener('mousedown',h); return ()=>document.removeEventListener('mousedown',h)},[])
  return <div ref={ref} className="relative inline-block">
    <div onClick={()=>setOpen(!open)}>{trigger}</div>
    {open && <div className={cn('absolute right-0 mt-2 min-w-[180px] bg-[#10161c] border border-[rgba(255,255,255,0.08)] rounded-control shadow-xl py-1 z-50', className)}>{children}</div>}
  </div>
}
export function DropdownItem({ children, onClick, className }: {children:React.ReactNode,onClick?:()=>void,className?:string}) {
  return <button onClick={onClick} className={cn('w-full text-left px-3 py-2 text-sm text-[#e6edf3] hover:bg-[#161d24]',className)}>{children}</button>
}
