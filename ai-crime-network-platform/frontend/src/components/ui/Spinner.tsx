import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'
export function Spinner({ size='md', className }: {size?:'sm'|'md'|'lg', className?:string}) {
  const s = size==='sm'? 'w-4 h-4' : size==='lg'? 'w-8 h-8' : 'w-6 h-6'
  return <Loader2 className={cn('animate-spin text-[#8b98a5]', s, className)} />
}
