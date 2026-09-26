import type { NodeTypes } from '@xyflow/react'
import type { BoardPin } from '@/services/api/boards'
import { PersonNodeVertical } from './PersonNodeVertical'
import { OrganizationNode, BuildingNode } from './OrgBuildingNodes'
import { PhoneNode, LocationNode, DocumentNode, NoteNode } from './SecondaryNodes'
import { CaseNode, FirNode, BankNode } from './RecordNodes'

/**
 * Module-level constant: React Flow re-mounts every node when these
 * references change, so never define them inside a component render.
 */
export const nodeTypes: NodeTypes = {
  person: PersonNodeVertical,
  organization: OrganizationNode,
  building: BuildingNode,
  phone: PhoneNode,
  location: LocationNode,
  document: DocumentNode,
  note: NoteNode,
  case: CaseNode,
  fir: FirNode,
  bankaccount: BankNode,
}

/**
 * READ SITE: content.original_type takes priority over entity_type.
 * The backend only accepts person-like types for org/building pins, so the
 * write site stores the real type here and entity_type arrives as 'person'.
 */
export function resolveNodeType(pin: BoardPin): string {
  const orig = pin.content?.original_type
  if (typeof orig === 'string' && orig in nodeTypes) return orig
  return pin.entity_type
}

export type { PinData } from './PersonNode'
