// ButtonBlock
// Lit Web Component fuer den Button-Block.
// Konkrete Block-Klasse, erbt von BasicBlock (Notiz Woche 2: KanbanBoard
// extends BasicComponentForGrid). Properties via Lit @property() (reaktiv).
// customProperties() liefert die Inspector-Felder (Polymorphie zur Basisklasse).
// Render ist echter Lit-`html`-Template — kein unsafeHTML, keine HTML-Strings.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

export class ButtonBlock extends BasicBlock {
  static readonly blockType = 'button'
  static readonly tagName = 'ff-button'
  static readonly displayName = 'Schaltfläche'
  static readonly category: BlockCategory = 'eingabe'
  static readonly defaultProps = { label: 'Klick mich' }

  // Keine Inspector-Felder: die Beschriftung wird per Doppelklick direkt auf dem
  // Button bearbeitet (WYSIWYG, siehe render + BasicBlock.inlineEdit).
  static override readonly customProperties: PropertyDescription[] = []

  // Aussehen kommt AUSSCHLIESSLICH aus den Masken-Tokens (--se-*),
  // siehe src/design/masken-tokens.css. Keine Literale, keine Fallbacks.
  static styles = [
    BasicBlock.styles,
    css`
      button {
        box-sizing: border-box;
        padding: 7px 16px;
        cursor: pointer;
        border-radius: var(--se-r-sm);
        border: 1px solid var(--se-accent);
        background: var(--se-accent);
        color: var(--se-panel);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        font-weight: 600;
        transition: background-color 120ms ease, border-color 120ms ease;
      }
      button:hover { background: var(--se-accent-dark); border-color: var(--se-accent-dark); }
      button:focus-visible { outline: 2px solid var(--se-accent); outline-offset: 2px; }
    `,
  ]

  @property() label = 'Klick mich'

  render(): TemplateResult {
    return html`<button
      data-ff-editable
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'label')}
    >${this.label}</button>`
  }
}

BasicBlock.defineAndRegister(ButtonBlock)
