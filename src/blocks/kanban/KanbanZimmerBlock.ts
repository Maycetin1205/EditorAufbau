import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { FlowDirection, FlowWidth } from '../../core/blocks/flowLayout'
import { CardBlock } from '../card/CardBlock'
import { leerStil, leerZustand } from '../shared/leerZustand'
import { ZIEL_KLASSE, zielStil } from '../shared/zielStil'
import { kartenAbstandStil } from './kartenAbstand'

export const ZIMMER_LEER_TEXT = 'frei · hierher ziehen'

export const ZIMMER_INHALT_EVENT = 'ff-zimmer-inhalt'

export class KanbanZimmerBlock extends BasicBlock {
  static readonly blockType = 'kanban-zimmer'
  static readonly tagName = 'ff-kanban-zimmer'
  static readonly displayName = 'Kanban-Zimmer'
  static readonly category: BlockCategory = 'anzeige'
  static readonly acceptsChildren = true
  static readonly allowedChildTypes: string[] = [CardBlock.blockType]
  static readonly childDirection: FlowDirection = 'column'
  static readonly showInPalette = false
  static readonly containerHint = false

  static readonly allowedParentTypes = ['kanban-spalte']

  static readonly lockedWidth: FlowWidth = 'fill'
  static readonly resizableWidth = false
  static readonly defaultProps = {
    heading: 'Neues Zimmer',
  }

  static override styles = [
    BasicBlock.styles,
    leerStil,
    kartenAbstandStil,
    zielStil,
    css`
      :host { display: block; }

      .kopf {
        padding: 2px 2px 0;
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        font-weight: 700;
        line-height: 1.3;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--se-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .body {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      .zimmer {
        border-radius: var(--se-r-md);
      }
    `,
  ]

  @property() heading = 'Neues Zimmer'

  @property({ attribute: false }) leerHinweis = ''

  private onSlotChange(): void {
    this.dispatchEvent(new CustomEvent(ZIMMER_INHALT_EVENT, {
      bubbles: true,
      composed: true,
    }))
  }

  override render(): TemplateResult {
    return html`<div class="zimmer ${ZIEL_KLASSE}">
      <div
        class="kopf"
        data-ff-editable
        @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'heading')}
      >${this.heading}</div>
      <div class="body">
        <slot @slotchange=${this.onSlotChange}></slot>
        ${leerZustand(this.leerHinweis)}
      </div>
    </div>`
  }
}

BasicBlock.defineAndRegister(KanbanZimmerBlock)
