// KanbanBlock
// Organismus (4K.4): das Kanban-Board = Zeile aus Kanban-Spalten. Nimmt
// AUSSCHLIESSLICH Spalten auf (allowedChildTypes); die feste Zeilen-Richtung
// liegt als childDirection in der Registry (kein direction-Prop — das Layout
// des Boards ist nicht verhandelbar, darum auch keine Richtung/Abstand-Regler
// im Inspector). Karten und Spalten zieht die VORHANDENE Canvas-Drag-Logik.
//
// Beim Einfügen erscheint sofort ein bespieltes Board (defaultChildren,
// nie ein leeres Gerippe): 3 Spalten Offen/In Arbeit/Fertig, die erste
// mit der Musterkarte (templateChild — erste Karte = Laufzeit-Vorlage).
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*). Zielbild: .zb-board.

import { css, html, type TemplateResult } from 'lit'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { DefaultChildSpec } from '../../core/blocks/BlockDefinition'
import type { FlowDirection } from '../../core/blocks/flowLayout'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { CardBlock } from '../card/CardBlock'
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
  static readonly containerHint = false
  static readonly addChildButton = { label: 'Spalte', childType: SPALTE }
  // P1.1 (ersetzt den Vorlagen-Kasten aus S3): die ERSTE Karte des Boards
  // ist die Musterkarte — aus ihr erzeugt die Laufzeit die Datenkarten
  // (seRuntime klont sie je Zeile). Der Editor markiert genau diese Karte
  // dezent mit dem Label; im Export ist von der Markierung nichts zu sehen.
  static readonly templateChild = { type: CardBlock.blockType, label: 'Muster' }
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

  // P1.1: Ein frisches Board = 3 Spalten, die erste trägt DIE EINE
  // Musterkarte (erste Karte des Boards, s. templateChild) — wie im
  // Empfang-Vorbild liegt die Karte ganz normal in der Spalte, es gibt
  // keinen separaten Vorlagen-Kasten mehr.
  static readonly defaultChildren: DefaultChildSpec[] = [
    {
      type: SPALTE,
      props: { heading: 'Offen', variant: 'warning' },
      children: [{ type: CardBlock.blockType }],
    },
    { type: SPALTE, props: { heading: 'In Arbeit', variant: 'info' } },
    { type: SPALTE, props: { heading: 'Fertig', variant: 'success' } },
  ]

  static styles = [
    BasicBlock.styles,
    css`
      /* K0/Entscheidung A: ALLE Spalten sind IMMER nebeneinander sichtbar —
         kein Umbruch in die naechste Zeile, kein horizontaler Scroll,
         keine Mindestbreite. Die Spalten teilen sich die Zeile gleichmäßig
         (lockedWidth 'fill' der Spalte: flex-basis 0 + min-width 0) und
         werden gleich hoch (stretch); Karten scrollen senkrecht IM
         Spaltenrumpf. min-width:0 am Host erlaubt dem Board, in
         Zeilen-Bereichen schmaler zu werden als sein Inhalt. */
      :host { min-width: 0; }
      .board {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        gap: var(--se-gap-lg);
      }
      .board slot { display: contents; }
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
