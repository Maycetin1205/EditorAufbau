// treeQuery
// Reine Baum-Abfragen ohne Store-Bindung. Die Musterkarte hat EINE
// Definition im ganzen System: die ERSTE Nachfahren-Instanz des
// templateChild-Typs in Baumreihenfolge (DFS). Dieselbe Definition nutzen
// der Editor (Muster-Markierung + Löschschutz), der Export (<template>-
// Verpackung) und die Laufzeit (seRuntime klont das template-Element).

import type { BlockTree } from './BlockData'

export function firstDescendantOfType(
  tree: BlockTree,
  rootId: string,
  type: string,
): string | undefined {
  for (const cid of tree[rootId]?.childIds ?? []) {
    const child = tree[cid]
    if (!child) continue
    if (child.type === type) return cid
    const found = firstDescendantOfType(tree, cid, type)
    if (found) return found
  }
  return undefined
}
