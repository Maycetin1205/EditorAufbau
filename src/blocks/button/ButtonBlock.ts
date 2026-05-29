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

  static styles = [
    BasicBlock.styles,
    css`
      button {
        box-sizing: border-box; padding: 8px 16px;
        cursor: pointer; border-radius: 8px; border: 1px solid hsl(214 32% 91%);
        background: white; color: hsl(222 47% 11%); font-size: 13px; font-weight: 500;
        transition: background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
      }
      button:hover { background: hsl(210 40% 98%); }
      button:focus-visible { outline: 2px solid hsl(221 83% 53%); outline-offset: 2px; }
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
