import client from './client'
import { isMock, delay, maybeError } from '@/mocks/helpers'
import { mockCreateConnection, mockCreatePin, mockDeletePin, mockGetBoard, mockMovePin, mockRenamePin } from '@/mocks/boards'

export type EntityType = 'person' | 'organization' | 'building' | 'phone' | 'location' | 'document' | 'note'

export type BoardPin = {
  id: string
  board_id: string
  entity_type: EntityType
  entity_id: string | null
  label: string
  content: {
    gender?: 'male' | 'female' | 'neutral'
    phone?: string
    address?: string
    associates_count?: number
    linked_cases?: string[]
    linked_firs?: string[]
    note_text?: string
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
    return data
  },
  createPin: async (boardId: string, pin: Omit<BoardPin, 'id' | 'board_id'>): Promise<BoardPin> => {
    if (isMock()) return mockCreatePin(boardId, pin)
    const { data } = await client.post(`/boards/${boardId}/pins/`, {
      entity_type: pin.entity_type, entity_id: pin.entity_id, label: pin.label,
      content: pin.content, position_x: pin.x, position_y: pin.y, color: pin.color,
    })
    return { ...data, x: data.position_x ?? pin.x, y: data.position_y ?? pin.y }
  },
  createConnection: async (boardId: string, conn: Omit<BoardConnection, 'id' | 'board_id'>): Promise<BoardConnection> => {
    if (isMock()) return mockCreateConnection(boardId, conn)
    const { data } = await client.post(`/boards/${boardId}/connections/`, conn)
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
}
