import { client } from './client';
import { isMock, delay } from '@/mocks/helpers';

export interface Citation {
  type: 'pin' | 'connection' | 'document';
  id: string;
  label: string;
}

export interface CopilotResponse {
  conversation_id: string;
  answer: string;
  citations: Citation[];
  intent?: string;
}

export interface CopilotRequest {
  message: string;
  conversation_id?: string;
  board_id?: string;
}

type LegacySendArgs = {
  content?: string;
  domain?: string;
  attachments?: string[];
};

// Demo board fallback — used when the URL has no board context.
const DEMO_BOARD = '22222222-2222-2222-2222-222222222222';

/**
 * Resolve the currently-open board ID at call-time.
 * Priority: URL query param → URL path pattern → demo board.
 */
function resolveBoardId(): string {
  try {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get('boardId');
    if (qp) return qp;

    const m = url.pathname.match(/\/boards\/([a-f0-9-]{36})/i);
    if (m) return m[1];
  } catch {
    // window unavailable — fall through
  }
  return DEMO_BOARD;
}

export const copilotApi = {
  sendMessage: async (payload: CopilotRequest & LegacySendArgs): Promise<CopilotResponse> => {
    if (isMock()) {
      await delay(500);
      return {
        conversation_id: 'mock-convo',
        answer: 'Mock response.',
        citations: [],
        intent: 'general',
      };
    }

    const body: CopilotRequest = {
      message: payload.message ?? payload.content ?? '',
      ...(payload.conversation_id ? { conversation_id: payload.conversation_id } : {}),
      // Always send a board_id — payload value wins, otherwise resolve from URL.
      board_id: payload.board_id ?? resolveBoardId(),
    };

    const { data } = await client.post('/copilot/chat', body);
    return data as CopilotResponse;
  },

  listConversations: async (): Promise<unknown> => {
    if (isMock()) return [];
    const { data } = await client.get('/copilot/conversations/');
    return data;
  },

  getConversation: async (id: string): Promise<unknown> => {
    if (isMock()) return null;
    const { data } = await client.get(`/copilot/conversations/${id}/`);
    return data;
  },

  deleteConversation: async (id: string): Promise<void> => {
    if (isMock()) return;
    await client.delete(`/copilot/conversations/${id}/`);
  },
};