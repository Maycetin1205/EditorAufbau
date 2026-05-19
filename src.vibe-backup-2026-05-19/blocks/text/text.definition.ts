// Text-Definition: verbindet Defaults, Inspector, Web Component und Export.
import type { BlockDefinition } from '../../core/blocks/block.types'
import { buildTextHtml } from './text.export'
import { textInspector } from './text.inspector'
import { textDefaultProps, textPropsSchema } from './text.schema'

export const textDefinition: BlockDefinition = {
  type: 'text',
  title: 'Text',
  description: 'Formatierter Text fuer Ueberschriften und Hinweise.',
  tagName: 'ff-text',
  defaultProps: textDefaultProps,
  schema: textPropsSchema,
  inspector: textInspector,
  toHtml: buildTextHtml,
}
