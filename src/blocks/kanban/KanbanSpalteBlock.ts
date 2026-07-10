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
import type { FlowDirection, FlowWidth } from '../../core/blocks/flowLayout'
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
  // P1.1 (Vorlagen-Kasten abgeschafft): Spalten nehmen wieder Karten auf —
  // die ERSTE Karte des Boards ist die Musterkarte (templateChild am Board),
  // dezent markiert im Editor. "+ Karte" stellt sie nach dem Löschen wieder
  // her bzw. legt weitere Gestaltungs-Karten an.
  static readonly allowedChildTypes: string[] = [CardBlock.blockType]
  static readonly childDirection: FlowDirection = 'column'
  static readonly showInPalette = false
  static readonly containerHint = false
  static readonly addChildButton = { label: 'Karte', childType: CardBlock.blockType }
  // S3: Spalten leben NUR im Board (Gegenrichtung zu allowedChildTypes; als
  // Literal, weil ein Import von KanbanBlock einen Import-Zyklus ergäbe).
  // K0/Entscheidung A: Spalten haben KEINE einstellbare Breite — sie teilen
  // sich die Board-Zeile IMMER gleichmäßig (lockedWidth 'fill' → flex-basis
  // 0 + min-width 0): keine Mindestbreite, kein Umbruch, kein horizontaler
  // Scroll. Karten scrollen senkrecht IM Spaltenrumpf (.body).
  static readonly allowedParentTypes = ['kanban']
  static readonly lockedWidth: FlowWidth = 'fill'
  static readonly resizableWidth = false
  // statusValue (Kap. 5.3): Datenwert dieser Spalte (Technikwert) — Zeilen,
  // deren Spalten-Feld (statusField am Board) genau diesen Wert hat, landen
  // im Export hier. Der sichtbare Titel bleibt davon unabhängig (Technikwert
  // ≠ Anzeigename). Default '' -> überlebt Persistenz, reist als Attribut.
  static readonly defaultProps = {
    variant: 'info',
    heading: 'Neue Spalte',
    statusValue: '',
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
      /* height:100% laesst die Spalte die Board-Hoehe ausfuellen — im
         Export ist sie direktes Flex-Item (stretch), im Editor reicht der
         BlockHost-Wrapper die Hoehe per 100%-Kette durch. Ohne feste
         Board-Hoehe loest sich 100% zu auto auf (stretch wie bisher). */
      :host { height: 100%; }
      .col {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
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
        flex: none;
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
      /* K0: der Rumpf scrollt senkrecht (Empfang-Vorbild .vspalte-karten);
         min-height:0 erlaubt ihm, bei fester Board-Höhe kleiner zu werden
         als sein Inhalt — der Leer-Hinweis hält leere Spalten offen. */
      .body {
        padding: 11px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--se-gap);
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
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
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    </div>`
  }
}

BasicBlock.defineAndRegister(KanbanSpalteBlock)
