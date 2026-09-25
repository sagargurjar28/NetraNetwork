import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { registerToast } from '@/utils/toast'
type Toast = { id: number; message: string; type?: string }
const Ctx = createContext<{ addToast: (m: string, type?: string) => void } | null>(null)
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const addToast = useCallback((message: string, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  useEffect(() => { registerToast(addToast) }, [addToast])
  return (
    <Ctx.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-[70]" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={'px-4 py-3 rounded-control border shadow-xl text-sm text-text-primary min-w-[260px] ' + (t.type === 'error' ? 'bg-surface-2 border-accent-danger/40' : t.type === 'success' ? 'bg-surface-2 border-accent-success/40' : 'bg-surface-2 border-[rgba(255,255,255,0.08)]')}>{t.message}</div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
export function useToast() { const c = useContext(Ctx); if (!c) throw new Error('useToast outside provider'); return c }
