import { create } from 'zustand'
export const COPILOT_MIN_WIDTH = 320
export const COPILOT_MAX_WIDTH = 640
export const COPILOT_DEFAULT_WIDTH = 420
type UIState = { sidebarCollapsed:boolean; copilotOpen:boolean; copilotWidth:number; theme:'dark'|'light'; activeDomain:string; boardPanelSplit:number; boardHistoryCollapsed:boolean; toggleSidebar:()=>void; setCopilotOpen:(v:boolean)=>void; setCopilotWidth:(w:number)=>void; setActiveDomain:(d:string)=>void; setBoardPanelSplit:(r:number)=>void; setBoardHistoryCollapsed:(v:boolean)=>void }
export const useUIStore = create<UIState>((set)=>({
  sidebarCollapsed:false, copilotOpen:false, copilotWidth:COPILOT_DEFAULT_WIDTH, theme:'dark', activeDomain:'network', boardPanelSplit:0.5, boardHistoryCollapsed:false,
  toggleSidebar:()=> set(s=>({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCopilotOpen:(v)=> set({ copilotOpen:v }),
  setCopilotWidth:(w)=> set({ copilotWidth: Math.min(COPILOT_MAX_WIDTH, Math.max(COPILOT_MIN_WIDTH, Math.round(w))) }),
  setActiveDomain:(d)=> set({ activeDomain:d }),
  setBoardPanelSplit:(r)=> set({ boardPanelSplit: Math.min(0.8, Math.max(0.2, r)) }),
  setBoardHistoryCollapsed:(v)=> set({ boardHistoryCollapsed:v }),
}))
