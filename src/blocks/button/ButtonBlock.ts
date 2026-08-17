import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { connectClickAktionen } from '../shared/seAktionen'

export class ButtonBlock extends BasicBlock {
  static readonly blockType = 'button'
  static readonly tagName = 'ff-button'
  static readonly displayName = 'Schaltfläche'
  static readonly category: BlockCategory = 'eingabe'
  static readonly defaultProps = { label: 'Klick mich' }

  static readonly resizableWidth = false

  static readonly blockEvents = [{ key: 'onClick', name: 'Klick' }]

  static readonly raster = { startW: 4, startH: 2, minW: 2, minH: 2 }

  static override readonly customProperties: PropertyDescription[] = []

  static override styles = [
    BasicBlock.styles,
    css`
      button {
        box-sizing: border-box;
        padding: 7px 16px;
        cursor: pointer;
        border-radius: var(--se-r-md);
        border: var(--se-border) solid var(--se-accent);
        background: var(--se-accent);
        color: var(--se-panel);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        font-weight: 600;

        line-height: 1.2;

        transition: background-color var(--se-move), border-color var(--se-move);
      }
      button:hover { background: var(--se-accent-dark); border-color: var(--se-accent-dark); }

      button:active { background: var(--se-accent-dark); border-color: var(--se-ink); }
      button:focus-visible { outline: 2px solid var(--se-accent); outline-offset: 2px; }

      :host([fuellt]) button { width: 100%; height: 100%; }
    `,
  ]

  @property() label = 'Klick mich'

  override render(): TemplateResult {
    return html`<button
      data-ff-editable
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'label')}
    >${this.label}</button>`
  }

  override connectedCallback(): void {
    super.connectedCallback()
    connectClickAktionen(this, 'onClick')
  }
}

BasicBlock.defineAndRegister(ButtonBlock)
