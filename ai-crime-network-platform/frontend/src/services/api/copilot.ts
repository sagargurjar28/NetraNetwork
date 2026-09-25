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
      ...(payload.board_id ? { board_id: payload.board_id } : {}),
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
