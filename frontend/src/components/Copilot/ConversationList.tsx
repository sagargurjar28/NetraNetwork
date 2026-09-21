import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCopilotStore } from '@/stores/copilotStore'
import { MessageSquare, Pin, Plus, MoreVertical } from 'lucide-react'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

/** Conversation history rail — extracted from the full-page copilot view. */
export function ConversationList() {
  const conversations = useCopilotStore((s) => s.conversations)
  const activeId = useCopilotStore((s) => s.activeId)
  const st = useCopilotStore.getState()
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameText, setRenameText] = useState('')
  const [deleteFor, setDeleteFor] = useState<string | null>(null)

  const sorted = [...conversations].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt))

  function onNew() {
    const id = st.createConversation()
    void id
    toast('New conversation created', 'success')
    document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="Ask about"]')?.focus()
  }

  function commitRename(id: string) {
    st.renameConversation(id, renameText)
    setRenaming(null)
    toast('Conversation renamed', 'success')
  }

  return (
    <>
      <Card className="w-[280px] p-0 hidden md:flex flex-col overflow-hidden shrink-0">
        <div className="p-3 border-b border-[rgba(255,255,255,0.06)] flex justify-between items-center">
          <h3 className="font-medium text-sm text-text-primary">Conversations</h3>
          <Button size="sm" onClick={onNew}><Plus size={14} /> New</Button>
        </div>
        <div className="flex-1 overflow-auto divide-y divide-[rgba(255,255,255,0.06)]">
          {sorted.length === 0 && <div className="p-4"><EmptyState title="No conversations" description="Start your first copilot thread." actionLabel="New chat" onAction={onNew} /></div>}
          {sorted.map((c) => (
            <div key={c.id} className={cn('relative group hover:bg-surface-2', activeId === c.id && 'bg-surface-3')}>
              <button onClick={() => st.setActive(c.id)} className="w-full text-left p-3 flex justify-between items-center gap-2">
                <div className="min-w-0">
                  {renaming === c.id ? (
                    <input
                      autoFocus value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      onBlur={() => commitRename(c.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitRename(c.id); if (e.key === 'Escape') setRenaming(null) }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-sm bg-base border border-accent-primary/40 rounded px-1 py-0.5 text-text-primary"
                      aria-label="Rename conversation"
                    />
                  ) : (
                    <div className="text-sm text-text-primary flex items-center gap-2 truncate"><MessageSquare size={14} className="shrink-0" /><span className="truncate">{c.title}</span></div>
                  )}
                  <div className="text-xs text-text-muted mt-1">{new Date(c.updatedAt).toLocaleDateString()} • {c.domain}</div>
                </div>
                <span className="flex items-center gap-1 shrink-0">
                  {c.pinned && <Pin size={12} className="text-accent-warning" />}
                  <span onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === c.id ? null : c.id) }} className="p-1 rounded hover:bg-surface-3 text-text-secondary opacity-0 group-hover:opacity-100 cursor-pointer" role="button" aria-label="Conversation menu"><MoreVertical size={14} /></span>
                </span>
              </button>
              {menuFor === c.id && (
                <div className="absolute right-2 top-12 z-20 min-w-[160px] bg-surface-2 border border-[rgba(255,255,255,0.1)] rounded-lg shadow-xl py-1">
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-3 text-text-primary" onClick={() => { setRenaming(c.id); setRenameText(c.title); setMenuFor(null) }}>Rename</button>
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-3 text-text-primary" onClick={() => { st.pinConversation(c.id); setMenuFor(null); toast(c.pinned ? 'Unpinned' : 'Pinned', 'success') }}>{c.pinned ? 'Unpin' : 'Pin'}</button>
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-3 text-text-primary" onClick={() => { st.duplicateConversation(c.id); setMenuFor(null); toast('Duplicated', 'success') }}>Duplicate</button>
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-3 text-accent-danger" onClick={() => { setDeleteFor(c.id); setMenuFor(null) }}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-[rgba(255,255,255,0.06)] text-xs text-text-muted">Suggested: “Summarize C-2024-018” • “Links for ENT-001” • “Verify DOC-001”</div>
      </Card>

      <Modal open={!!deleteFor} onClose={() => setDeleteFor(null)} title="Delete conversation?">
        <p className="text-sm text-text-secondary">This will permanently remove the thread.</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setDeleteFor(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { if (deleteFor) st.deleteConversation(deleteFor); setDeleteFor(null); toast('Conversation deleted', 'success') }}>Delete</Button>
        </div>
      </Modal>
    </>
  )
}
