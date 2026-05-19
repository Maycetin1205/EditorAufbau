// HTML-Export Etappe 1: serialisiert den ProjectState in exportierbare Tags.
import { getBlockDefinition } from '../../core/blocks/blockRegistry'
import type { EditorProjectState } from '../../core/blocks/block.types'

export function buildSoftEngineHtml(project: EditorProjectState): string {
  const body = project.rootBlockIds
    .map((id) => {
      const block = project.blocks[id]
      if (!block) return ''

      return `  ${getBlockDefinition(block.type).toHtml(block)}`
    })
    .filter(Boolean)
    .join('\n')

  return `<div class="ff-document">\n${body}\n</div>`
}
