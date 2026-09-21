import client from './client'
import { isMock, delay } from '../../mocks/helpers'
import { mockConversations } from '../../mocks/fixtures'
export const copilotApi = {
  listConversations: async()=>{ if(isMock()){ await delay(); return mockConversations } const {data}=await client.get('/copilot/conversations'); return data },
  sendMessage: async(payload:any)=>{ if(isMock()){ await delay(500); return { reply: 'This is a mocked assistant response with **markdown**, citation [DOC-001] and analysis.', citations:[{id:'DOC-001', title:'FIR 2024-112'}]} } const {data}=await client.post('/copilot/message',payload); return data },
}
