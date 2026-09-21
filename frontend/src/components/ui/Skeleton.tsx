import { cn } from '@/utils/cn'
export function Skeleton({ className }: {className?:string}) {
  return <div className={cn('animate-pulse rounded-control bg-[#161d24]', className)} />
}
