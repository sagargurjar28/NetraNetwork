import type { NodeProps } from '@xyflow/react'
import { PinCard, Capsule } from './PinCard'
import { PhoneGlyph, PinGlyph, DocGlyph, NoteGlyph } from './avatars'
import { LabelView } from './LabelView'
import type { PinData } from './PersonNode'

const SECONDARY = '#8b98a5'

function Shell({
  pin, onRename, selected, glyph, badge, extra,
}: {
  pin: PinData['pin']; onRename: PinData['onRename']; selected: boolean; glyph: React.ReactNode; badge: string; extra?: React.ReactNode
}) {
  return (
    <PinCard
      color={SECONDARY}
      selected={selected}
      header={
        <div className="flex items-center gap-2">
          {glyph}
          <div className="min-w-0">
            <LabelView label={pin.label} onRename={(v) => onRename(pin.id, v)} />
            <span className="mt-0.5 inline-block rounded-full bg-surface-3 px-2 py-px text-[10px] font-medium uppercase tracking-wide text-text-secondary">
              {badge}
            </span>
          </div>
        </div>
      }
      capsules={extra}
    />
  )
}

export function PhoneNode({ data, selected }: NodeProps) {
  const { pin, onRename } = data as unknown as PinData
  return (
    <Shell pin={pin} onRename={onRename} selected={!!selected} glyph={<PhoneGlyph />} badge="Phone"
      extra={<Capsule>{pin.content?.phone ? String(pin.content.phone) : 'Unknown number'}</Capsule>} />
  )
}

export function LocationNode({ data, selected }: NodeProps) {
  const { pin, onRename } = data as unknown as PinData
  return (
    <Shell pin={pin} onRename={onRename} selected={!!selected} glyph={<PinGlyph />} badge="Location"
      extra={<Capsule>{pin.content?.address ? String(pin.content.address) : pin.label}</Capsule>} />
  )
}

export function DocumentNode({ data, selected }: NodeProps) {
  const { pin, onRename } = data as unknown as PinData
  return (
    <Shell pin={pin} onRename={onRename} selected={!!selected} glyph={<DocGlyph />} badge="Document"
      extra={<Capsule>{pin.label}</Capsule>} />
  )
}

export function NoteNode({ data, selected }: NodeProps) {
  const { pin, onRename } = data as unknown as PinData
  const text = pin.content?.note_text ? String(pin.content.note_text) : ''
  return (
    <Shell pin={pin} onRename={onRename} selected={!!selected} glyph={<NoteGlyph />} badge="Note"
      extra={<Capsule>{text.slice(0, 60) || 'Empty note'}</Capsule>} />
  )
}
