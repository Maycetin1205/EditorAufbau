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

// Erzeugt einen Block SAMT seiner defaultChildren (rekursiv, frische IDs).
// Beispieldaten-Regel der Bedienlogik: ein Baustein erscheint nie als leeres
// Gerippe — das Kanban-Board bringt z.B. 3 Spalten mit Karten mit.
// Rueckgabe: alle Knoten als Map + die ID des Wurzelknotens des Teilbaums.
export function createBlockSubtree(type: string): { nodes: BlockTree; rootId: string } {
  const nodes: BlockTree = {}

  const build = (t: string, specProps: Record<string, unknown> | undefined, parentId: string | null, children: readonly DefaultChildSpec[] | undefined): string => {
    const node = createBlockNode(t)
    node.parentId = parentId
    // Spec-Props ueberschreiben die Defaults des Kind-Typs (z.B. Kartentexte).
    if (specProps) node.props = { ...node.props, ...deepClone(specProps) }
    nodes[node.id] = node
    const specs = children ?? getBlockDefinition(t)?.defaultChildren ?? []
    node.childIds = specs.map((c) => build(c.type, c.props, node.id, c.children))
    return node.id
  }

  const rootId = build(type, undefined, null, undefined)
  return { nodes, rootId }
}
