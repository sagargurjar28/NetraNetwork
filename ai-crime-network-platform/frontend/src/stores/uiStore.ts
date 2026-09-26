import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockNotifications, type MockNotification } from '@/mocks/notifications'
export const COPILOT_MIN_WIDTH = 320
export const COPILOT_MAX_WIDTH = 640
export const COPILOT_DEFAULT_WIDTH = 420
export type UISettings = { name: string; email: string; emailAlerts: boolean; autoRefresh: boolean; compactMode: boolean }
const defaultSettings: UISettings = { name: 'Inspector Arjun', email: 'arjun@intel.gov.in', emailAlerts: true, autoRefresh: true, compactMode: false }
// Mock-only. No backend notifications endpoint.
type UIState = { sidebarCollapsed:boolean; copilotOpen:boolean; copilotWidth:number; theme:'dark'|'light'; boardPanelSplit:number; boardHistoryCollapsed:boolean; settings:UISettings; notifications:MockNotification[]; notificationsReadIds:string[]; toggleSidebar:()=>void; setCopilotOpen:(v:boolean)=>void; setCopilotWidth:(w:number)=>void; setBoardPanelSplit:(r:number)=>void; setBoardHistoryCollapsed:(v:boolean)=>void; setSettings:(p:Partial<UISettings>)=>void; markNotificationRead:(id:string)=>void; markAllNotificationsRead:()=>void }
// No backend settings endpoint. Settings persist to localStorage only.
export const useUIStore = create<UIState>()(persist((set)=>({
  sidebarCollapsed:false, copilotOpen:false, copilotWidth:COPILOT_DEFAULT_WIDTH, theme:'dark', boardPanelSplit:0.5, boardHistoryCollapsed:false, settings:defaultSettings,
  notifications:mockNotifications, notificationsReadIds:[],
  toggleSidebar:()=> set(s=>({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCopilotOpen:(v)=> set({ copilotOpen:v }),
  setCopilotWidth:(w)=> set({ copilotWidth: Math.min(COPILOT_MAX_WIDTH, Math.max(COPILOT_MIN_WIDTH, Math.round(w))) }),
  setBoardPanelSplit:(r)=> set({ boardPanelSplit: Math.min(0.8, Math.max(0.2, r)) }),
  setBoardHistoryCollapsed:(v)=> set({ boardHistoryCollapsed:v }),
  setSettings:(p)=> set(s=>({ settings:{ ...s.settings, ...p } })),
  markNotificationRead:(id)=> set(s=>({ notificationsReadIds: s.notificationsReadIds.includes(id) ? s.notificationsReadIds : [...s.notificationsReadIds, id] })),
  markAllNotificationsRead:()=> set(s=>({ notificationsReadIds: s.notifications.map(n=>n.id) })),
}),{ // legacy key name — do not rename without migration
name:'intelgrid.ui', partialize:(s)=>({ settings:s.settings } as UIState) }))
