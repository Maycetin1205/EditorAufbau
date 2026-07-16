// treeOps (U4)
// Reine Baumoperationen auf dem BlockNode-Baum (flache Map + Wurzel).
// Kein Zustand, kein Store-Wissen: jede Funktion bekommt den Baum als
// Argument — der Editor (Store-Kern) delegiert hierher.

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

// Alle ids des Teilbaums unter `id` (inkl. `id` selbst), in Vorordnung.
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

// true, wenn `id` im Teilbaum von `ancestorId` liegt (inkl. ancestorId
// selbst). Für die UI: ein Container darf nie in sich selbst fallen.
export function isInSubtree(tree: BlockTree, ancestorId: string, id: string): boolean {
  let cur: string | null | undefined = id
  while (cur) {
    if (cur === ancestorId) return true
    cur = tree[cur]?.parentId
  }
  return false
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
      // Aktionsketten (Z2) gehören zum Baustein — die Kopie behält sie.
      ...(src.events ? { events: deepClone(src.events) } : {}),
      parentId,
      childIds,
    }
    return newId
  }
  const rootId = cloneRec(id, tree[id].parentId)
  return { nodes, rootId }
}
