export function Pagination({ page, totalPages, onChange }: {page:number,totalPages:number,onChange:(p:number)=>void}) {
  return <div className="flex items-center gap-1">
    <button disabled={page<=1} onClick={()=>onChange(page-1)} className="px-3 py-1 rounded-control bg-[#10161c] border border-[rgba(255,255,255,0.06)] text-sm disabled:opacity-50">Prev</button>
    <span className="px-3 py-1 text-sm text-[#8b98a5]">{page} / {totalPages}</span>
    <button disabled={page>=totalPages} onClick={()=>onChange(page+1)} className="px-3 py-1 rounded-control bg-[#10161c] border border-[rgba(255,255,255,0.06)] text-sm disabled:opacity-50">Next</button>
  </div>
}
