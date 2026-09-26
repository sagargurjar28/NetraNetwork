import type { BoardConnection, BoardPin } from '@/services/api/boards'
import { delay, maybeError } from './helpers'

type BoardState = { id: string; name: string; pins: BoardPin[]; connections: BoardConnection[] }

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function seed(): Map<string, BoardState> {
  const boardId = '22222222-2222-2222-2222-222222222222'
  const pins: BoardPin[] = [
    { id: 'pin-vikram', board_id: boardId, entity_type: 'person', entity_id: 'ENT-001', label: 'Vikram Singh', content: { gender: 'male', role: 'suspect', phone: '+91 98XXX X2100', address: 'Sector 7, Old Mandi', associates_count: 12, linked_cases: ['C-2024-018'], linked_firs: ['FIR-2024-112'] }, x: 420, y: 280, color: '#dc2626' },
    { id: 'pin-anita', board_id: boardId, entity_type: 'person', entity_id: 'ENT-002', label: 'Anita Rao', content: { gender: 'female', role: 'victim', phone: '+91 98XXX X2101', address: 'Lake View Apartments', associates_count: 7, linked_cases: ['C-2024-018'], linked_firs: [] }, x: 640, y: 200, color: '#dc2626' },
    { id: 'pin-rahul', board_id: boardId, entity_type: 'person', entity_id: 'ENT-003', label: 'Rahul Mehta', content: { gender: 'male', role: 'witness', phone: '+91 98XXX X2102', address: 'Freight Corridor Quarters', associates_count: 4, linked_cases: ['C-2024-021'], linked_firs: [] }, x: 240, y: 180, color: '#dc2626' },
    { id: 'pin-priya', board_id: boardId, entity_type: 'person', entity_id: 'ENT-006', label: 'Priya Desai', content: { gender: 'female', role: 'related', phone: '+91 98XXX X2106', address: 'Lake View Apartments', associates_count: 2, linked_cases: ['C-2024-033'], linked_firs: [] }, x: 850, y: 330, color: '#dc2626' },
    { id: 'pin-sun', board_id: boardId, entity_type: 'organization', entity_id: 'ENT-004', label: 'Sun Logistics', content: { phone: '+91 80 41XX XXXX', address: 'Plot 12, Freight Corridor', associates_count: 5, linked_cases: ['C-2024-021'], linked_firs: [] }, x: 650, y: 430, color: '#06b6d4' },
    { id: 'pin-godown', board_id: boardId, entity_type: 'building', entity_id: null, label: 'Godown 7', content: { address: 'Plot 12, Freight Corridor', associates_count: 2, linked_cases: ['C-2024-021'], linked_firs: [] }, x: 400, y: 500, color: '#f59e0b' },
    { id: 'pin-phone1', board_id: boardId, entity_type: 'phone', entity_id: null, label: '+91 98XXX X2100', content: { phone: '+91 98XXX X2100' }, x: 60, y: 140, color: null },
    { id: 'pin-loc1', board_id: boardId, entity_type: 'location', entity_id: null, label: 'Sector 7 crossing', content: { address: 'Sector 7 crossing' }, x: 70, y: 300, color: null },
    { id: 'pin-doc1', board_id: boardId, entity_type: 'document', entity_id: null, label: 'FIR_2024_112.pdf', content: {}, x: 60, y: 460, color: null },
    { id: 'pin-note1', board_id: boardId, entity_type: 'note', entity_id: null, label: 'Watcher note', content: { note_text: ' subject uses a second handset near the freight corridor after dark. verify with call logs.' }, x: 70, y: 600, color: null },
  ]
  const connections: BoardConnection[] = [
    { id: 'conn-1', board_id: boardId, source_pin_id: 'pin-vikram', target_pin_id: 'pin-anita', label: 'knows', confidence: 0.8, notes: null },
    { id: 'conn-2', board_id: boardId, source_pin_id: 'pin-vikram', target_pin_id: 'pin-sun', label: 'funds', confidence: 0.9, notes: null },
    { id: 'conn-3', board_id: boardId, source_pin_id: 'pin-anita', target_pin_id: 'pin-phone1', label: 'uses', confidence: 0.7, notes: null },
    { id: 'conn-4', board_id: boardId, source_pin_id: 'pin-sun', target_pin_id: 'pin-godown', label: 'leases', confidence: 0.85, notes: null },
    { id: 'conn-5', board_id: boardId, source_pin_id: 'pin-doc1', target_pin_id: 'pin-vikram', label: 'names', confidence: 0.95, notes: null },
    { id: 'conn-6', board_id: boardId, source_pin_id: 'pin-vikram', target_pin_id: 'pin-rahul', label: 'met', confidence: 0.6, notes: null },
    { id: 'conn-7', board_id: boardId, source_pin_id: 'pin-anita', target_pin_id: 'pin-priya', label: 'calls', confidence: 0.5, notes: null },
  ]
  return new Map([[boardId, { id: boardId, name: 'Operation Black Kite — board', pins, connections }]])
}

let store: Map<string, BoardState> | null = null
function db(): Map<string, BoardState> {
  if (!store) store = seed()
  return store
}

// Fixture board is seeded as '22222222-2222-2222-2222-222222222222'; unknown ids
// fall back to the fixture instead of 404ing in mock mode.
function resolveBoard(boardId: string): BoardState | undefined {
  return db().get(boardId) ?? db().get('22222222-2222-2222-2222-222222222222')
}

export async function mockGetBoard(boardId: string): Promise<BoardState> {
  await delay()
  if (maybeError(0.05)) throw { message: 'Board failed to load (mock error)' }
  const b = resolveBoard(boardId)
  if (!b) throw { message: 'Board not found', status: 404 }
  return structuredClone(b)
}

export async function mockCreatePin(boardId: string, pin: Omit<BoardPin, 'id' | 'board_id'>): Promise<BoardPin> {
  await delay()
  if (maybeError(0.05)) throw { message: 'Create pin failed (mock error)' }
  const b = resolveBoard(boardId)
  if (!b) throw { message: 'Board not found', status: 404 }
  const created: BoardPin = { ...pin, id: uid('pin'), board_id: boardId }
  b.pins.push(structuredClone(created))
  return created
}

export async function mockCreateConnection(boardId: string, conn: Omit<BoardConnection, 'id' | 'board_id'>): Promise<BoardConnection> {
  await delay()
  if (maybeError(0.05)) throw { message: 'Create connection failed (mock error)' }
  const b = resolveBoard(boardId)
  if (!b) throw { message: 'Board not found', status: 404 }
  const created: BoardConnection = { ...conn, id: uid('conn'), board_id: boardId }
  b.connections.push(structuredClone(created))
  return created
}

export async function mockDeletePin(boardId: string, pinId: string): Promise<void> {
  await delay()
  if (maybeError(0.05)) throw { message: 'Delete pin failed (mock error)' }
  const b = resolveBoard(boardId)
  if (!b) throw { message: 'Board not found', status: 404 }
  b.pins = b.pins.filter((p) => p.id !== pinId)
  b.connections = b.connections.filter((c) => c.source_pin_id !== pinId && c.target_pin_id !== pinId)
}

/** Local-only optimistic writes (no backend endpoint): move + rename. */
export function mockMovePin(boardId: string, pinId: string, x: number, y: number): void {
  const pin = db().get(boardId)?.pins.find((p) => p.id === pinId)
  if (pin) { pin.x = x; pin.y = y }
}

export function mockRenamePin(boardId: string, pinId: string, label: string): void {
  const pin = db().get(boardId)?.pins.find((p) => p.id === pinId)
  if (pin) pin.label = label
}
