import { css, html, type TemplateResult } from 'lit'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import { ROOT_TYPE } from '../../core/blocks/BlockData'

export class AnsichtBlock extends BasicBlock {
  static readonly blockType = 'ansicht'
  static readonly tagName = 'ff-ansicht'
  static readonly displayName = 'Ansicht'
  static readonly category: BlockCategory = 'layout'
  static readonly acceptsChildren = true

  static readonly showInPalette = false
  static readonly allowedParentTypes = [ROOT_TYPE]
  static readonly pageBlock = true
  static readonly flaechenSeite = true

  static readonly resizableWidth = false
  static readonly containerHint = false
  static readonly defaultProps = {
    name: 'Ansicht',
  }

  static override styles = [
    BasicBlock.styles,

    css`

      :host { display: contents; }
    `,
  ]

  override render(): TemplateResult {
    return html`<slot></slot>`
  }
}

BasicBlock.defineAndRegister(AnsichtBlock)
