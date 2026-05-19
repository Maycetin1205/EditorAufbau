// Die Registry ist die zentrale Liste aller echten Block-Typen.
import '../../blocks/button/ff-button'
import '../../blocks/text/ff-text'
import { buttonDefinition } from '../../blocks/button/button.definition'
import { textDefinition } from '../../blocks/text/text.definition'
import type { BlockDefinition, BlockType } from './block.types'

export const blockRegistry: Record<BlockType, BlockDefinition> = {
  button: buttonDefinition,
  text: textDefinition,
}

export function getBlockDefinition(type: BlockType): BlockDefinition {
  return blockRegistry[type]
}

export function getBlockDefinitions(): BlockDefinition[] {
  return Object.values(blockRegistry)
}
