import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, FileText, Link2, Network, UserPlus } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'
import { useUIStore } from '@/stores/uiStore'
import { timeAgo, type NotificationType } from '@/mocks/notifications'

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  case_assigned: UserPlus,
  document_uploaded: FileText,
  board_updated: Network,
  link_suggested: Link2,
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const nav = useNavigate()
  const notifications = useUIStore((s) => s.notifications)
  const readIds = useUIStore((s) => s.notificationsReadIds)
  const markRead = useUIStore((s) => s.markNotificationRead)
  const markAllRead = useUIStore((s) => s.markAllNotificationsRead)
  const unread = notifications.filter((n) => !readIds.includes(n.id))

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open ])

  return (
    <div ref={ref} className="relative">
      <IconButton aria-label="Notifications" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="relative">
        <Bell size={16} />
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-danger px-1 text-[10px] font-semibold text-white">
            {unread.length}
          </span>
        )}
      </IconButton>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[340px] overflow-hidden rounded-control border border-[rgba(255,255,255,0.08)] bg-surface-2 shadow-soft">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold text-text-primary">Notifications</span>
            <button
              onClick={markAllRead}
              className="text-xs text-text-secondary hover:text-text-primary"
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-[380px] overflow-auto border-t border-[rgba(255,255,255,0.06)]">
            {unread.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-muted">
                You&apos;re all caught up
              </div>
            ) : (
              unread.map((n) => {
                const Icon = TYPE_ICON[n.type]
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      markRead(n.id)
                      setOpen(false)
                      nav(n.route)
                    }}
                    className="flex w-full items-start gap-3 bg-accent-primary/[0.04] px-4 py-3 text-left hover:bg-surface-hover"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-text-secondary">
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-text-primary">{n.title}</span>
                        <span className="h-2 w-2 shrink-0 rounded-full bg-accent-danger" aria-label="Unread" />
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-text-secondary">{n.body}</span>
                      <span className="mt-1 block text-[11px] text-text-muted">{timeAgo(n.createdAt)}</span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
          <button
            onClick={() => {
              setOpen(false)
              nav('/admin')
            }}
            className="w-full border-t border-[rgba(255,255,255,0.06)] px-4 py-2.5 text-center text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          >
            View all
          </button>
        </div>
      )}
    </div>
  )
}
