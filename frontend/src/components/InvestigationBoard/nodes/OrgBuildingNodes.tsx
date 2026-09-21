import type { NodeProps } from '@xyflow/react'
import { Link } from 'react-router-dom'
import { PinCard, Capsule } from './PinCard'
import { BuildingGlyph } from './avatars'
import { LabelView } from './LabelView'
import type { PinData } from './PersonNode'

function AttrCapsules({ pin }: { pin: PinData['pin'] }) {
  const c = pin.content || {}
  const cases = (c.linked_cases as string[] | undefined) || []
  const firs = (c.linked_firs as string[] | undefined) || []
  return (
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
  )
}

export function OrganizationNode({ data, selected }: NodeProps) {
  const { pin, onRename } = data as unknown as PinData
  const color = pin.color || '#06b6d4'
  return (
    <PinCard
      color={color}
      selected={!!selected}
      header={
        <div className="flex items-center gap-2.5">
          <BuildingGlyph />
          <div className="min-w-0">
            <LabelView label={pin.label} onRename={(v) => onRename(pin.id, v)} />
            <span className="mt-0.5 inline-block rounded-full bg-accent-info/15 px-2 py-px text-[10px] font-medium uppercase tracking-wide text-accent-info">
              Organization
            </span>
          </div>
        </div>
      }
      capsules={<AttrCapsules pin={pin} />}
    />
  )
}

export function BuildingNode({ data, selected }: NodeProps) {
  const { pin, onRename } = data as unknown as PinData
  const color = pin.color || '#f59e0b'
  return (
    <PinCard
      color={color}
      selected={!!selected}
      header={
        <div className="flex items-center gap-2.5">
          <BuildingGlyph className="h-9 w-9 shrink-0 text-accent-warning" />
          <div className="min-w-0">
            <LabelView label={pin.label} onRename={(v) => onRename(pin.id, v)} />
            <span className="mt-0.5 inline-block rounded-full bg-accent-warning/15 px-2 py-px text-[10px] font-medium uppercase tracking-wide text-accent-warning">
              Building
            </span>
          </div>
        </div>
      }
      capsules={<AttrCapsules pin={pin} />}
    />
  )
}
