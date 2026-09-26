// Mock-only. No backend notifications endpoint.
export type NotificationType = 'case_assigned' | 'document_uploaded' | 'board_updated' | 'link_suggested'

export type MockNotification = {
  id: string
  type: NotificationType
  title: string
  body: string
  /** ISO timestamp, used for the relative-time label. */
  createdAt: string
  /** Route to navigate to when the notification is clicked. */
  route: string
}

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString()
}

export const mockNotifications: MockNotification[] = [
  {
    id: 'notif-1',
    type: 'case_assigned',
    title: 'New case assigned',
    body: 'Operation Black Kite (C-2024-018) was assigned to you.',
    createdAt: minutesAgo(4),
    route: '/network/cases/C-2024-018',
  },
  {
    id: 'notif-2',
    type: 'document_uploaded',
    title: 'Document uploaded',
    body: 'FIR_2024_112.pdf was added to C-2024-018.',
    createdAt: minutesAgo(26),
    route: '/documents/DOC-001',
  },
  {
    id: 'notif-3',
    type: 'link_suggested',
    title: 'Link suggested',
    body: 'Copilot suggests Vikram Singh → Sun Logistics (funds, 0.9).',
    createdAt: minutesAgo(58),
    route: '/network/graph',
  },
  {
    id: 'notif-4',
    type: 'board_updated',
    title: 'Board updated',
    body: 'SI Meena added 2 pins to Operation Black Kite board.',
    createdAt: minutesAgo(180),
    route: '/network/graph',
  },
  {
    id: 'notif-5',
    type: 'document_uploaded',
    title: 'Document uploaded',
    body: 'Seizure_Memo_33.docx was added to C-2024-021.',
    createdAt: minutesAgo(420),
    route: '/documents/DOC-002',
  },
  {
    id: 'notif-6',
    type: 'case_assigned',
    title: 'New case assigned',
    body: 'Narcotics Corridor (C-2024-033) was assigned to you.',
    createdAt: minutesAgo(1500),
    route: '/network/cases/C-2024-033',
  },
]

export function timeAgo(iso: string): string {
  const diffMin = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000))
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  return `${Math.round(diffH / 24)}d ago`
}
