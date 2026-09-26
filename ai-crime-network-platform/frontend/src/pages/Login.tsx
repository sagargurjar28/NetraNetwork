import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useLogin } from '@/hooks/mutations/useAuth'

export default function Login() {
  const [username, setUsername] = useState('arjun')
  const [password, setPassword] = useState('password')
  const nav = useNavigate()
  const loc = useLocation() as any
  const m = useLogin()
  const from = loc.state?.from?.pathname || '/network'
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await m.mutateAsync({ username, password }); nav(from, { replace: true }) } catch {}
  }
  return (
    <div className="app-background flex items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          {/* LOGO: asset lives at /assets/netra-logo.svg (user-supplied).
              Accepted formats: .svg (preferred) or .png.
              Recommended dimensions: SVG any size; PNG ≥ 128×128 with
              transparent background. */}
          <div className="flex min-h-16 items-center mb-3">
            <img
              src="/assets/netra-logo.svg"
              alt="NetraNetwork"
              className="h-16 w-auto select-none"
              draggable={false}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.style.display = 'none';
                const fb = img.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = 'inline-block';
              }}
            />
            <span
              className="hidden text-base font-semibold tracking-tight"
              aria-hidden="true"
            >
              NetraNetwork
            </span>
          </div>
          <p className="text-sm text-text-secondary">Law-Enforcement Intelligence Platform</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {m.isError && <div className="text-sm text-accent-danger bg-accent-danger/10 border border-accent-danger/20 rounded-lg px-3 py-2">{(m.error as any)?.message || 'Login failed'}</div>}
          <Button type="submit" loading={m.isPending} className="w-full">Sign In</Button>
          <p className="text-xs text-muted-foreground">Secured with JWT — contact admin for credentials</p>
        </form>
      </Card>
    </div>
  )
}
