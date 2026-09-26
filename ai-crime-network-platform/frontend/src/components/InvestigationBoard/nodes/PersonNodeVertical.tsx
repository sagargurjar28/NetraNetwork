import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Link } from 'react-router-dom'
import type { BoardPin } from '@/services/api/boards'
import { cn } from '@/utils/cn'
import { Capsule } from './PinCard'
import { Avatar } from './avatars'
import { LabelView } from './LabelView'
import type { PinData } from './PersonNode'

export type PersonRole = 'suspect' | 'victim' | 'witness' | 'related'

const ROLE_STYLES: Record<PersonRole, string> = {
  suspect: 'border-accent-primary/30 bg-accent-primary/15 text-accent-hover',
  victim: 'border-accent-warning/30 bg-accent-warning/15 text-accent-warning',
  witness: 'border-accent-info/30 bg-accent-info/15 text-accent-info',
  related: 'border-[rgba(255,255,255,0.08)] bg-surface-3 text-text-secondary',
}

function resolveRole(pin: BoardPin): PersonRole {
  const raw: unknown = pin.content?.role
  if (raw === 'suspect' || raw === 'victim' || raw === 'witness' || raw === 'related') return raw
  // Real backend person pins carry no `role` field — gray "related" is the expected fallback.
  console.warn(`PersonNodeVertical: pin ${pin.id} has no valid role, defaulting to "related"`)
  return 'related'
}

/**
 * Vertical person card: square avatar on top, name below, role badge
 * below the name. Only the person node uses this layout — all other
 * node types stay rectangular (see PinCard-based components).
 */
export function PersonNodeVertical({ data, selected }: NodeProps) {
  const { pin, onRename } = data as unknown as PinData
  const c = pin.content || {}
  const role = resolveRole(pin)
  const cases = (c.linked_cases as string[] | undefined) || []
  const firs = (c.linked_firs as string[] | undefined) || []
  return (
    <div className="group relative">
      <div
        className={cn(
          'w-[190px] rounded-panel border border-transparent bg-surface-2 shadow-card transition-transform hover:scale-[1.02]',
          !selected && 'border-[rgba(255,255,255,0.08)]',
        )}
      >
        <div className="flex justify-center px-4 pt-4">
          <div
            className={cn(
              'flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-[8px] bg-surface-3',
              selected ? 'border-2 border-accent-primary' : 'border border-[rgba(255,255,255,0.08)]',
            )}
          >
            <Avatar
              gender={(c.gender as 'male' | 'female' | 'neutral' | undefined) || 'neutral'}
              className="h-14 w-14 text-text-secondary"
            />
          </div>
        </div>
        <div className="px-3 pb-3 pt-2 text-center">
          <div className="text-center">
            <LabelView label={pin.label} onRename={(v) => onRename(pin.id, v)} />
          </div>
          <span
            className={cn(
              'mt-1 inline-block rounded-full border px-2 py-px text-[10px] font-medium uppercase tracking-wide',
              ROLE_STYLES[role],
            )}
          >
            {role}
          </span>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-text-muted !border-surface-1" />
      <Handle type="source" position={Position.Right} className="!bg-text-muted !border-surface-1" />
      <div className="nodrag pointer-events-none absolute left-1/2 top-full z-10 hidden w-max max-w-[260px] -translate-x-1/2 pt-2 group-hover:block">
        <div className="pointer-events-auto flex flex-wrap gap-1 rounded-control border border-[rgba(255,255,255,0.08)] bg-surface-1 p-2 shadow-soft">
          {c.phone ? <Capsule>📞 {String(c.phone)}</Capsule> : null}
          {c.address ? <Capsule>📍 {String(c.address)}</Capsule> : null}
          {typeof c.associates_count === 'number' ? <Capsule>{c.associates_count} associates</Capsule> : null}
          {cases.map((id) => (
            <Link key={id} to={`/network/cases/${id}`} className="nodrag rounded-full border border-accent-primary/30 bg-accent-primary/15 px-2 py-0.5 font-mono text-[11px] text-accent-hover hover:bg-accent-primary/25">
              Case {id}
            </Link>
          ))}
          {firs.map((id) => (
            <Capsule key={id}>FIR {id}</Capsule>
          ))}
          {pin.entity_id ? <Capsule>{pin.entity_id}</Capsule> : null}
        </div>
      </div>
    </div>
  )
}
