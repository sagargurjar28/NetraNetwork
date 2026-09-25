import { useState } from 'react'
import { Bot, User, Copy, Pencil, Trash2, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useCopilotStore, type Citation, type Message } from '@/stores/copilotStore'
import { renderMarkdown } from './markdown'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

type Props = {
  m: Message
  onCite: (c: Citation) => void
  onResend: (content: string) => void
  onRegenerate: (assistantId: string) => void
}

/** Single message bubble — extracted from CopilotPanel. */
export function ChatMessage({ m, onCite, onResend, onRegenerate }: Props) {
  const activeId = useCopilotStore((s) => s.activeId)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')

  function copyText(t: string) {
    navigator.clipboard?.writeText(t).then(() => toast('Copied to clipboard', 'success')).catch(() => toast('Copy failed', 'error'))
  }

  function saveEdit() {
    if (!activeId) return
    useCopilotStore.getState().editUserMessage(activeId, m.id, editText.trim() || ' ')
    setEditing(false)
    onResend(editText.trim() || ' ')
    toast('Message updated — resending', 'success')
  }

  return (
    <div className={'group flex gap-2 ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
      {m.role === 'assistant' && <div className="w-7 h-7 rounded-full bg-accent-primary flex items-center justify-center shrink-0"><Bot size={14} className="text-white" /></div>}
      <div className={cn('max-w-[80%] rounded-xl px-3 py-2 text-sm', m.role === 'user' ? 'bg-accent-primary text-white' : 'bg-surface-2 border border-[rgba(255,255,255,0.06)] text-text-primary')}>
        {m.role === 'user' && editing ? (
          <div className="space-y-2">
            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} className="w-full rounded-lg bg-base border border-[rgba(255,255,255,0.1)] p-2 text-sm text-white" />
            <div className="flex gap-2">
              <button onClick={saveEdit} className="px-2 py-1 rounded bg-white text-black text-xs font-medium">Save & Resend</button>
              <button onClick={() => setEditing(false)} className="px-2 py-1 rounded border border-white/30 text-xs">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="whitespace-pre-wrap break-words">
              {m.role === 'assistant' ? renderMarkdown(m.content, m.citations, onCite) : m.content}
              {m.streaming && <span className="inline-block ml-1 animate-pulse">▍</span>}
            </div>
            {m.role === 'assistant' && m.citations && m.citations.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {m.citations.map((c) => <button key={c.refId} onClick={() => onCite(c)} className="px-2 py-0.5 rounded-full bg-accent-primary/15 text-accent-hover border border-accent-primary/30 text-[11px] font-mono">[{c.refId}] {c.title}</button>)}
              </div>
            )}
            {m.attachments && m.attachments.length > 0 && <div className="mt-1 text-[11px] opacity-80">📎 {m.attachments.map((a) => a.name).join(', ')}</div>}
            {m.aborted && <div className="mt-1 text-[11px] text-text-muted">(stopped — partial content kept)</div>}
            {/* hover actions */}
            <div className="hidden group-hover:flex gap-1 mt-2 pt-1 border-t border-white/10">
              {m.role === 'user' ? (
                <>
                  <button title="Copy" onClick={() => copyText(m.content)} className="p-1 rounded hover:bg-black/20"><Copy size={13} /></button>
                  <button title="Edit" onClick={() => { setEditing(true); setEditText(m.content) }} className="p-1 rounded hover:bg-black/20"><Pencil size={13} /></button>
                  <button title="Delete thread from here" onClick={() => { if (activeId && confirm('Delete this message and everything after?')) { useCopilotStore.getState().deleteMessageAndAfter(activeId, m.id); toast('Message deleted', 'success') } }} className="p-1 rounded hover:bg-black/20"><Trash2 size={13} /></button>
                </>
              ) : (
                <>
                  <button title="Copy" onClick={() => copyText(m.content)} className="p-1 rounded hover:bg-surface-3"><Copy size={13} /></button>
                  <button title="Regenerate" onClick={() => onRegenerate(m.id)} className="p-1 rounded hover:bg-surface-3"><RotateCcw size={13} /></button>
                  <button title="Good" onClick={() => activeId && useCopilotStore.getState().setFeedback(activeId, m.id, m.feedback === 'up' ? null : 'up')} className={cn('p-1 rounded hover:bg-surface-3', m.feedback === 'up' && 'text-accent-success')}><ThumbsUp size={13} /></button>
                  <button title="Bad" onClick={() => activeId && useCopilotStore.getState().setFeedback(activeId, m.id, m.feedback === 'down' ? null : 'down')} className={cn('p-1 rounded hover:bg-surface-3', m.feedback === 'down' && 'text-accent-danger')}><ThumbsDown size={13} /></button>
                  <button title="Delete" onClick={() => { if (activeId && confirm('Delete this reply?')) { useCopilotStore.getState().deleteMessageAndAfter(activeId, m.id); toast('Reply deleted', 'success') } }} className="p-1 rounded hover:bg-surface-3"><Trash2 size={13} /></button>
                </>
              )}
            </div>
          </>
        )}
      </div>
      {m.role === 'user' && <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center shrink-0"><User size={14} className="text-text-secondary" /></div>}
    </div>
  )
}
