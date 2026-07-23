// ZeileBlock
// Layout-Baustein "Zeile": kann genau EINE Sache — Bausteine nebeneinander.
// Keine Regler (null Inspector-Eigenschaften), Abstand fest aus dem Design
// (--se-gap). Untereinander braucht keinen Baustein — das macht die
// Maskenflaeche von selbst. (Herkunft als schlanker Ersatz des Allzweck-
// "Bereichs": docs/decisions/2026-07-14-kahlschlag-bausteine.md)
//
// "Nebeneinander" ist ein Registry-Wert, kein Code: childDirection 'row'
// (dasselbe Konzept, mit dem das Kanban seine Spalten anordnet); Canvas und
// Export lesen die Kind-Anordnung aus DERSELBEN flowLayout-Quelle, darum
// sitzen die Kinder im Editor exakt wie in der Maske. Die Zeile selbst ist
// im Export eine unsichtbare Flex-Reihe; die gestrichelte Editor-Hilfe
// kommt vom BlockHost (containerHint default), nie aus dem Baustein.
//
// Schutzregeln komponieren sich aus der Registry: Kanban-Karten/-Spalten
// haben allowedParentTypes und landen nie in einer Zeile — ohne Sondercode.

import { css, html, type TemplateResult } from 'lit'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { FlowDirection } from '../../core/blocks/flowLayout'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

export class ZeileBlock extends BasicBlock {
  static readonly blockType = 'zeile'
  static readonly tagName = 'ff-zeile'
  static readonly displayName = 'Zeile'
  static readonly category: BlockCategory = 'layout'
  static readonly acceptsChildren = true
  static readonly childDirection: FlowDirection = 'row'
  // Volle Breite als Standard: die Zeile verteilt die Maskenbreite unter
  // ihren Kindern (jedes Kind behaelt sein eigenes Breitenverhalten).
  static readonly defaultProps = { width: 'fill' }
  // Raster-Startgröße auf der Maskenfläche (kalibriert im Browser 2026-07-23):
  // volle Breite, nimmt Bausteine nebeneinander auf.
  static readonly raster = { startW: 24, startH: 2, minW: 2, minH: 1 }
  static override readonly customProperties: PropertyDescription[] = []

  static styles = [
    BasicBlock.styles,
    css`
      /* Wie die Maskenwurzel, nur waagerecht: Kinder beginnen oben
         (flex-start) und behalten ihre natuerliche Hoehe. min-width:0
         erlaubt der Zeile, in schmalen Umgebungen zu schrumpfen. */
      .zeile {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: var(--se-gap);
        min-width: 0;
      }
      .zeile slot { display: contents; }
      /* Rasterflaeche: die Zeile fuellt ihre Zelle in der Hoehe; die Kinder
         bleiben oben (flex-start) und behalten ihre Naturhoehe. */
      :host([fuellt]) .zeile { height: 100%; }
    `,
  ]

  render(): TemplateResult {
    return html`<div class="zeile"><slot></slot></div>`
  }
}

BasicBlock.defineAndRegister(ZeileBlock)
