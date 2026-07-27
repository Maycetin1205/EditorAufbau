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
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { DefaultChildSpec } from '../../core/blocks/BlockDefinition'
import type { FlowDirection, FlowWidth } from '../../core/blocks/flowLayout'
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
  // Ein Board ist die Hauptfläche seiner Maske: immer volle verfügbare
  // Breite, ohne versehentlich exportierbare Pixelbreite.
  static readonly lockedWidth: FlowWidth = 'fill'
  static readonly resizableWidth = false
  static readonly containerHint = false
  static readonly addChildButton = { label: 'Spalte', childType: SPALTE }
  // P1.1 (ersetzt den Vorlagen-Kasten aus S3): die ERSTE Karte des Boards
  // ist die Musterkarte — aus ihr erzeugt die Laufzeit die Datenkarten
  // (seRuntime klont sie je Zeile). Der Editor markiert genau diese Karte
  // dezent mit dem Label; im Export ist von der Markierung nichts zu sehen.
  static readonly templateChild = { type: CardBlock.blockType, label: 'Muster' }
  // P1.3: das Board hat als einziger Block eine einstellbare HÖHE
  // (Registry-Konzept resizableHeight + height in den defaultProps).
  // Standard fill = verbleibende Maskenhöhe (Empfang-Vorbild). Ziehen setzt
  // bewusst eine feste Pixelhöhe; Doppelklick kehrt zu fill zurück.
  static readonly resizableHeight = true
  // an das Board lässt sich eine Datenquelle hängen (Inspector-
  // Sektion "Daten"). `source` = Technikwert (Vorlagen-id), unsichtbar —
  // der Bediener sieht nur den Anzeigenamen. Leer = keine Quelle.
  static readonly acceptsDataSource = true
  // Ereignisse des Boards (Kommandozentrale Z1): Klarnamen für die
  // Aktions-Übersicht; die keys sind das Technikwert-Vokabular des alten
  // Editors (onCardClick/onCardDrop) — Aktionsketten hängen ab Z2 daran.
  static readonly blockEvents = [
    { key: 'onCardClick', name: 'Karte angeklickt' },
    { key: 'onCardDrop', name: 'Karte verschoben' },
  ]
  // statusField: Feldcode des Spalten-Felds (Technikwert,
  // unsichtbar) — sein Zeilenwert bestimmt im Export die Spalte. OPTIONAL:
  // ohne Feld landen alle Zeilen in der Auffang- bzw. einer Auto-Spalte.
  // Was ein Drop tut, bestimmt allein die Aktionskette „Karte verschoben"
  // (docs/decisions/2026-07-15-kanban-schreibweg-und-schicht.md).
  // tagField: Feldcode des Datumsfelds, nach dem der Tageswaehler filtert
  // (Technikwert, unsichtbar). Leer = kein Tagesfilter, alle Saetze.
  static readonly defaultProps = {
    width: 'fill', height: 'fill' as const,
    source: '', statusField: '', tagField: '',
  }
  // Raster-Startgröße auf der Maskenfläche (kalibrierbar): das Board ist die
  // grosse Hauptfläche seiner Maske (breit + hoch).
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
      /* height:100% laesst das Board eine feste Hoehe ausfuellen —
         im Editor traegt sie der Canvas-Wrapper, im Export das Element
         selbst (Inline-Style schlaegt die 100%). Ohne feste Hoehe loest
         sich 100% zu auto auf (Elternhoehe haengt vom Inhalt ab) —
         Verhalten wie bisher. */
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

  render(): TemplateResult {
    return html`<div class="board"><slot></slot></div>`
  }

  // in der EXPORTIERTEN Maske meldet sich das Board bei der
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
