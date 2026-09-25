import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'
export function ErrorState({ message='Something went wrong', onRetry }: {message?:string,onRetry?:()=>void}) {
  return <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-[#ef4444]/20 rounded-panel bg-[#ef4444]/5">
    <AlertTriangle className="text-[#ef4444] mb-3"/>
    <h4 className="font-medium text-[#e6edf3]">Error</h4>
    <p className="text-sm text-[#8b98a5] mt-1">{message}</p>
    {onRetry && <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>Retry</Button>}
  </div>
}
