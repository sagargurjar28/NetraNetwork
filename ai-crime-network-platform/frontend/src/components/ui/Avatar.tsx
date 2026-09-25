import { cn } from '@/utils/cn'
export function Avatar({ src, name, size='md', className }: {src?:string,name?:string,size?:'sm'|'md'|'lg',className?:string}) {
  const s = size==='sm'?'w-8 h-8 text-xs': size==='lg'?'w-12 h-12 text-base':'w-10 h-10 text-sm'
  return <div className={cn('rounded-full bg-[#161d24] border border-[rgba(255,255,255,0.06)] flex items-center justify-center overflow-hidden font-medium text-[#8b98a5]', s, className)}>
    {src ? <img src={src} alt={name} className="w-full h-full object-cover"/> : (name?.[0]||'?').toUpperCase()}
  </div>
}
