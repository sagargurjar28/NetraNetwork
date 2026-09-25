/**
 * Copilot service facade — single import surface for copilot features.
 * REST lives in ./api/copilot, streaming/socket in ./socketService.
 * (Team-leader path: src/services/copilotService.ts)
 */
export * from './api/copilot'
export {
  mockCopilotStream,
  mockStream,
  sendCopilotAbort,
  sendCopilotRegenerate,
  COPILOT_EVENTS,
  COPILOT_NAMESPACE,
  getSocket,
  subscribe,
  emit,
} from './socketService'
export type { MockCitation } from './socketService'
export type { Citation } from '@/stores/copilotStore'
import type { Citation } from '@/stores/copilotStore'

/**
 * Backend citations arrive as { type, id, label }; the UI reads
 * { id, type, refId, title, excerpt }. Optional fallbacks keep this
 * idempotent for already-adapted (mock) citations.
 */
export function adaptCitation(c: { type: string; id: string; label?: string; refId?: string; title?: string; excerpt?: string }): Citation {
  const type = c.type === 'document' || c.type === 'entity' || c.type === 'case' ? c.type : 'document'
  const refId = c.refId ?? c.id
  const title = c.title ?? c.label ?? refId
  return { id: c.id, type, refId, title, excerpt: c.excerpt ?? title }
}
