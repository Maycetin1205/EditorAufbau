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

// Das Klonen eines Teilbaums wohnt seit 2026-08-11 in `duplizieren.ts` —
// es ist zweiphasig geworden (Knoten kopieren, DANN die Verweise der Kopie auf
// die Kopie umschreiben) und traegt damit Regeln, die hier nichts zu suchen
// haben. Kein zweiter Klon-Weg: es gibt nur den dortigen.

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
