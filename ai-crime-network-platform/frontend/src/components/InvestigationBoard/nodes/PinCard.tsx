import { Handle, Position } from '@xyflow/react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/** Shared node shell: colored header strip, left+right handles, hover lift, selected red border. */
export function PinCard({
  color,
  selected,
  header,
  children,
  capsules,
}: {
  color: string
  selected: boolean
  header: ReactNode
  children?: ReactNode
  capsules?: ReactNode
}) {
  return (
    <div className="group relative">
      <div
        className={cn(
          'w-[210px] rounded-panel border bg-surface-2 shadow-card transition-transform hover:scale-[1.02]',
          selected ? 'border-accent-primary' : 'border-[rgba(255,255,255,0.08)]',
        )}
      >
        <div className="h-1.5 rounded-t-panel" style={{ background: color }} />
        <div className="p-2.5">{header}</div>
        {children}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-text-muted !border-surface-1" />
      <Handle type="source" position={Position.Right} className="!bg-text-muted !border-surface-1" />
      {capsules && (
        <div className="nodrag pointer-events-none absolute left-1/2 top-full z-10 hidden w-max max-w-[260px] -translate-x-1/2 pt-2 group-hover:block">
          <div className="pointer-events-auto flex flex-wrap gap-1 rounded-control border border-[rgba(255,255,255,0.08)] bg-surface-1 p-2 shadow-soft">
            {capsules}
          </div>
        </div>
      )}
    </div>
  )
}

export function Capsule({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.08)] bg-surface-3 px-2 py-0.5 text-[11px] text-text-secondary">
      {children}
    </span>
  )
}
