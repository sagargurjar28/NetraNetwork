import client from './client'
import { isMock, delay, maybeError } from '@/mocks/helpers'
import { mockCreateConnection, mockCreatePin, mockDeletePin, mockGetBoard, mockMovePin, mockRenamePin } from '@/mocks/boards'

export type EntityType = 'person' | 'organization' | 'building' | 'phone' | 'location' | 'document' | 'note' | 'case' | 'fir' | 'bankaccount'

export type BoardPin = {
  id: string
  board_id: string
  entity_type: EntityType
  entity_id: string | null
  label: string
  content: {
    gender?: 'male' | 'female' | 'neutral'
    role?: 'suspect' | 'victim' | 'witness' | 'related'
    phone?: string
    address?: string
    associates_count?: number
    linked_cases?: string[]
    linked_firs?: string[]
    note_text?: string
    original_type?: string
    [key: string]: unknown
  } | null
  x: number
  y: number
  color: string | null
}

export type BoardConnection = {
  id: string
  board_id: string
  source_pin_id: string
  target_pin_id: string
  label: string | null
  confidence: number | null
  notes: string | null
}

export type BoardDetail = { id: string; name: string; pins: BoardPin[]; connections: BoardConnection[] }

export const boardsApi = {
  getBoard: async (boardId: string): Promise<BoardDetail> => {
    if (isMock()) return mockGetBoard(boardId)
    const { data } = await client.get(`/boards/${boardId}/`)
    return {
      ...data,
      pins: (data.pins ?? []).map((p: any) => ({
        ...p,
        x: p.position_x ?? p.x ?? 0,
        y: p.position_y ?? p.y ?? 0,
      })),
      connections: data.connections ?? [],
    }
  },
  getCases: async (): Promise<any[]> => {
    if (isMock()) {
      const { mockCases } = await import('@/mocks/fixtures')
      return mockCases
    }
    const { data } = await client.get('/cases/')
    return (data ?? []).map((c: any) => ({
      id: c.id,
      title: c.title,
      status: c.status ?? 'open',
      priority: c.priority ?? 'Medium',
      entities: c.entities ?? 0,
      officer: c.officer ?? '—',
      created: c.created_at ? c.created_at.slice(0, 10) : '—',
      summary: c.description ?? '',
    }))
  },
  getBoardByCase: async (caseId: string): Promise<BoardDetail> => {
    if (isMock()) return mockGetBoard('22222222-2222-2222-2222-222222222222')
    const { data: list } = await client.get(`/cases/${caseId}/boards/`)
    if (!list?.length) throw { message: 'No boards for case', status: 404 }
    const { data } = await client.get(`/boards/${list[0].id}/`)
    return data
  },
  createPin: async (boardId: string, pin: any): Promise<BoardPin> => {
    const entityType: string = pin.entityType ?? pin.entity_type ?? 'person'
    const label: string = pin.label ?? 'Untitled'
    const content: BoardPin['content'] = pin.content ?? null
    const x: number = pin.x ?? pin.position_x ?? 0
    const y: number = pin.y ?? pin.position_y ?? 0
    // Backend default pin color; send explicitly since the board never sets one.
    const color: string = pin.color ?? '#1f77b4'
    // WRITE SITE: backend only accepts person-like entity types for org/building —
    // send entity_type 'person' and keep the real type in content.original_type.
    const isOrg = entityType === 'organization' || entityType === 'building'
    const payload = {
      entity_type: (isOrg ? 'person' : entityType) as EntityType,
      entity_id: pin.entity_id ?? null,
      label,
      content: isOrg ? { ...((content as Record<string, unknown>) || {}), original_type: entityType } : content,
      position_x: x,
      position_y: y,
      color,
    }
    if (isMock()) return mockCreatePin(boardId, { ...pin, ...payload, x, y, color } as Omit<BoardPin, 'id' | 'board_id'>)
    const { data } = await client.post(`/boards/${boardId}/pins/`, payload)
    return { ...data, x: data.position_x ?? x, y: data.position_y ?? y }
  },
  createConnection: async (boardId: string, conn: any): Promise<BoardConnection> => {
    // Backend default confidence; send explicitly since the popover allows blank.
    const payload = {
      source_pin_id: conn.source_pin_id ?? conn.source,
      target_pin_id: conn.target_pin_id ?? conn.target,
      label: conn.label ?? 'Associated with',
      confidence: conn.confidence ?? 1.0,
      notes: conn.notes ?? null,
    }
    if (isMock()) return mockCreateConnection(boardId, payload)
    const { data } = await client.post(`/boards/${boardId}/connections/`, payload)
    return data
  },
  deletePin: async (boardId: string, pinId: string): Promise<void> => {
    if (isMock()) return mockDeletePin(boardId, pinId)
    await client.delete(`/boards/${boardId}/pins/${pinId}/`)
  },
  /** Local-only: no backend endpoint — optimistic update, persisted in pin data. */
  movePin: (boardId: string, pinId: string, x: number, y: number): void => {
    if (isMock()) mockMovePin(boardId, pinId, x, y)
  },
  /** Local-only: no backend endpoint — optimistic update. */
  renamePin: (boardId: string, pinId: string, label: string): void => {
    if (isMock()) mockRenamePin(boardId, pinId, label)
  },
  /** Local-only: no delete-edge endpoint in the backend catalogue. */
  deleteConnection: async (_boardId: string, _connectionId: string): Promise<void> => {
    if (isMock()) { await delay(); if (maybeError(0.05)) throw { message: 'Delete connection failed (mock error)' } }
  },
  createCase: async (payload: { title: string; description?: string }) => {
    const { data } = await client.post('/cases/', {
      title: payload.title,
      description: payload.description ?? null,
      status: 'open',
    })
    return data
  },
  createBoard: async (caseId: string, name: string) => {
    const { data } = await client.post('/boards/', {
      case_id: caseId,
      name: name,
      description: null,
    })
    return data
  },
  getReport: async (caseId: string) => {
    const { data } = await client.get(`/cases/${caseId}/report/`)
    return data
  },
}
