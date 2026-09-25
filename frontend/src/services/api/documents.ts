import client from './client'
import { isMock, delay, maybeError } from '../../mocks/helpers'
import { mockDocuments } from '../../mocks/fixtures'

export const documentsApi = {
  list: async (params?: any) => {
    if (isMock()) {
      await delay()
      if (maybeError()) throw { message: 'Failed' }
      let data = [...mockDocuments]
      if (params?.q) data = data.filter(d => d.name.toLowerCase().includes(params.q.toLowerCase()))
      return { data, total: data.length }
    }
    // If caseId provided, use case-scoped route. Otherwise list all.
    if (params?.caseId && params.caseId !== 'undefined') {
      const { data } = await client.get(`/cases/${params.caseId}/documents/`)
      return data
    }
    const { data } = await client.get('/documents/', { params: { limit: params?.limit ?? 100 } })
    return data
  },

  get: async (id: string, params?: any) => {
    if (isMock()) {
      await delay()
      return mockDocuments.find(d => d.id === id) || mockDocuments[0]
    }
    // Prefer the direct detail route. Fall back to the case list if unavailable.
    try {
      const { data } = await client.get(`/documents/${id}/`)
      return data
    } catch {
      if (params?.caseId && params.caseId !== 'undefined') {
        const { data } = await client.get(`/cases/${params.caseId}/documents/`)
        const list = data?.data || data || []
        return list.find((d: any) => d.id === id) || list[0]
      }
      return null
    }
  },

  upload: async (form: FormData) => {
    if (isMock()) {
      await delay(1200)
      return {
        hash: '0x' + Math.random().toString(16).slice(2, 10) + '...',
        cid: 'Qm' + Math.random().toString(36).slice(2, 10),
        tx: '0x' + Math.random().toString(16).slice(2, 66),
        timestamp: new Date().toISOString(),
      }
    }
    const caseId = form.get('case_id')
    const { data } = await client.post(`/cases/${caseId}/documents/`, form)
    return data
  },

  stats: async (params?: any): Promise<any> => {
    if (isMock()) {
      await delay()
      return { totalDocs: 1248, pending: 23, flagged: 7, storage: '342GB' }
    }
    // List all documents, compute client-side.
    let list: any[] = []
    if (params?.caseId && params.caseId !== 'undefined') {
      const { data } = await client.get(`/cases/${params.caseId}/documents/`)
      list = data?.data || data || []
    } else {
      const { data } = await client.get('/documents/', { params: { limit: 500 } })
      list = data || []
    }
    return {
      totalDocs: list.length,
      pending: list.filter((d: any) => d.status === 'Pending').length,
      flagged: list.filter((d: any) => d.status === 'Flagged').length,
      storage: '—',
    }
  },

  verify: async (payload: any) => {
    if (isMock()) {
      await delay(600)
      return { verified: true, ...payload }
    }
    const { data } = await client.post('/documents/verify', payload)
    return data
  },
}