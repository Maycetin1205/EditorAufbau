// KanbanBlock
// Organismus (4K.4): das Kanban-Board = Zeile aus Kanban-Spalten. Nimmt
// AUSSCHLIESSLICH Spalten auf (allowedChildTypes); die feste Zeilen-Richtung
// liegt als childDirection in der Registry (kein direction-Prop — das Layout
// des Boards ist nicht verhandelbar, darum auch keine Richtung/Abstand-Regler
// im Inspector). Karten und Spalten zieht die VORHANDENE Canvas-Drag-Logik.
//
// Beim Einfügen erscheint sofort ein gefülltes Board (defaultChildren =
// Beispieldaten des Zielbilds, nie ein leeres Gerippe): 3 Spalten
// Offen/In Arbeit/Fertig mit den Karten aus dashboard/stilprobe.html.
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*). Zielbild: .zb-board.

import { css, html, type TemplateResult } from 'lit'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { DefaultChildSpec } from '../../core/blocks/BlockDefinition'
import type { FlowDirection } from '../../core/blocks/flowLayout'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'
import { KanbanVorlageBlock } from './KanbanVorlageBlock'
import { connectBoard, disconnectBoard } from './seRuntime'

const SPALTE = KanbanSpalteBlock.blockType
const VORLAGE = KanbanVorlageBlock.blockType

export class KanbanBlock extends BasicBlock {
  static readonly blockType = 'kanban'
  static readonly tagName = 'ff-kanban'
  static readonly displayName = 'Kanban'
  static readonly category: BlockCategory = 'anzeige'
  static readonly acceptsChildren = true
  static readonly allowedChildTypes = [SPALTE, VORLAGE]
  static readonly childDirection: FlowDirection = 'row'
  static readonly containerHint = false
  static readonly addChildButton = { label: 'Spalte', childType: SPALTE }
  // Kap. 5.1: an das Board lässt sich eine Datenquelle hängen (Inspector-
  // Sektion "Daten"). `source` = Technikwert (Vorlagen-id), unsichtbar —
  // der Bediener sieht nur den Anzeigenamen. Leer = keine Quelle.
  static readonly acceptsDataSource = true
  // statusField (Kap. 5.3): Feldcode des Spalten-Felds (Technikwert,
  // unsichtbar) — sein Zeilenwert bestimmt im Export die Spalte.
  // putRelation (Kap. 5.5): id der Relation-Vorlage, über die der
  // Kanban-Schreibweg (5.3b) Werte zurückschreibt — Default = die
  // mitgelieferte Standard-PUT-Vorlage. Alle Defaults '' bzw. fester
  // Technikwert -> überleben Persistenz, reisen als Attribut mit.
  static readonly defaultProps = {
    width: 'fill', source: '', statusField: '', putRelation: 'standard-put',
  }
  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'statusField',
      name: 'Spalten aus Feld',
      description: 'Feld der Datenquelle, dessen Wert bestimmt, in welcher Spalte eine Zeile landet.',
      isArray: false,
      maxLength: 0,
      kind: 'field',
    },
    {
      attributeName: 'putRelation',
      name: 'Schreiben über',
      description: 'Relation-Vorlage, mit der eine gezogene Karte ihren neuen Spaltenwert zurückschreibt.',
      isArray: false,
      maxLength: 0,
      kind: 'relation',
      requiresDataSource: true,
    },
  ]

  // S3-Musterkarte: Ein frisches Board = Vorlagen-Kasten mit DER EINEN
  // Musterkarte (bringt seine Beispiel-Karte selbst mit, defaultChildren
  // des Vorlagen-Blocks) + 3 leere Spalten. Die Spalten füllt die Laufzeit
  // aus der Datenquelle — keine handgepflegten Beispielkarten mehr.
  static readonly defaultChildren: DefaultChildSpec[] = [
    { type: VORLAGE },
    { type: SPALTE, props: { heading: 'Offen', variant: 'warning' } },
    { type: SPALTE, props: { heading: 'In Arbeit', variant: 'info' } },
    { type: SPALTE, props: { heading: 'Fertig', variant: 'success' } },
  ]

  static styles = [
    BasicBlock.styles,
    css`
      /* Mehr Spalten als Platz: die Spalten BRECHEN in die nächste Zeile um
         (S3, Nutzer-Entscheidung: KEIN horizontaler Scroll). Die fließende
         Spaltenbreite (mind. 260px) kommt aus fillMinWidth der Spalte —
         Editor und Export identisch, Block-CSS = die eine Render-Quelle.
         min-width:0 erlaubt dem Host, in Zeilen-Bereichen schmaler zu
         werden als seine Spaltensumme. */
      :host { min-width: 0; }
      .board {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: var(--se-gap-lg);
      }
      slot { display: contents; }
    `,
  ]

  render(): TemplateResult {
    return html`<div class="board"><slot></slot></div>`
  }

  // Kap. 5.3: in der EXPORTIERTEN Maske meldet sich das Board bei der
  // SoftEngine-Anbindung an (Zeilen -> Karten, Spalten-Feld -> Spalte).
  // Editor-Boards tragen data-ff-editor und werden dort sofort abgewiesen.
  connectedCallback(): void {
    super.connectedCallback()
    connectBoard(this)
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    disconnectBoard(this)
  }
}

BasicBlock.defineAndRegister(KanbanBlock)
