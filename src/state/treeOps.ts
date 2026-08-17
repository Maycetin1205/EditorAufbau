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

  for (const key of Object.keys(next)) {
    if (Object.prototype.hasOwnProperty.call(rawProps, key)) {
      next[key] = rawProps[key]
    }
  }
  return next
}

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
