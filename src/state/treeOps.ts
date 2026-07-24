// treeOps — reine Baum-Helfer des Editor-Stores.
// Verhaltensgleich herausgezogen aus Editor.ts:
// kein Zustand, kein DOM — alle Funktionen bekommen alles hereingereicht.

import {
  ROOT_ID,
  ROOT_TYPE,
  type BlockNode,
  type BlockTree,
} from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { deepClone } from '../lib/deepClone'

export function createRootNode(): BlockNode {
  return { id: ROOT_ID, type: ROOT_TYPE, props: {}, parentId: null, childIds: [] }
}

export function createEmptyTree(): BlockTree {
  return { [ROOT_ID]: createRootNode() }
}

export function normalizeProps(type: string, rawProps: Record<string, unknown>): Record<string, unknown> {
  const def = getBlockDefinition(type)
  if (!def) return {}
  const next = deepClone(def.defaultProps)
  // Übernommen wird jede Prop, die der Block als defaultProp kennt — nicht nur
  // Inspector-Felder (customProperties). Blöcke ohne Inspector-Felder (Button,
  // Text: Inline-Edit per Doppelklick) würden sonst beim Laden jede Änderung
  // verlieren. Unbekannte Keys werden weiterhin verworfen.
  for (const key of Object.keys(next)) {
    if (Object.prototype.hasOwnProperty.call(rawProps, key)) {
      next[key] = rawProps[key]
    }
  }
  return next
}

// Klont einen Teilbaum (Knoten + Nachfahren) mit frischen ids.
export function cloneSubtree(
  tree: BlockTree,
  id: string,
): { nodes: BlockTree; rootId: string } {
  const nodes: BlockTree = {}
  const cloneRec = (srcId: string, parentId: string | null): string => {
    const src = tree[srcId]
    const newId = crypto.randomUUID()
    const childIds = src.childIds.map((c) => cloneRec(c, newId))
    nodes[newId] = {
      id: newId,
      type: src.type,
      props: deepClone(src.props),
      // Aktionsketten gehören zum Baustein — die Kopie behält sie.
      ...(src.events ? { events: deepClone(src.events) } : {}),
      parentId,
      childIds,
    }
    return newId
  }
  const rootId = cloneRec(id, tree[id].parentId)
  return { nodes, rootId }
}

// Alle ids eines Teilbaums (Knoten + Nachfahren) in Baumreihenfolge.
export function collectSubtree(tree: BlockTree, id: string): string[] {
  const acc: string[] = []
  const rec = (nid: string): void => {
    const n = tree[nid]
    if (!n) return
    acc.push(nid)
    n.childIds.forEach(rec)
  }
  rec(id)
  return acc
}
