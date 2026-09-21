import { cn } from '@/utils/cn'
import React from 'react'
export function Table({ columns, data, onRowClick, className }: {columns:{key:string,header:string,render?:(row:any)=>React.ReactNode}[], data:any[], onRowClick?:(row:any)=>void, className?:string}) {
  return <div className={cn('overflow-auto rounded-panel border border-[rgba(255,255,255,0.06)]', className)}>
    <table className="w-full text-sm">
      <thead className="bg-[#10161c] text-[#8b98a5] text-xs uppercase tracking-wider"><tr>{columns.map(c=> <th key={c.key} className="px-4 py-3 text-left font-medium whitespace-nowrap">{c.header}</th>)}</tr></thead>
      <tbody className="divide-y divide-[rgba(255,255,255,0.06)] bg-[#0a0e12]">{data.map((row,i)=> <tr key={i} onClick={()=>onRowClick?.(row)} className={cn('hover:bg-[#10161c] transition-colors', onRowClick && 'cursor-pointer')} >{columns.map(c=> <td key={c.key} className="px-4 py-3 text-[#e6edf3] whitespace-nowrap">{c.render? c.render(row) : row[c.key]}</td>)}</tr>)}</tbody>
    </table>
  </div>
}
