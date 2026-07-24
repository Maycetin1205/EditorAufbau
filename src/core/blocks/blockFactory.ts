// blockFactory
// Erzeugt einen serialisierbaren BlockNode aus Typ-Name + Defaults aus Registry.
// Editor.addBlock(type) ruft das auf und hängt den Knoten in den Baum
// (setzt parentId + childIds). Der Knoten kommt hier zunächst losgelöst
// (parentId null, keine Kinder).
//
// Wichtig: defaultProps können verschachtelte Werte enthalten — diese müssen
// pro Instanz frisch sein, sonst teilen sich zwei Blocks dasselbe Array.
// Daher Deep-Clone (structuredClone fällt auf JSON-Clone zurück).

import type { BlockNode, BlockTree } from './BlockData'
import type { DefaultChildSpec } from './BlockDefinition'
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

// Erzeugt einen Block MITSAMT seiner Beispieldaten (defaultChildren aus der
// Registry) als losgelösten Teilbaum. Ein Spec mit eigenem
// `children` gewinnt; ohne Spec gelten die defaultChildren des Typs — so
// bringt eine per "+ Spalte" erzeugte Kanban-Spalte NICHT die Beispielkarten
// des Boards mit, ein frisches Board aber schon.
export function createBlockSubtree(type: string): { nodes: BlockTree; rootId: string } {
  const nodes: BlockTree = {}
  const build = (spec: DefaultChildSpec, parentId: string | null): string => {
    const node = createBlockNode(spec.type)
    node.parentId = parentId
    if (spec.props) node.props = { ...node.props, ...deepClone(spec.props) }
    nodes[node.id] = node
    const children = spec.children ?? getBlockDefinition(spec.type)?.defaultChildren ?? []
    node.childIds = children.map((child) => build(child, node.id))
    return node.id
  }
  const rootId = build({ type }, null)
  return { nodes, rootId }
}
