import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { boardsApi } from '@/services/api/boards'
import { toast } from '@/utils/toast'

/** Modal: create a case with its own board, then hand ids to the parent. */
export function NewCaseDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (caseId: string, boardId: string) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const name = title.trim()
    if (!name) return
    setSaving(true)
    try {
      const c = await boardsApi.createCase({ title: name, description: description.trim() || undefined })
      const b = await boardsApi.createBoard(c.id, `${name} — Board`)
      toast('Case created', 'success')
      setTitle('')
      setDescription('')
      onCreated(c.id, b.id)
    } catch (err: unknown) {
      toast((err as { message?: string })?.message || 'Create case failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Case">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Case title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Test Case Alpha"
          autoFocus
        />
        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short summary of the case"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!title.trim()}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}
