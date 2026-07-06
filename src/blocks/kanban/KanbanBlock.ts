// KanbanBlock
// Organismus (4K.4): das Kanban-Board = Zeile aus Spalten. Nimmt
// AUSSCHLIESSLICH Kanban-Spalten auf (erlaubte Kind-Typen über die Registry);
// die feste Kind-Richtung 'row' kommt ebenfalls aus der Registry — Canvas
// und Export lesen dieselbe Quelle (childFlowDirection, WYSIWYG).
//
// Karten und Spalten ziehen läuft über die VORHANDENE Canvas-Drag-Logik
// (Kap. 2.3) — das Board hat keine eigene Drag-Sonderlogik. Plus-Knöpfe
// ("+ Spalte" am Board, "+ Karte" in der Spalte) sind Editor-Hilfen des
// Canvas, generisch aus allowedChildTypes — nichts davon steckt im Block.
//
// Beispieldaten (Bedienlogik: nie ein leeres Gerippe): 3 Spalten
// Offen/In Arbeit/Fertig mit Karten — exakt das abgenommene Zielbild
// dashboard/stilprobe.html (.zb-board).
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*).

import { css, html, type TemplateResult } from 'lit'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory, DefaultChildSpec } from '../../core/blocks/BlockComponent'
import type { FlowDirection } from '../../core/blocks/flowLayout'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { CardBlock } from '../card/CardBlock'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'

const SPALTE = KanbanSpalteBlock.blockType
const KARTE = CardBlock.blockType

export class KanbanBlock extends BasicBlock {
  static readonly blockType = 'kanban'
  static readonly tagName = 'ff-kanban'
  static readonly displayName = 'Kanban'
  static readonly category: BlockCategory = 'anzeige'
  static readonly acceptsChildren = true
  static readonly allowedChildTypes = [SPALTE]
  static readonly childDirection: FlowDirection = 'row'
  static readonly defaultProps = { width: 'fill' }

  static readonly defaultChildren: DefaultChildSpec[] = [
    {
      type: SPALTE,
      props: { heading: 'Offen', variant: 'warning' },
      children: [
        { type: KARTE, props: { heading: 'Rückruf Fr. Wagner', text: 'Befund Minka besprechen', chipVariant: 'warning', chipText: 'Wartet seit 2 Tagen' } },
        { type: KARTE, props: { heading: 'Rechnung Nr. 5012 prüfen', text: 'Position Narkose fehlt', chipVariant: 'danger', chipText: 'Überfällig' } },
        { type: KARTE, props: { heading: 'Impfpass nachtragen', text: 'Buddy · Golden Retriever', chipVariant: 'info', chipText: 'Heute' } },
      ],
    },
    {
      type: SPALTE,
      props: { heading: 'In Arbeit', variant: 'info' },
      children: [
        { type: KARTE, props: { heading: 'Röntgenbilder anfordern', text: 'Klinik Dr. Steiner, Fall Rocky', chipVariant: 'info', chipText: 'Angefragt' } },
      ],
    },
    {
      type: SPALTE,
      props: { heading: 'Fertig', variant: 'success' },
      children: [
        { type: KARTE, props: { heading: 'Laborprobe versendet', text: 'Nala · Blutbild groß', chipVariant: 'success', chipText: 'Erledigt' } },
        { type: KARTE, props: { heading: 'Bestellung Verbandsmaterial', text: 'Lieferung bestätigt für Montag', chipVariant: 'success', chipText: 'Erledigt' } },
      ],
    },
  ]

  static override readonly customProperties: PropertyDescription[] = []

  static styles = [
    BasicBlock.styles,
    css`
      .board {
        display: flex;
        align-items: flex-start;
        gap: var(--se-gap-lg);
        /* Mehr Spalten als Platz: das Board scrollt horizontal (Kanban-
           Konvention), statt die Maske zu sprengen — im Editor wie im
           Export dasselbe Verhalten (WYSIWYG). */
        overflow-x: auto;
      }
      slot { display: contents; }
    `,
  ]

  render(): TemplateResult {
    return html`<div class="board"><slot></slot></div>`
  }
}

BasicBlock.defineAndRegister(KanbanBlock)
