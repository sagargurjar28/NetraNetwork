import { cn } from '@/utils/cn'
import React, { useEffect } from 'react'
import { X } from 'lucide-react'
export function Modal({ open, onClose, title, children, className }: {open:boolean, onClose:()=>void, title?:string, children:React.ReactNode, className?:string}) {
  useEffect(()=>{ if(open){ const h=(e:KeyboardEvent)=> e.key==="Escape" && onClose(); window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h)}},[open,onClose])
  if(!open) return null
  return <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden/>
    <div role="dialog" aria-modal="true" className={cn('relative bg-[#0a0e12] border border-[rgba(255,255,255,0.08)] rounded-panel shadow-soft max-w-lg w-full mx-4 max-h-[90vh] overflow-auto', className)}>
      {title && <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)]"><h3 className="font-semibold text-[#e6edf3]">{title}</h3><button onClick={onClose} aria-label="Close" className="p-1 hover:bg-[#161d24] rounded-chip"><X size={18}/></button></div>}
      <div className="p-6">{children}</div>
    </div>
  </div>
}
