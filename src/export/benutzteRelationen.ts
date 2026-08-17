import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { relationIdsVon } from '../core/blocks/treeQuery'
import type { RelationTemplate } from '../core/data/relations'

export function collectRelations(
  tree: BlockTree,
  relations: readonly RelationTemplate[],
): RelationTemplate[] {
  const seen = new Set<string>()
  const acc: RelationTemplate[] = []
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    for (const id of relationIdsVon(node)) {
      const rel = relations.find((r) => r.id === id)
      if (!rel || seen.has(rel.id)) continue
      seen.add(rel.id)
      acc.push(rel)
    }
    node.childIds.forEach((id) => visit(tree[id]))
  }
  visit(tree[ROOT_ID])
  return acc
}
