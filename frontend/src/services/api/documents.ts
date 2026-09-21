import client from './client'
import { isMock, delay, maybeError } from '../../mocks/helpers'
import { mockDocuments } from '../../mocks/fixtures'
export const documentsApi = {
  list: async(params?:any)=>{
    if(isMock()){ await delay(); if(maybeError()) throw {message:'Failed'}; let data=[...mockDocuments]; if(params?.q) data=data.filter(d=> d.name.toLowerCase().includes(params.q.toLowerCase())); return {data, total:data.length}}
    const {data}= await client.get('/documents',{params}); return data
  },
  get: async(id:string)=>{
    if(isMock()){ await delay(); return mockDocuments.find(d=>d.id===id)||mockDocuments[0]}
    const {data}= await client.get(`/documents/${id}`); return data
  },
  upload: async(form:any)=>{
    if(isMock()){ await delay(1200); return { hash:'0x'+Math.random().toString(16).slice(2,10)+'...', cid:'Qm'+Math.random().toString(36).slice(2,10), tx:'0x'+Math.random().toString(16).slice(2,66), timestamp:new Date().toISOString() } }
    const {data}= await client.post('/documents/upload', form); return data
  },
  stats: async()=>{ if(isMock()){ await delay(); return { totalDocs:1248, pending:23, flagged:7, storage:'342 GB'}} const {data}= await client.get('/documents/stats'); return data}
}
