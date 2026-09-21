import { useState } from 'react'

/** Double-click label → inline edit. Enter/blur saves, Esc cancels. */
export function LabelView({ label, onRename }: { label: string; onRename: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  if (!editing) {
    return (
      <div
        className="nodrag truncate text-sm font-medium text-text-primary"
        title="Double-click to rename"
        onDoubleClick={(e) => { e.stopPropagation(); setDraft(label); setEditing(true) }}
      >
        {label}
      </div>
    )
  }
  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { setEditing(false); if (draft.trim() && draft.trim() !== label) onRename(draft.trim()) }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        if (e.key === 'Escape') setEditing(false)
      }}
      onClick={(e) => e.stopPropagation()}
      className="nodrag w-full rounded-chip border border-accent-primary/40 bg-base px-1 py-px text-sm text-text-primary"
      aria-label="Rename node"
    />
  )
}
