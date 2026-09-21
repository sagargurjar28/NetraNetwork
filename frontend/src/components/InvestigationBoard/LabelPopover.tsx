import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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
  const [label, setLabel] = useState('')
  const [confidence, setConfidence] = useState('')
  function submit() {
    let c: number | null = null
    if (withConfidence && confidence.trim() !== '') {
      const n = Number(confidence)
      if (!Number.isFinite(n) || n < 0 || n > 1) return
      c = n
    }
    onConfirm(label.trim(), c)
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
        <Input placeholder="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
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
