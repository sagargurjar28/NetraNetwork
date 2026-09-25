import type { NodeProps } from '@xyflow/react'
import { Link } from 'react-router-dom'
import { PinCard, Capsule } from './PinCard'
import { CaseGlyph, FirGlyph, BankGlyph } from './avatars'
import { LabelView } from './LabelView'
import type { PinData } from './PersonNode'

/** Backend-aligned record nodes: case, FIR, bank account. */

function RecordShell({
  pin, onRename, selected, glyph, badge, badgeClass, strip, extra,
}: {
  pin: PinData['pin']; onRename: PinData['onRename']; selected: boolean
  glyph: React.ReactNode; badge: string; badgeClass: string; strip: string; extra?: React.ReactNode
}) {
  return (
    <PinCard
      color={strip}
      selected={selected}
      header={
        <div className="flex items-center gap-2">
          {glyph}
          <div className="min-w-0">
            <LabelView label={pin.label} onRename={(v) => onRename(pin.id, v)} />
            <span className={`mt-0.5 inline-block rounded-full px-2 py-px text-[10px] font-medium uppercase tracking-wide ${badgeClass}`}>
              {badge}
            </span>
          </div>
        </div>
      }
      capsules={extra}
    />
  )
}

export function CaseNode({ data, selected }: NodeProps) {
  const { pin, onRename } = data as unknown as PinData
  const cases = (pin.content?.linked_cases as string[] | undefined) || []
  return (
    <RecordShell pin={pin} onRename={onRename} selected={!!selected} glyph={<CaseGlyph />} badge="Case"
      badgeClass="bg-surface-3 text-text-primary" strip="#e6edf3"
      extra={<>{cases.length ? cases.map((id) => (
        <Link key={id} to={`/network/cases/${id}`} className="nodrag rounded-full border border-accent-primary/30 bg-accent-primary/15 px-2 py-0.5 font-mono text-[11px] text-accent-hover hover:bg-accent-primary/25">
          Case {id}
        </Link>
      )) : <Capsule>{pin.entity_id || pin.label}</Capsule>}</>} />
  )
}

export function FirNode({ data, selected }: NodeProps) {
  const { pin, onRename } = data as unknown as PinData
  const firs = (pin.content?.linked_firs as string[] | undefined) || []
  return (
    <RecordShell pin={pin} onRename={onRename} selected={!!selected} glyph={<FirGlyph />} badge="FIR"
      badgeClass="bg-accent-danger/15 text-accent-danger" strip="#ef4444"
      extra={<>{firs.length ? firs.map((id) => <Capsule key={id}>FIR {id}</Capsule>) : <Capsule>{pin.label}</Capsule>}</>} />
  )
}

export function BankNode({ data, selected }: NodeProps) {
  const { pin, onRename } = data as unknown as PinData
  return (
    <RecordShell pin={pin} onRename={onRename} selected={!!selected} glyph={<BankGlyph />} badge="Bank account"
      badgeClass="bg-accent-success/15 text-accent-success" strip="#22c55e"
      extra={<Capsule>{pin.entity_id || pin.label}</Capsule>} />
  )
}
