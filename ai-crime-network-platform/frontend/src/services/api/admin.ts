// Backend has no matching routes. Mock-only regardless of VITE_USE_MOCKS. Do not change behavior.
import client from './client'
import { isMock, delay } from '../../mocks/helpers'
import { mockUsers, mockAuditLogs } from '../../mocks/fixtures'
export const adminApi = {
  listUsers: async()=>{ if(isMock()){ await delay(); return mockUsers } const {data}=await client.get('/admin/users'); return data },
  auditLogs: async()=>{ if(isMock()){ await delay(); return mockAuditLogs } const {data}=await client.get('/admin/audit'); return data },
  health: async()=>{ if(isMock()){ await delay(); return { api:'ok', db:'ok', cache:'ok', uptime:'12d 4h'}} const {data}=await client.get('/admin/health'); return data },
}
