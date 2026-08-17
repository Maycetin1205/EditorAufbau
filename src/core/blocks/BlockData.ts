import type { BlockEventsMap } from '../data/aktionen'

export interface BlockNode {
  id: string
  type: string
  props: Record<string, unknown>

  events?: BlockEventsMap
  parentId: string | null
  childIds: string[]
}

export type BlockTree = Record<string, BlockNode>

export const ROOT_ID = 'root'
export const ROOT_TYPE = 'root'
