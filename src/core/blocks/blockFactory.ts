import type { BlockNode, BlockTree } from './BlockData'
import type { DefaultChildSpec } from './BlockDefinition'
import { getBlockDefinition } from './blockRegistry'
import { deepClone } from '../../lib/deepClone'

export function createBlockNode(type: string, id?: string): BlockNode {
  const def = getBlockDefinition(type)
  if (!def) {
    throw new Error(`Unbekannter Block-Typ: "${type}". Vorher mit registerBlockType registrieren.`)
  }
  return {
    id: id ?? crypto.randomUUID(),
    type,
    props: deepClone(def.defaultProps),
    parentId: null,
    childIds: [],
  }
}

export function createBlockSubtree(type: string): { nodes: BlockTree; rootId: string } {
  const nodes: BlockTree = {}
  const build = (spec: DefaultChildSpec, parentId: string | null): string => {
    const node = createBlockNode(spec.type)
    node.parentId = parentId
    if (spec.props) node.props = { ...node.props, ...deepClone(spec.props) }
    nodes[node.id] = node
    const children = spec.children ?? getBlockDefinition(spec.type)?.defaultChildren ?? []
    node.childIds = children.map((child) => build(child, node.id))
    return node.id
  }
  const rootId = build({ type }, null)
  return { nodes, rootId }
}
