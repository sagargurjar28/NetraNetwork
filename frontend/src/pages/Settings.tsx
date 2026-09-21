import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Tabs } from '@/components/ui/Tabs'
import { useState } from 'react'

export default function Settings(){
  const [tab,setTab]=useState('profile')
  const tabs=[{key:'profile',label:'Profile'},{key:'prefs',label:'Preferences'},{key:'notif',label:'Notifications'},{key:'keys',label:'API Keys'},{key:'appearance',label:'Appearance'}]
  return (
    <div className="max-w-3xl space-y-4">
      <Tabs tabs={tabs} active={tab} onChange={setTab}/>
      {tab==='profile' && <Card className="p-6 space-y-3"><h3 className="font-medium text-[#e6edf3]">Profile</h3><Input label="Name" defaultValue="Inspector Arjun"/><Input label="Email" defaultValue="arjun@intel.gov.in"/><Input label="Role" defaultValue="admin" disabled/></Card>}
      {tab==='prefs' && <Card className="p-6 space-y-3"><h3 className="font-medium text-[#e6edf3]">Preferences</h3><Switch label="Enable notifications" checked/><Switch label="Auto-refresh graphs" checked/></Card>}
      {tab==='notif' && <Card className="p-6"><h3 className="font-medium text-[#e6edf3]">Notifications</h3><div className="text-sm text-[#8b98a5] mt-2">Email on high-risk flag • Push on new case</div></Card>}
      {tab==='keys' && <Card className="p-6"><h3 className="font-medium text-[#e6edf3]">API Keys</h3><div className="font-mono text-xs bg-[#0b1015] border border-[rgba(255,255,255,0.06)] rounded p-3 text-[#8b98a5]">sk_live_•••••••••••••••••••••••••••••••</div><div className="text-xs text-[#5a6672] mt-2">Display only — rotate via backend</div></Card>}
      {tab==='appearance' && <Card className="p-6"><h3 className="font-medium text-[#e6edf3]">Appearance</h3><div className="text-sm text-[#8b98a5]">Theme: Dark (default) • Accent: #dc2626</div></Card>}
    </div>
  )
}
