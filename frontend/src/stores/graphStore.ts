import { create } from 'zustand'
type GraphState = { selectedNodes:string[]; filters:{type:string; risk:string; query:string}; layout:'force'|'radial'|'hierarchical'; setSelected:(ids:string[])=>void; setFilters:(f:any)=>void; setLayout:(l:any)=>void }
export const useGraphStore = create<GraphState>((set)=>({
  selectedNodes:[], filters:{type:'all', risk:'all', query:''}, layout:'force',
  setSelected:(ids)=> set({ selectedNodes:ids }),
  setFilters:(f)=> set(s=>({ filters:{...s.filters, ...f}})),
  setLayout:(l)=> set({ layout:l }),
}))
