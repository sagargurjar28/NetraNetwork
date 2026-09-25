import { io, Socket } from 'socket.io-client'

// Socket.IO namespace /copilot — event contract (mock is drop-in for real server).
// Client -> server: copilot:send { conversationId, content, domain, attachments: string[] }
//                   copilot:abort { conversationId, messageId }
//                   copilot:regenerate { conversationId, messageId }
// Server -> client: copilot:start { conversationId, messageId }
//                   copilot:token { conversationId, messageId, token }
//                   copilot:citation { conversationId, messageId, citation }
//                   copilot:end { conversationId, messageId }
//                   copilot:error { conversationId, messageId, error: { code, message } }

export const COPILOT_NAMESPACE = '/copilot'
export const COPILOT_EVENTS = {
  SEND: 'copilot:send',
  ABORT: 'copilot:abort',
  REGENERATE: 'copilot:regenerate',
  START: 'copilot:start',
  TOKEN: 'copilot:token',
  CITATION: 'copilot:citation',
  END: 'copilot:end',
  ERROR: 'copilot:error',
} as const

let socket: Socket | null = null
export function getSocket(): Socket {
  if (socket) return socket
  const base = import.meta.env.VITE_SOCKET_URL || window.location.origin
  socket = io(base + COPILOT_NAMESPACE, { autoConnect: false, reconnection: true, reconnectionAttempts: 5 })
  if (import.meta.env.VITE_USE_MOCKS !== 'true') socket.connect()
  return socket
}
export function subscribe(event: string, handler: (...args: any[]) => void) {
  const s = getSocket(); s.on(event, handler); return () => { s.off(event, handler) }
}
export function emit(event: string, payload: any) {
  const s = getSocket(); s.emit(event, payload)
}

export type MockCitation = { id: string; type: 'document' | 'entity' | 'case'; refId: string; title: string; excerpt: string }

// Legacy simple streaming helper (kept for compat)
export function mockStream(prompt: string, onToken: (t: string) => void, onDone: () => void) {
  const resp = 'Analyzing your query: **' + prompt + '**.\n\nBased on linked cases and entities, the network shows 3 high-risk clusters. See [DOC-001] and [ENT-001] for details.'
  let i = 0
  const id = setInterval(() => {
    if (i >= resp.length) { clearInterval(id); onDone(); return }
    const chunk = resp.slice(i, i + 6); i += 6; onToken(chunk)
  }, 40)
  return () => clearInterval(id)
}

// Full contract mock: emits START -> TOKEN* (15-30ms) -> CITATION -> END, abortable.
export function mockCopilotStream(opts: {
  conversationId: string; messageId: string; prompt: string; domain: string;
  onStart?: (p: any) => void; onToken?: (p: any) => void; onCitation?: (p: any) => void; onEnd?: (p: any) => void; onError?: (p: any) => void;
  signal?: { aborted: boolean };
}): () => void {
  const { conversationId, messageId, prompt, onStart, onToken, onCitation, onEnd } = opts
  const signal = opts.signal || { aborted: false }
  const body =
    'Analyzing **' + prompt.slice(0, 120) + '** (' + opts.domain + ').\n\nThe network shows 3 high-risk clusters. See [DOC-001] and [ENT-001] for case C-2024-018.\n\n| Entity | Risk | Links |\n|---|---|---|\n| Vikram S | High | 12 |\n| Anita R | Medium | 7 |\n\nRecommendation: flag **C-2024-018** for priority review.'
  const tokens: string[] = []
  for (let i = 0; i < body.length; i += 4) tokens.push(body.slice(i, i + 4))
  let idx = 0
  let timer: any
  onStart?.({ conversationId, messageId })
  // also emit via socket for drop-in listeners
  try { getSocket().emit(COPILOT_EVENTS.START, { conversationId, messageId }) } catch {}
  const step = () => {
    if (signal.aborted) { clearTimeout(timer); return }
    if (idx < tokens.length) {
      const token = tokens[idx++]
      onToken?.({ conversationId, messageId, token })
      try { getSocket().emit(COPILOT_EVENTS.TOKEN, { conversationId, messageId, token }) } catch {}
      // mid-stream citation
      if (idx === Math.floor(tokens.length / 2)) {
        const citation: MockCitation = { id: 'DOC-001', type: 'document', refId: 'DOC-001', title: 'FIR 2024-112', excerpt: 'Seizure memo links ENT-001 to case C-2024-018 via financial trail.' }
        onCitation?.({ conversationId, messageId, citation })
        try { getSocket().emit(COPILOT_EVENTS.CITATION, { conversationId, messageId, citation }) } catch {}
        const c2: MockCitation = { id: 'ENT-001', type: 'entity', refId: 'ENT-001', title: 'Vikram Singh', excerpt: 'High-risk entity, 12 links, 2 cases.' }
        onCitation?.({ conversationId, messageId, citation: c2 })
        try { getSocket().emit(COPILOT_EVENTS.CITATION, { conversationId, messageId, citation: c2 }) } catch {}
      }
      timer = setTimeout(step, 15 + Math.random() * 15)
    } else {
      onEnd?.({ conversationId, messageId })
      try { getSocket().emit(COPILOT_EVENTS.END, { conversationId, messageId }) } catch {}
    }
  }
  timer = setTimeout(step, 30)
  return () => clearTimeout(timer)
}

export function sendCopilotAbort(conversationId: string, messageId: string) {
  try { getSocket().emit(COPILOT_EVENTS.ABORT, { conversationId, messageId }) } catch {}
}
export function sendCopilotRegenerate(conversationId: string, messageId: string) {
  try { getSocket().emit(COPILOT_EVENTS.REGENERATE, { conversationId, messageId }) } catch {}
}
