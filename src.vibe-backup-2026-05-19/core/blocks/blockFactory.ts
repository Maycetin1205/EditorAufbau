// Factory: neue Blocks entstehen aus Registry-Defaults, nicht aus UI-Komponenten.
import { getBlockDefinition } from './blockRegistry'
import type { BlockType, EditorBlock } from './block.types'

export function createBlock(type: BlockType, order: number): EditorBlock {
  const definition = getBlockDefinition(type)
  const props = definition.schema.parse(definition.defaultProps)

  return {
    id: crypto.randomUUID(),
    type,
    layout: {
      parentId: null,
      order,
    },
    props,
    events: {},
    bindings: {},
  }
}
