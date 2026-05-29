// blockFactory
// Erzeugt einen serialisierbaren BlockNode aus Typ-Name + Defaults aus Registry.
// Editor.addBlock(type) ruft das auf und hängt den Knoten in den Baum
// (setzt parentId + childIds). Der Knoten kommt hier zunächst losgelöst
// (parentId null, keine Kinder).
//
// Wichtig: defaultProps können verschachtelte Werte enthalten — diese müssen
// pro Instanz frisch sein, sonst teilen sich zwei Blocks dasselbe Array.
// Daher Deep-Clone (structuredClone fällt auf JSON-Clone zurück).

import type { BlockNode } from './BlockData'
import { getBlockDefinition } from './blockRegistry'
import { deepClone } from '../../lib/deepClone'

export function createBlockNode(type: string, id?: string): BlockNode {
  const def = getBlockDefinition(type)
  if (!def) {
    throw new Error(`Unbekannter Block-Typ: "${type}". Vorher mit registerBlockType registrieren.`)
  }
  return {
    id: id ?? crypto.randomUUID(),
    type,
    props: deepClone(def.defaultProps),
    parentId: null,
    childIds: [],
  }
}
