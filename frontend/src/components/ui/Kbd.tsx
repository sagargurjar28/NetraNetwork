import { cn } from '@/utils/cn'
export function Kbd({ children, className }: {children:React.ReactNode, className?:string}) {
  return <kbd className={cn('px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.12)] bg-[#161d24] text-xs font-mono text-[#8b98a5]', className)}>{children}</kbd>
}
