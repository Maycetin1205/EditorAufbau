// templateRules — Musterkarten-Regeln (Markierung + Löschschutz).
// A1-Umzug 2026-07-16 (Aufräum.md), verhaltensgleich aus Editor.ts:
// reine Funktionen über den Baum; Export (<template>) und Laufzeit
// (seRuntime) nutzen DIESELBE Definition (treeQuery). Registry-getrieben,
// kein `if type===`.

import type { BlockNode, BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { firstDescendantOfType } from '../core/blocks/treeQuery'
import { collectSubtree } from './treeOps'

// Der Block, dessen templateChild-Deklaration diesen Knoten zur
// Musterkarte macht (undefined = keine Musterkarte).
export function owningTemplateBoardId(tree: BlockTree, id: string): string | undefined {
  const node = tree[id]
  if (!node) return undefined
  let cur: BlockNode | undefined = node.parentId ? tree[node.parentId] : undefined
  while (cur) {
    const tc = getBlockDefinition(cur.type)?.templateChild
    if (tc && tc.type === node.type) {
      return firstDescendantOfType(tree, cur.id, tc.type) === id ? cur.id : undefined
    }
    cur = cur.parentId ? tree[cur.parentId] : undefined
  }
  return undefined
}

// Musterkarten-Markierung (P1.1, templateChild in der Registry): liefert
// das Label, wenn der Block die ERSTE Nachfahren-Karte des deklarierten
// Typs unter dem nächsten passenden Vorfahren ist.
export function templateMarkFor(tree: BlockTree, id: string): string | undefined {
  const boardId = owningTemplateBoardId(tree, id)
  return boardId
    ? getBlockDefinition(tree[boardId].type)?.templateChild?.label
    : undefined
}

// Löschschutz: true, wenn der Teilbaum eine Musterkarte enthält, deren
// Board NICHT mit gelöscht wird (das ganze Board löschen bleibt erlaubt).
export function isRemoveProtected(tree: BlockTree, id: string): boolean {
  const remove = new Set(collectSubtree(tree, id))
  for (const nid of remove) {
    const boardId = owningTemplateBoardId(tree, nid)
    if (boardId && !remove.has(boardId)) return true
  }
  return false
}
