import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, Send, Square, Paperclip, X } from 'lucide-react'
import { useCopilotStore, copilotUid, type Citation, type Message } from '@/stores/copilotStore'
import { mockCopilotStream, sendCopilotAbort, sendCopilotRegenerate } from '@/services/copilotService'
import { ChatMessage } from './ChatMessage'
import { SourceDrawer } from './CitationViewer'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

export function CopilotChat({ mode = 'drawer', onClose }: { mode?: 'drawer' | 'page'; onClose?: () => void }) {
  const conversations = useCopilotStore((s) => s.conversations)
  const activeId = useCopilotStore((s) => s.activeId)
  const isStreaming = useCopilotStore((s) => s.isStreaming)
  const store = useCopilotStore.getState()
  const active = conversations.find((c) => c.id === activeId) || null
  const [input, setInput] = useState('')
  const [domain, setDomain] = useState<'auto' | 'network' | 'documents'>(active?.domain || 'auto')
  const [attachments, setAttachments] = useState<{ id: string; name: string; size: number; type: string }[]>([])
  const [openCite, setOpenCite] = useState<Citation | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<{ aborted: boolean }>({ aborted: false })
  const cancelStreamRef = useRef<(() => void) | null>(null)

  useEffect(() => { setDomain(active?.domain || 'auto') }, [activeId])
  useEffect(() => { listRef.current?.scrollTo(0, listRef.current.scrollHeight) }, [active?.messages?.length, active?.messages?.[active.messages.length - 1]?.content])
  useEffect(() => { inputRef.current?.focus() }, [activeId])

  const canSend = useMemo(() => input.trim().length > 0 && !isStreaming, [input, isStreaming])

  function ensureConversation(): string {
    let id = useCopilotStore.getState().activeId
    if (!id) id = useCopilotStore.getState().createConversation()
    return id!
  }

  function startAssistant(convId: string, prompt: string, dom: string, atts: string[]): string {
    const st = useCopilotStore.getState()
    const mid = copilotUid('msg')
    st.appendMessage(convId, { id: mid, role: 'assistant', content: '', createdAt: new Date().toISOString(), streaming: true, citations: [] })
    st.autoTitleFromFirstUserMessage(convId)
    useCopilotStore.setState({ streamingId: mid, isStreaming: true })
    abortRef.current = { aborted: false }
    const sig = abortRef.current
    cancelStreamRef.current = mockCopilotStream({
      conversationId: convId, messageId: mid, prompt, domain: dom, signal: sig,
      onToken: ({ token }) => { if (!sig.aborted) useCopilotStore.getState().appendToken(convId, mid, token) },
      onCitation: ({ citation }) => {
        const cur = useCopilotStore.getState()
        const conv = cur.conversations.find((c) => c.id === convId)
        const msg = conv?.messages.find((m) => m.id === mid)
        const has = msg?.citations?.some((c) => c.refId === citation.refId)
        if (!has && msg) {
          const next = [...(msg.citations || []), citation]
          useCopilotStore.setState({
            conversations: cur.conversations.map((c) => c.id === convId ? { ...c, messages: c.messages.map((m) => m.id === mid ? { ...m, citations: next } : m) } : c),
          })
        }
      },
      onEnd: () => { useCopilotStore.getState().finishStream(convId, mid); useCopilotStore.getState().autoTitleFromFirstUserMessage(convId); toast('Response complete', 'success') },
    })
    try {
      const s = { conversationId: convId, content: prompt, domain: dom, attachments: atts }
      void s
    } catch {}
    return mid
  }

  function send() {
    if (!canSend) return
    const convId = ensureConversation()
    const st = useCopilotStore.getState()
    const umsg: Message = {
      id: copilotUid('msg'), role: 'user', content: input.trim(), createdAt: new Date().toISOString(),
      attachments: attachments.length ? [...attachments] : undefined,
    }
    st.appendMessage(convId, umsg)
    // persist domain on conversation
    useCopilotStore.setState({ conversations: useCopilotStore.getState().conversations.map((c) => c.id === convId ? { ...c, domain } : c) })
    const prompt = input.trim()
    const atts = attachments.map((a) => a.id)
    setInput(''); setAttachments([])
    if (inputRef.current) inputRef.current.style.height = 'auto'
    startAssistant(convId, prompt, domain, atts)
    toast('Message sent', 'info')
  }

  function stop() {
    const st = useCopilotStore.getState()
    const mid = st.streamingId
    const cid = st.activeId
    if (mid && cid) {
      abortRef.current.aborted = true
      cancelStreamRef.current?.()
      sendCopilotAbort(cid, mid)
      st.abortStream(cid, mid)
      toast('Streaming stopped', 'info')
    }
  }

  function regenerate(assistantId: string) {
    const st = useCopilotStore.getState()
    const cid = st.activeId
    if (!cid || st.isStreaming) return
    const conv = st.conversations.find((c) => c.id === cid)
    if (!conv) return
    const idx = conv.messages.findIndex((m) => m.id === assistantId)
    if (idx < 0) return
    // find preceding user message for prompt
    let prompt = ''
    for (let i = idx - 1; i >= 0; i--) if (conv.messages[i].role === 'user') { prompt = conv.messages[i].content; break }
    sendCopilotRegenerate(cid, assistantId)
    // remove old assistant reply, stream new
    useCopilotStore.setState({ conversations: st.conversations.map((c) => c.id === cid ? { ...c, messages: c.messages.filter((m) => m.id !== assistantId) } : c) })
    startAssistant(cid, prompt || 'Regenerate response', conv.domain, [])
    toast('Regenerating…', 'info')
  }

  function resend(content: string) {
    const st = useCopilotStore.getState()
    const cid = st.activeId
    if (!cid || st.isStreaming) return
    const conv = st.conversations.find((c) => c.id === cid)
    startAssistant(cid, content, conv?.domain || 'auto', [])
  }

  function onAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const arr = Array.from(files).map((f) => ({ id: copilotUid('att'), name: f.name, size: f.size, type: f.type }))
    setAttachments((a) => [...a, ...arr])
    toast(arr.length + ' file(s) attached', 'success')
    e.target.value = ''
  }

  function autoGrow() {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    const lines = Math.min(6, el.value.split('\n').length + 1)
    el.style.height = Math.min(6 * 24, el.scrollHeight) + 'px'
    void lines
  }

  const msgs = active?.messages || []

  return (
    <div className={cn('flex flex-col min-h-0', mode === 'drawer' ? 'h-full' : 'h-full')}>
      {mode === 'drawer' && (
        <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.06)] flex gap-2 items-center">
          <select aria-label="Domain context" value={domain} onChange={(e) => setDomain(e.target.value as any)} className="h-8 rounded-lg bg-base border border-[rgba(255,255,255,0.08)] px-2 text-xs text-text-primary">
            <option value="auto">Auto</option><option value="network">Network</option><option value="documents">Documents</option>
          </select>
          <span className="text-xs text-text-muted">Context: {domain}</span>
          {onClose && <button onClick={onClose} aria-label="Close copilot" className="ml-auto p-1 rounded hover:bg-surface-3 text-text-secondary"><X size={16} /></button>}
        </div>
      )}

      <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3" role="log" aria-label="Copilot messages">
        {msgs.length === 0 && (
          <div className="text-center py-10">
            <div className="w-12 h-12 mx-auto rounded-full bg-surface-3 flex items-center justify-center mb-3"><Bot size={20} className="text-text-secondary" /></div>
            <div className="font-medium text-text-primary text-sm">Start a new conversation</div>
            <div className="text-xs text-text-muted mt-1">Try: “Summarize case C-2024-018” • “Find links for ENT-001” • “Verify DOC-001”</div>
          </div>
        )}
        {msgs.map((m) => (
          <ChatMessage key={m.id} m={m} onCite={setOpenCite} onResend={resend} onRegenerate={regenerate} />
        ))}
        {isStreaming && <div className="text-xs text-text-muted">Copilot is typing…</div>}
      </div>

      <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
        {mode === 'page' && (
          <div className="flex gap-2 items-center mb-2">
            <select aria-label="Domain context" value={domain} onChange={(e) => setDomain(e.target.value as any)} className="h-8 rounded-lg bg-base border border-[rgba(255,255,255,0.08)] px-2 text-xs text-text-primary">
              <option value="auto">Auto</option><option value="network">Network</option><option value="documents">Documents</option>
            </select>
            <span className="text-xs text-text-muted">Domain wired into copilot:send payload</span>
          </div>
        )}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {attachments.map((a) => <span key={a.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-3 border border-[rgba(255,255,255,0.08)] text-xs text-text-secondary">{a.name}<button onClick={() => setAttachments((x) => x.filter((y) => y.id !== a.id))} aria-label="Remove attachment" className="hover:text-text-primary"><X size={12} /></button></span>)}
          </div>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef} value={input} rows={2}
            onChange={(e) => { setInput(e.target.value); autoGrow() }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask about cases, entities… (Enter send, Shift+Enter newline)"
            className="flex-1 rounded-control bg-base border border-[rgba(255,255,255,0.06)] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary resize-none overflow-auto"
            style={{ maxHeight: 6 * 24 }}
          />
          <label className="p-2 rounded-lg bg-surface-2 border border-[rgba(255,255,255,0.06)] text-text-secondary cursor-pointer hover:text-text-primary" title="Attach file">
            <Paperclip size={16} /><input type="file" multiple className="hidden" onChange={onAttach} />
          </label>
          {isStreaming ? (
            <button onClick={stop} className="p-2 rounded-lg bg-accent-muted text-white hover:bg-accent-primary flex items-center gap-1 text-sm px-3" title="Stop (abort)"><Square size={14} /> Stop</button>
          ) : (
            <button onClick={send} disabled={!canSend} className="p-2 rounded-lg bg-accent-primary text-white hover:bg-accent-hover disabled:opacity-40 flex items-center gap-1 text-sm px-3"><Send size={14} /> Send</button>
          )}
        </div>
        <div className="text-[11px] text-text-muted mt-1">Enter send • Shift+Enter newline • Cmd/Ctrl+K toggle • Esc close</div>
      </div>
      <SourceDrawer citation={openCite} onClose={() => setOpenCite(null)} />
    </div>
  )
}
