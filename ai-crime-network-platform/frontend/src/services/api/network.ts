// Backend has no matching routes. Mock-only regardless of VITE_USE_MOCKS. Do not change behavior.
import client from './client'
import { isMock, delay, maybeError } from '../../mocks/helpers'
import { mockEntities, mockCases, mockGraph, mockRelations } from '../../mocks/fixtures'
export const networkApi = {
  getEntities: async (params?:any)=>{
    if(isMock()){ await delay(); if(maybeError()) throw {message:'Failed to load entities'}; let data=[...mockEntities]; if(params?.q) data=data.filter(e=> e.name.toLowerCase().includes(params.q.toLowerCase())); return { data, total:data.length } }
    const {data}= await client.get('/network/entities',{params}); return data
  },
  getEntity: async(id:string)=>{
    if(isMock()){ await delay(); return mockEntities.find(e=>e.id===id) || mockEntities[0] }
    const {data}= await client.get(`/network/entities/${id}`); return data
  },
  getCases: async(params?:any)=>{
    if(isMock()){ await delay(); let data=[...mockCases]; if(params?.q) data=data.filter(c=> c.title.toLowerCase().includes(params.q.toLowerCase())); return { data, total:data.length } }
    const {data}= await client.get('/network/cases',{params}); return data
  },
  getCase: async(id:string)=>{
    if(isMock()){ await delay(); return mockCases.find(c=>c.id===id)||mockCases[0] }
    const {data}= await client.get(`/network/cases/${id}`); return data
  },
  getGraph: async()=>{
    if(isMock()){ await delay(600); return mockGraph }
    const {data}= await client.get('/network/graph'); return data
  },
  getRelations: async()=>{ if(isMock()){ await delay(); return mockRelations } const {data}=await client.get('/network/relations'); return data},
  stats: async()=>{ if(isMock()){ await delay(); return { activeCases: 42, entitiesTracked: 312, linksDiscovered: 892, highRiskFlags: 17 }} const {data}=await client.get('/network/stats'); return data}
}
