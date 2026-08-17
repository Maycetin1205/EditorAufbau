import { css, html, type TemplateResult } from 'lit'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { DefaultChildSpec, SatzWahl } from '../../core/blocks/BlockDefinition'
import type { FlowDirection, FlowWidth } from '../../core/blocks/flowLayout'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { CardBlock } from '../card/CardBlock'
import { LEER_TEXT_STANDARD, leerTextProperty } from '../shared/leerZustand'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'
import { connectBoard, disconnectBoard } from './seRuntime'

const SPALTE = KanbanSpalteBlock.blockType

export class KanbanBlock extends BasicBlock {
  static readonly blockType = 'kanban'
  static readonly tagName = 'ff-kanban'
  static readonly displayName = 'Kanban'
  static readonly category: BlockCategory = 'anzeige'
  static readonly acceptsChildren = true
  static readonly allowedChildTypes = [SPALTE]
  static readonly childDirection: FlowDirection = 'row'

  static readonly lockedWidth: FlowWidth = 'fill'
  static readonly resizableWidth = false
  static readonly containerHint = false
  static readonly addChildButton = { label: 'Spalte', childType: SPALTE }

  static readonly templateChild = { type: CardBlock.blockType, label: 'Muster' }

  static readonly resizableHeight = true

  static readonly acceptsDataSource = true

  static readonly satzWahl: SatzWahl = {}

  static readonly blockEvents = [
    { key: 'onCardClick', name: 'Karte angeklickt' },
    { key: 'onCardDrop', name: 'Karte verschoben' },
  ]

  static readonly defaultProps = {
    width: 'fill', height: 'fill' as const,
    source: '', statusField: '', tagField: '',
    leerText: LEER_TEXT_STANDARD,
  }

  static readonly raster = { startW: 24, startH: 20, minW: 6, minH: 8 }
  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'statusField',
      name: 'Einsortieren nach',
      description: 'Optional: Feld der Datenquelle, dessen Inhalt bestimmt, in welche Spalte ein Eintrag kommt. Leer = alle Einträge in der Auffang-Spalte.',      kind: 'field',
    },
    {
      attributeName: 'tagField',
      name: 'Tag filtern nach',
      description: 'Optional: Feld der Datenquelle, in dem das Datum steht. Gesetzt zeigt das Board nur Einträge des Tages, den der Tageswähler zeigt. Leer = alle Einträge.',
      kind: 'field',
    },

    leerTextProperty(),
  ]

  static readonly defaultChildren: DefaultChildSpec[] = [
    {
      type: SPALTE,
      props: { heading: 'Offen', variant: 'warning' },
      children: [{ type: CardBlock.blockType }],
    },
    { type: SPALTE, props: { heading: 'In Arbeit', variant: 'info' } },
    { type: SPALTE, props: { heading: 'Fertig', variant: 'success' } },
  ]

  static override styles = [
    BasicBlock.styles,
    css`

      :host { min-width: 0; height: 100%; }
      .board {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        gap: var(--se-gap-lg);
        height: 100%;
        box-sizing: border-box;
      }
      .board slot { display: contents; }
    `,
  ]

  override render(): TemplateResult {
    return html`<div class="board"><slot></slot></div>`
  }

  override connectedCallback(): void {
    super.connectedCallback()
    connectBoard(this)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    disconnectBoard(this)
  }
}

BasicBlock.defineAndRegister(KanbanBlock)
