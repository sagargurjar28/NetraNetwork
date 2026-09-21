import React, { useState } from 'react'
export function Tooltip({ content, children }: {content:string, children:React.ReactNode}) {
  const [show,setShow]=useState(false)
  return <span className="relative inline-flex" onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)} onFocus={()=>setShow(true)} onBlur={()=>setShow(false)}>
    {children}
    {show && <span role="tooltip" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-chip bg-[#161d24] border border-[rgba(255,255,255,0.08)] text-xs text-[#e6edf3] whitespace-nowrap z-50">{content}</span>}
  </span>
}
