import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
export function Breadcrumb({ items }: {items:{label:string,href?:string}[]}) {
  return <nav className="flex items-center gap-1 text-sm text-[#8b98a5]" aria-label="Breadcrumb">
    {items.map((it,i)=> <span key={i} className="flex items-center gap-1">{it.href? <Link to={it.href} className="hover:text-[#e6edf3]">{it.label}</Link> : <span className="text-[#e6edf3]">{it.label}</span>}{i<items.length-1 && <ChevronRight size={14}/>}</span>)}
  </nav>
}
