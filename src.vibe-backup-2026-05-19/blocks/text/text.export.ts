// Export-Vertrag fuer Text: dieselbe Web Component wird als HTML-Tag serialisiert.
import type { EditorBlock } from '../../core/blocks/block.types'
import { textPropsSchema } from './text.schema'

const escapeAttribute = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

export function buildTextHtml(block: EditorBlock): string {
  const props = textPropsSchema.parse(block.props)

  return `<ff-text content="${escapeAttribute(props.content)}" size="${props.size}" tone="${props.tone}" align="${props.align}"></ff-text>`
}
