// KanbanVorlageBlock
// Der Vorlagen-Kasten des Kanban-Boards (S3-Musterkarte, Nutzer-Entscheidung
// 2026-07-09): Das Kanban ist IMMER datengebunden — Karten werden nicht mehr
// von Hand in Spalten gepflegt, sondern die Laufzeit erzeugt aus DER EINEN
// Musterkarte in diesem Kasten für jede Datenzeile eine Karte (seRuntime).
// Gestaltet wird also genau eine Karte, sichtbar beschriftet als Vorlage —
// nichts zählt mehr "heimlich" (vorher: erste Karte der ersten Spalte).
//
// Verhalten über die Registry (kein `if type===` in der UI):
//  - entsteht automatisch mit dem Board (defaultChildren dort), steht nie
//    in der Bibliothek (showInPalette=false), lebt nur im Board
//    (allowedParentTypes) und nimmt nur Karten auf (allowedChildTypes).
//  - removable=false: ohne Vorlage könnte das Board keine Karten erzeugen —
//    der Kasten hat deshalb kein Entfernen-Kreuzchen. Die Karte darin ist
//    löschbar; "+ Karte" (addChildButton) stellt sie wieder her.
//  - Mehrere Karten im Kasten sind möglich, aber nur die ERSTE ist die
//    Vorlage (seRuntime) — bewusst nicht verboten, Undo/Redo bleibt simpel.
//
// In der EXPORTIERTEN Maske blendet seRuntime den Kasten aus, sobald das
// Board aus Daten hydriert (der Kasten ist Werkzeug, keine Anzeige); ohne
// Datenanbindung bleibt er sichtbar — ehrlicher Hinweis, dass Daten fehlen.
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*); Kopf wie der
// Spaltenkopf (Zielbild .zb-colhead), gestrichelter Rahmen = "Werkzeug".

import { css, html, type TemplateResult } from 'lit'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { DefaultChildSpec } from '../../core/blocks/BlockDefinition'
import type { FlowDirection } from '../../core/blocks/flowLayout'
import { CardBlock } from '../card/CardBlock'

export class KanbanVorlageBlock extends BasicBlock {
  static readonly blockType = 'kanban-vorlage'
  static readonly tagName = 'ff-kanban-vorlage'
  static readonly displayName = 'Kartenvorlage'
  static readonly category: BlockCategory = 'anzeige'
  static readonly acceptsChildren = true
  static readonly allowedChildTypes = [CardBlock.blockType]
  // Literal statt Import von KanbanBlock (Import-Zyklus, Muster Spalte).
  static readonly allowedParentTypes = ['kanban']
  static readonly childDirection: FlowDirection = 'column'
  static readonly showInPalette = false
  static readonly containerHint = false
  static readonly removable = false
  static readonly addChildButton = { label: 'Karte', childType: CardBlock.blockType }
  static readonly resizableWidth = false
  // Feste Kastenbreite = Mindest-Spaltenbreite, damit die Musterkarte so
  // sitzt wie später in der Spalte.
  static readonly defaultProps = { width: 260 }
  static readonly defaultChildren: DefaultChildSpec[] = [{ type: CardBlock.blockType }]

  static styles = [
    BasicBlock.styles,
    css`
      .vorlage {
        box-sizing: border-box;
        background: var(--se-panel);
        border: 1.5px dashed var(--se-line);
        border-radius: var(--se-r-lg);
        font-family: var(--se-font);
      }
      .head {
        display: flex;
        align-items: center;
        gap: var(--se-gap-sm);
        padding: 9px 11px;
        border-bottom: 1px solid var(--se-line-soft);
        color: var(--se-faint);
        font-size: var(--se-fs-xs);
        font-weight: 700;
        letter-spacing: 0.09em;
        text-transform: uppercase;
      }
      .body {
        padding: 11px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--se-gap);
      }
      slot { display: contents; }
    `,
  ]

  render(): TemplateResult {
    return html`<div class="vorlage">
      <div class="head">Kartenvorlage</div>
      <div class="body"><slot></slot></div>
    </div>`
  }
}

BasicBlock.defineAndRegister(KanbanVorlageBlock)
