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
