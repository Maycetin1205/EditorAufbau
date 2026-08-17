import { getBlockDefinition } from './blockRegistry'
import type { BlockNode, BlockTree } from './BlockData'

export const RAND = { breite: 56, breiteOffen: 224 } as const

export function istRandBaustein(node: BlockNode): boolean {
  return getBlockDefinition(node.type)?.maskenRand === true
}

export function randItemStyle(): Record<string, string | number> {
  return {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,

    zIndex: 5,
  }
}

export function randPlatzLinks(tree: BlockTree): number {
  for (const node of Object.values(tree)) {
    if (node && istRandBaustein(node)) return RAND.breite
  }
  return 0
}
