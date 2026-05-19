// Export-Vertrag fuer Button: gleiche Komponente, nur als HTML-Tag serialisiert.
import type { EditorBlock } from '../../core/blocks/block.types'
import { buttonPropsSchema } from './button.schema'

const escapeAttribute = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

export function buildButtonHtml(block: EditorBlock): string {
  const props = buttonPropsSchema.parse(block.props)
  const disabled = props.disabled ? ' disabled' : ''

  return `<ff-button label="${escapeAttribute(props.label)}" variant="${props.variant}" action-id="${escapeAttribute(props.actionId)}"${disabled}></ff-button>`
}
