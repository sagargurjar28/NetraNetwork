import type { NodeProps } from '@xyflow/react'
import { Link } from 'react-router-dom'
import type { BoardPin } from '@/services/api/boards'
import { PinCard, Capsule } from './PinCard'
import { Avatar } from './avatars'
import { LabelView } from './LabelView'

export type PinData = {
  pin: BoardPin
  onRename: (pinId: string, label: string) => void
}

export function PersonNode({ data, selected }: NodeProps) {
  const { pin, onRename } = data as unknown as PinData
  const c = pin.content || {}
  const cases = (c.linked_cases as string[] | undefined) || []
  const firs = (c.linked_firs as string[] | undefined) || []
  const color = pin.color || '#dc2626'
  return (
    <PinCard
      color={color}
      selected={!!selected}
      header={
        <div className="flex items-center gap-2.5">
          <Avatar gender={(c.gender as 'male' | 'female' | 'neutral' | undefined) || 'neutral'} />
          <div className="min-w-0">
            <LabelView label={pin.label} onRename={(v) => onRename(pin.id, v)} />
            <span className="mt-0.5 inline-block rounded-full bg-accent-primary/15 px-2 py-px text-[10px] font-medium uppercase tracking-wide text-accent-hover">
              Person
            </span>
          </div>
        </div>
      }
      capsules={
        <>
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
        </>
      }
    />
  )
}
