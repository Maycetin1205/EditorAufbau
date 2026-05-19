// Button-Definition: Palette, Defaults, Inspector und Export zeigen auf denselben Block.
import type { BlockDefinition } from '../../core/blocks/block.types'
import { buildButtonHtml } from './button.export'
import { buttonInspector } from './button.inspector'
import { buttonDefaultProps, buttonPropsSchema } from './button.schema'

export const buttonDefinition: BlockDefinition = {
  type: 'button',
  title: 'Button',
  description: 'Klickbarer Aktions-Button fuer SoftEngine-Ablaufe.',
  tagName: 'ff-button',
  defaultProps: buttonDefaultProps,
  schema: buttonPropsSchema,
  inspector: buttonInspector,
  toHtml: buildButtonHtml,
}
