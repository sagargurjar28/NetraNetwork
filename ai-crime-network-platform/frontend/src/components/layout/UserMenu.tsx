import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/utils/cn'

/**
 * Shared Profile / Settings / Logout menu. Both the sidebar user area
 * and the topbar avatar render this component with their own trigger.
 */
export function UserMenu({ trigger, align = 'right', side = 'above' }: { trigger: React.ReactNode; align?: 'left' | 'right'; side?: 'above' | 'below' }) {
  const [open, setOpen] = useState(false)
  const [focusIdx, setFocusIdx] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const nav = useNavigate()

  const items = [
    { key: 'profile', label: 'Profile', icon: User, action: () => nav('/settings') },
    { key: 'settings', label: 'Settings', icon: Settings, action: () => nav('/settings') },
    {
      key: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: () => {
        useAuthStore.getState().logout()
        nav('/login')
      },
    },
  ]

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open ])

  useEffect(() => {
    if (open) itemRefs.current[focusIdx]?.focus()
  }, [open, focusIdx ])

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusIdx((i) => (i + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusIdx((i) => (i - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      itemRefs.current[focusIdx]?.click()
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        onClick={() => {
          setFocusIdx(0)
          setOpen((v) => !v)
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
        className="flex w-full items-center gap-3 rounded-lg text-left"
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          aria-label="User menu"
          onKeyDown={onMenuKeyDown}
          className={cn(
            'absolute z-50 min-w-[180px] rounded-control border border-[rgba(255,255,255,0.08)] bg-surface-2 py-1 shadow-soft',
            side === 'above' ? 'bottom-full mb-2' : 'top-full mt-2',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, i) => (
            <button
              key={item.key}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              role="menuitem"
              tabIndex={i === focusIdx ? 0 : -1}
              onFocus={() => setFocusIdx(i)}
              onClick={() => {
                setOpen(false)
                item.action()
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
            >
              <item.icon size={15} className="text-text-secondary" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
