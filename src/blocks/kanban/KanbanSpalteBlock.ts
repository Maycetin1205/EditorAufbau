// KanbanSpalteBlock
// Spezialisierter Container (4K.4): eine Kanban-Spalte mit Kopf (Titel per
// Doppelklick + Kartenzähler) und Rumpf, der AUSSCHLIESSLICH Karten aufnimmt
// (allowedChildTypes — durchgesetzt im Store + in der Drag-Vorschau, nie per
// `if type===` in der UI). Sie erscheint NICHT in der Bibliothek
// (showInPalette=false): Spalten entstehen über "+ Spalte" am Board.
//
// Der Zähler zählt die geslotteten Kinder selbst (slotchange) und ignoriert
// Editor-Hilfselemente (data-ff-editor-helper wie den "+ Karte"-Knopf) —
// dieselbe Logik läuft im Editor UND im Export (WYSIWYG, 1 Render-Quelle).
// Die Bedeutung der Spalte (Oberlinien-Farbe) kommt aus dem geteilten
// Status-Vokabular (Technikwert != Anzeigename).
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Farb-Literale,
// keine Fallbacks. Verbindliches Zielbild: dashboard/stilprobe.html (.zb-col).

import { css, html, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { FlowDirection } from '../../core/blocks/flowLayout'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { CardBlock } from '../card/CardBlock'
import {
  coerceStatusVariant,
  statusVariantProperty,
  type StatusVariant,
} from '../shared/statusVariant'

export class KanbanSpalteBlock extends BasicBlock {
  static readonly blockType = 'kanban-spalte'
  static readonly tagName = 'ff-kanban-spalte'
  static readonly displayName = 'Kanban-Spalte'
  static readonly category: BlockCategory = 'anzeige'
  static readonly acceptsChildren = true
  static readonly allowedChildTypes = [CardBlock.blockType]
  static readonly childDirection: FlowDirection = 'column'
  static readonly showInPalette = false
  static readonly containerHint = false
  static readonly addChildButton = { label: 'Karte', childType: CardBlock.blockType }
  // width 290: feste Spaltenbreite aus dem Zielbild (flex 0 0 290px) —
  // wirkt über die universelle Flow-Breite, bleibt per Anfasser ziehbar.
  // statusValue (Kap. 5.3): Datenwert dieser Spalte (Technikwert) — Zeilen,
  // deren Spalten-Feld (statusField am Board) genau diesen Wert hat, landen
  // im Export hier. Der sichtbare Titel bleibt davon unabhängig (Technikwert
  // ≠ Anzeigename). Default '' -> überlebt Persistenz, reist als Attribut.
  static readonly defaultProps = {
    variant: 'info',
    heading: 'Neue Spalte',
    statusValue: '',
    width: 290,
  }

  // Inspector: die Bedeutung (-> Farbe der Oberlinie) + der Datenwert der
  // Spalte (nur sichtbar mit Datenquelle in Reichweite). Der Titel läuft
  // über Inline-Edit direkt am Spaltenkopf.
  static override readonly customProperties: PropertyDescription[] = [
    statusVariantProperty(
      'variant',
      'Bedeutung der Spalte — bestimmt die Farbe der Oberlinie.',
    ),
    {
      attributeName: 'statusValue',
      name: 'Datenwert dieser Spalte',
      description: 'Zeilen, deren Spalten-Feld genau diesen Wert hat, landen hier. Kein Treffer irgendwo → erste Spalte. Der sichtbare Titel bleibt unabhängig davon.',
      isArray: false,
      maxLength: 60,
      kind: 'text',
      requiresDataSource: true,
    },
  ]

  // Strukturelle Größen (padding, font-weight, letter-spacing, 3px-Oberlinie,
  // 11.5px Zähler) als Literale exakt nach Zielbild; Farben + Radius +
  // Schriftgrößen aus Tokens.
  static styles = [
    BasicBlock.styles,
    css`
      .col {
        box-sizing: border-box;
        background: var(--se-panel);
        border: 1px solid var(--se-line);
        border-top: 3px solid var(--se-faint);
        border-radius: var(--se-r-lg);
        font-family: var(--se-font);
      }
      .col.v-info { border-top-color: var(--se-blue); }
      .col.v-success { border-top-color: var(--se-green); }
      .col.v-warning { border-top-color: var(--se-amber); }
      .col.v-danger { border-top-color: var(--se-red); }
      .head {
        display: flex;
        align-items: center;
        gap: var(--se-gap-sm);
        padding: 9px 11px;
        border-bottom: 1px solid var(--se-line-soft);
      }
      .title {
        color: var(--se-ink);
        font-size: var(--se-fs-sm);
        font-weight: 700;
        letter-spacing: 0.09em;
        text-transform: uppercase;
      }
      .count {
        margin-left: auto;
        min-width: 22px;
        height: 20px;
        padding: 0 6px;
        border-radius: var(--se-r-sm);
        background: var(--se-panel-2);
        border: 1px solid var(--se-line-soft);
        display: grid;
        place-items: center;
        font-family: var(--se-mono);
        font-size: 11.5px;
        font-weight: 600;
        color: var(--se-muted);
      }
      .body {
        padding: 11px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--se-gap);
        min-height: 150px;
      }
      .drop {
        border: 1.5px dashed var(--se-line);
        border-radius: var(--se-r-md);
        color: var(--se-faint);
        font-size: var(--se-fs-sm);
        text-align: center;
        padding: 16px 8px;
      }
      slot { display: contents; }
    `,
  ]

  @property() variant: StatusVariant = 'info'
  @property() heading = 'Neue Spalte'

  // Kartenzähler: aus den geslotteten Kindern abgeleitet, nie gepflegt.
  @state() private _count = 0

  private onSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement
    this._count = slot
      .assignedElements()
      .filter((el) => !el.hasAttribute('data-ff-editor-helper'))
      .length
  }

  render(): TemplateResult {
    const v = coerceStatusVariant(this.variant)
    return html`<div class="col v-${v}">
      <div class="head">
        <span
          class="title"
          data-ff-editable
          @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'heading')}
        >${this.heading}</span>
        <span class="count">${this._count}</span>
      </div>
      <div class="body">
        ${this._count === 0 ? html`<div class="drop">Karte hierher ziehen</div>` : null}
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    </div>`
  }
}

BasicBlock.defineAndRegister(KanbanSpalteBlock)
