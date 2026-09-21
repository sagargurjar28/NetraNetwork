import type { NodeTypes } from '@xyflow/react'
import { PersonNode } from './PersonNode'
import { OrganizationNode, BuildingNode } from './OrgBuildingNodes'
import { PhoneNode, LocationNode, DocumentNode, NoteNode } from './SecondaryNodes'

/**
 * Module-level constant: React Flow re-mounts every node when these
 * references change, so never define them inside a component render.
 */
export const nodeTypes: NodeTypes = {
  person: PersonNode,
  organization: OrganizationNode,
  building: BuildingNode,
  phone: PhoneNode,
  location: LocationNode,
  document: DocumentNode,
  note: NoteNode,
}

export type { PinData } from './PersonNode'
