import { cn } from '@/utils/cn'
export function ProgressBar({ value, className }: {value:number,className?:string}) {
  return <div className={cn('h-2 w-full bg-[#161d24] rounded-full overflow-hidden', className)}><div className="h-full bg-[#dc2626] transition-all" style={{width: value+"%"}}/></div>
}
