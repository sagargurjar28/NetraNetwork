import type { EntityType } from '@/services/api/boards'

const GROUPS: { title: string; items: { type: EntityType; label: string; dot: string }[] }[] = [
  {
    title: 'Priority',
    items: [
      { type: 'person', label: 'Person', dot: '#dc2626' },
      { type: 'organization', label: 'Organization', dot: '#06b6d4' },
      { type: 'building', label: 'Building', dot: '#f59e0b' },
    ],
  },
  {
    title: 'Secondary',
    items: [
      { type: 'phone', label: 'Phone', dot: '#8b98a5' },
      { type: 'location', label: 'Location', dot: '#8b98a5' },
      { type: 'document', label: 'Document', dot: '#8b98a5' },
      { type: 'note', label: 'Note', dot: '#8b98a5' },
    ],
  },
]

/** Drag a template onto the canvas. Drop position is converted with screenToFlowPosition. */
export function Palette() {
  return (
    <div className="space-y-4">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">[ {g.title} ]</div>
          <div className="space-y-1.5">
            {g.items.map((it) => (
              <div
                key={it.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/pin-type', it.type)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                className="flex cursor-grab items-center gap-2 rounded-control border border-[rgba(255,255,255,0.06)] bg-surface-1 px-2.5 py-1.5 text-sm text-text-primary transition-colors hover:border-[rgba(255,255,255,0.14)] active:cursor-grabbing"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: it.dot }} />
                {it.label}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="text-[11px] leading-relaxed text-text-muted">Drag onto canvas. Secondary types spawn in the unattached band.</div>
    </div>
  )
}
