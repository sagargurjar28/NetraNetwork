import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'user' | 'assistant' | 'system'
export type Citation = { id: string; type: 'document' | 'entity' | 'case'; refId: string; title: string; excerpt: string }
export type Attachment = { id: string; name: string; size: number; type: string }
export type Message = {
  id: string; role: Role; content: string; createdAt: string;
  citations?: Citation[]; attachments?: Attachment[];
  streaming?: boolean; aborted?: boolean;
  feedback?: 'up' | 'down' | null; editedAt?: string;
}
export type Domain = 'auto' | 'network' | 'documents'
export type Conversation = {
  id: string; title: string; createdAt: string; updatedAt: string;
  pinned: boolean; domain: Domain;
  messages: Message[];
}
export type CopilotStore = {
  conversations: Conversation[]; activeId: string | null;
  streamingId: string | null; isStreaming: boolean;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  pinConversation: (id: string) => void;
  duplicateConversation: (id: string) => string;
  setActive: (id: string | null) => void;
  appendMessage: (conversationId: string, msg: Message) => void;
  appendToken: (conversationId: string, messageId: string, token: string) => void;
  finishStream: (conversationId: string, messageId: string) => void;
  abortStream: (conversationId: string, messageId: string) => void;
  editUserMessage: (conversationId: string, messageId: string, newContent: string) => void;
  deleteMessageAndAfter: (conversationId: string, messageId: string) => void;
  setFeedback: (conversationId: string, messageId: string, fb: 'up' | 'down' | null) => void;
  autoTitleFromFirstUserMessage: (conversationId: string) => void;
}

function uid(prefix = 'id'): string {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
}
function now(): string { return new Date().toISOString() }

export const useCopilotStore = create<CopilotStore>()(
  persist(
    (set, get) => ({
      conversations: [
        {
          id: 'conv-1', title: 'Black Kite network analysis', createdAt: '2024-11-13T09:00:00.000Z',
          updatedAt: '2024-11-13T10:00:00.000Z', pinned: true, domain: 'network',
          messages: [{ id: 'm-welcome', role: 'assistant', content: 'Hello, I am your IntelGrid Copilot. Ask about cases, entities, or documents.', createdAt: '2024-11-13T09:00:00.000Z' }],
        },
      ],
      activeId: 'conv-1',
      streamingId: null,
      isStreaming: false,
      createConversation: () => {
        const id = uid('conv')
        const c: Conversation = { id, title: 'Untitled', createdAt: now(), updatedAt: now(), pinned: false, domain: 'auto', messages: [] }
        set((s) => ({ conversations: [c, ...s.conversations], activeId: id, streamingId: null, isStreaming: false }))
        return id
      },
      deleteConversation: (id) => set((s) => {
        const remaining = s.conversations.filter((c) => c.id !== id)
        let activeId = s.activeId
        if (activeId === id) activeId = remaining.length ? [...remaining].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0].id : null
        return { conversations: remaining, activeId, streamingId: s.streamingId === id ? null : s.streamingId }
      }),
      renameConversation: (id, title) => set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? { ...c, title: title.trim() || c.title, updatedAt: now() } : c)) })),
      pinConversation: (id) => set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned, updatedAt: now() } : c)) })),
      duplicateConversation: (id) => {
        const src = get().conversations.find((c) => c.id === id)
        if (!src) return id
        const nid = uid('conv')
        const copy: Conversation = { ...src, id: nid, title: src.title + ' (copy)', createdAt: now(), updatedAt: now(), messages: src.messages.map((m) => ({ ...m })) }
        set((s) => ({ conversations: [copy, ...s.conversations], activeId: nid }))
        return nid
      },
      setActive: (id) => set({ activeId: id }),
      appendMessage: (conversationId, msg) => set((s) => ({
        conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, messages: [...c.messages, msg], updatedAt: now() } : c)),
      })),
      appendToken: (conversationId, messageId, token) => set((s) => ({
        conversations: s.conversations.map((c) => (c.id === conversationId ? {
          ...c, messages: c.messages.map((m) => (m.id === messageId ? { ...m, content: (m.content || '') + token } : m)), updatedAt: now(),
        } : c)),
      })),
      finishStream: (conversationId, messageId) => set((s) => ({
        conversations: s.conversations.map((c) => (c.id === conversationId ? {
          ...c, messages: c.messages.map((m) => (m.id === messageId ? { ...m, streaming: false } : m)),
        } : c)),
        streamingId: null, isStreaming: false,
      })),
      abortStream: (conversationId, messageId) => set((s) => ({
        conversations: s.conversations.map((c) => (c.id === conversationId ? {
          ...c, messages: c.messages.map((m) => (m.id === messageId ? { ...m, streaming: false, aborted: true } : m)),
        } : c)),
        streamingId: null, isStreaming: false,
      })),
      editUserMessage: (conversationId, messageId, newContent) => set((s) => ({
        conversations: s.conversations.map((c) => {
          if (c.id !== conversationId) return c
          const idx = c.messages.findIndex((m) => m.id === messageId)
          if (idx < 0) return c
          const kept = c.messages.slice(0, idx)
          const edited: Message = { ...c.messages[idx], content: newContent, editedAt: now() }
          return { ...c, messages: [...kept, edited], updatedAt: now() }
        }),
      })),
      deleteMessageAndAfter: (conversationId, messageId) => set((s) => ({
        conversations: s.conversations.map((c) => {
          if (c.id !== conversationId) return c
          const idx = c.messages.findIndex((m) => m.id === messageId)
          if (idx < 0) return c
          return { ...c, messages: c.messages.slice(0, idx), updatedAt: now() }
        }),
      })),
      setFeedback: (conversationId, messageId, fb) => set((s) => ({
        conversations: s.conversations.map((c) => (c.id === conversationId ? {
          ...c, messages: c.messages.map((m) => (m.id === messageId ? { ...m, feedback: fb } : m)),
        } : c)),
      })),
      autoTitleFromFirstUserMessage: (conversationId) => set((s) => ({
        conversations: s.conversations.map((c) => {
          if (c.id !== conversationId || c.title !== 'Untitled') return c
          const first = c.messages.find((m) => m.role === 'user')
          if (!first) return c
          const t = first.content.trim().slice(0, 40)
          const title = first.content.trim().length > 40 ? t + '…' : t
          return { ...c, title: title || 'Untitled' }
        }),
      })),
    }),
    {
      name: 'intelgrid.copilot.v2',
      version: 2,
      migrate: (persisted: any) => {
        if (!persisted) return persisted
        const convs = (persisted.conversations || []).map((c: any) => ({
          ...c,
          domain: c.domain === 'identity' ? 'auto' : c.domain,
        }))
        return { ...persisted, conversations: convs }
      },
      partialize: (s) => ({ conversations: s.conversations, activeId: s.activeId } as any),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.streamingId = null; state.isStreaming = false
          state.conversations = state.conversations.map((c: any) => (c.domain === 'identity' ? { ...c, domain: 'auto' } : c))
        }
      },
    },
  ),
);

export function copilotUid(prefix = 'id'): string { return uid(prefix) }
