import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Tabs } from '@/components/ui/Tabs'
import { useUIStore } from '@/stores/uiStore'
import { useState } from 'react'

// No backend settings endpoint. All settings persist to localStorage via uiStore.
export default function Settings(){
  const [tab,setTab]=useState('profile')
  const settings = useUIStore((s)=>s.settings)
  const setSettings = useUIStore((s)=>s.setSettings)
  const tabs=[{key:'profile',label:'Profile'},{key:'prefs',label:'Preferences'},{key:'notif',label:'Notifications'},{key:'keys',label:'API Keys'},{key:'appearance',label:'Appearance'}]
  return (
    <div className="max-w-3xl space-y-4">
      <Tabs tabs={tabs} active={tab} onChange={setTab}/>
      {tab==='profile' && <Card className="p-6 space-y-3"><h3 className="font-medium text-[#e6edf3]">Profile</h3><Input label="Name" value={settings.name} onChange={(e)=>setSettings({name:e.target.value})}/><Input label="Email" value={settings.email} onChange={(e)=>setSettings({email:e.target.value})}/><Input label="Role" defaultValue="admin" disabled/></Card>}
      {tab==='prefs' && <Card className="p-6 space-y-3"><h3 className="font-medium text-[#e6edf3]">Preferences</h3><Switch label="Enable notifications" checked={settings.emailAlerts} onCheckedChange={(v)=>setSettings({emailAlerts:v})}/><Switch label="Auto-refresh graphs" checked={settings.autoRefresh} onCheckedChange={(v)=>setSettings({autoRefresh:v})}/><Switch label="Compact mode" checked={settings.compactMode} onCheckedChange={(v)=>setSettings({compactMode:v})}/></Card>}
      {tab==='notif' && <Card className="p-6 space-y-3"><h3 className="font-medium text-[#e6edf3]">Notifications</h3><div className="text-sm text-[#8b98a5]">Email on high-risk flag • Push on new case</div><Switch label="Email alerts" checked={settings.emailAlerts} onCheckedChange={(v)=>setSettings({emailAlerts:v})}/></Card>}
      {tab==='keys' && <Card className="p-6"><h3 className="font-medium text-[#e6edf3]">API Keys</h3><div className="font-mono text-xs bg-[#0b1015] border border-[rgba(255,255,255,0.06)] rounded p-3 text-[#8b98a5]">sk_live_•••••••••••••••••••••••••••••••</div><div className="text-xs text-[#5a6672] mt-2">Display only — rotate via backend</div></Card>}
      {tab==='appearance' && <Card className="p-6 space-y-3"><h3 className="font-medium text-[#e6edf3]">Appearance</h3><div className="text-sm text-[#8b98a5]">Theme: Dark (default) • Accent: #dc2626</div><Switch label="Compact mode" checked={settings.compactMode} onCheckedChange={(v)=>setSettings({compactMode:v})}/></Card>}
    </div>
  )
}
