// TextBlock
// Lit Web Component fuer den Text-Block. Erbt von BasicBlock.
// Fachlich nur Text. Typografie/Farbe/Layout gehoeren nicht als rohe
// Inspector-Felder in den Block, sondern spaeter in ein sauberes Design-System.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

export class TextBlock extends BasicBlock {
  static readonly blockType = 'text'
  static readonly tagName = 'ff-text'
  static readonly displayName = 'Textblock'
  static readonly category: BlockCategory = 'anzeige'
  static readonly defaultProps = {
    text: 'Neuer Text',
  }

  // Keine Inspector-Felder: der Text wird per Doppelklick direkt auf dem Block
  // bearbeitet (WYSIWYG, siehe render + BasicBlock.inlineEdit).
  static override readonly customProperties: PropertyDescription[] = []

  // Aussehen kommt AUSSCHLIESSLICH aus den Masken-Tokens (--se-*),
  // siehe src/design/masken-tokens.css. Keine Literale, keine Fallbacks.
  static styles = [
    BasicBlock.styles,
    css`
      span {
        display: block;
        min-width: 1ch;
        color: var(--se-ink);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        line-height: 1.45;
      }
    `,
  ]

  @property() text = 'Neuer Text'

  render(): TemplateResult {
    return html`<span
      data-ff-editable
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'text')}
    >${this.text}</span>`
  }
}

BasicBlock.defineAndRegister(TextBlock)
