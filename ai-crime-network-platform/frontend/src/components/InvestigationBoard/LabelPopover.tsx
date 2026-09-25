import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const RELATIONSHIP_OPTIONS: string[] = [
  'Called',
  'Met with',
  'Transferred to',
  'Lives at',
  'Owns',
  'Associated with',
];

/** Inline label popover shared by node creation and edge creation. */
export function LabelPopover({
  title,
  withConfidence,
  confirmLabel = 'Create',
  onConfirm,
  onCancel,
}: {
  title: string
  withConfidence?: boolean
  confirmLabel?: string
  onConfirm: (label: string, confidence: number | null) => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState<string>('Associated with')
  const [confidence, setConfidence] = useState<string>('')
  function submit(): void {
    let c: number | null = null
    if (withConfidence && confidence.trim() !== '') {
      const n = Number(confidence)
      if (!Number.isFinite(n) || n < 0 || n > 1) return
      c = n
    }
    onConfirm(label.trim() || 'Associated with', c)
  }
  return (
    <div
      className="absolute z-30 w-[240px] rounded-panel border border-[rgba(255,255,255,0.1)] bg-surface-1 p-3 shadow-soft"
      style={{ left: 16, top: 16 }}
      role="dialog"
      aria-label={title}
    >
      <div className="mb-2 text-sm font-medium text-text-primary">{title}</div>
      <div className="space-y-2">
        <select
          aria-label="Relationship label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="h-9 w-full rounded-control border border-[rgba(255,255,255,0.08)] bg-base px-2 text-sm text-text-primary"
        >
          {RELATIONSHIP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {withConfidence && (
          <Input placeholder="Confidence 0–1 (optional)" value={confidence} onChange={(e) => setConfidence(e.target.value)} />
        )}
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={submit}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
