import { cn } from '@/utils/cn'
import React from 'react'
import { X } from 'lucide-react'
export function Drawer({ open, onClose, title, children, side='right', className }: {open:boolean,onClose:()=>void,title?:string,children:React.ReactNode,side?:'left'|'right',className?:string}) {
  if(!open) return null
  return <div className="fixed inset-0 z-50 flex">
    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
    <div className={cn('w-[420px] max-w-[90vw] bg-[#0a0e12] border-l border-[rgba(255,255,255,0.08)] shadow-soft flex flex-col overflow-hidden', side==='left' && 'border-l-0 border-r', className)}>
      {title && <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]"><h3 className="font-semibold text-[#e6edf3]">{title}</h3><button onClick={onClose} aria-label="Close" className="p-1 hover:bg-[#161d24] rounded"><X size={18}/></button></div>}
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  </div>
}
