import type { BlockNode, BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { firstDescendantOfType } from '../core/blocks/treeQuery'
import { collectSubtree } from './treeOps'

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

export function templateMarkFor(tree: BlockTree, id: string): string | undefined {
  const boardId = owningTemplateBoardId(tree, id)
  return boardId
    ? getBlockDefinition(tree[boardId].type)?.templateChild?.label
    : undefined
}

export function isRemoveProtected(tree: BlockTree, id: string): boolean {
  const remove = new Set(collectSubtree(tree, id))
  for (const nid of remove) {
    const boardId = owningTemplateBoardId(tree, nid)
    if (boardId && !remove.has(boardId)) return true
  }
  return false
}
