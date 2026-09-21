import { Inbox } from 'lucide-react'
import { Button } from './Button'
export function EmptyState({ title='No data', description, actionLabel, onAction }: {title?:string,description?:string,actionLabel?:string,onAction?:()=>void}) {
  return <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-[rgba(255,255,255,0.08)] rounded-panel bg-[#0a0e12]/60">
    <div className="w-12 h-12 rounded-full bg-[#161d24] flex items-center justify-center mb-4"><Inbox className="text-[#8b98a5]"/></div>
    <h4 className="font-medium text-[#e6edf3]">{title}</h4>
    {description && <p className="text-sm text-[#8b98a5] mt-1 max-w-sm">{description}</p>}
    {actionLabel && <Button variant="primary" size="sm" className="mt-4" onClick={onAction}>{actionLabel}</Button>}
  </div>
}
