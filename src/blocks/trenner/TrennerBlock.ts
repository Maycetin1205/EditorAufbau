// TrennerBlock
// Statisches Layout-Atom "Trennlinie": ein 1px-Strich in der Linienfarbe mit
// festem dezentem Abstand rundherum.
//
// EINE Eigenschaft: die RICHTUNG (Nutzer-Entscheidung 2026-08-05). Sie ist der
// echte zweite Fall, den Regel 10 verlangt — waagerecht teilt die Flaeche
// ueber die Breite, senkrecht trennt zwei Spalten nebeneinander. Beides ist
// derselbe Strich, nur gedreht: gleiche Farbe, gleicher Abstand, gleiche
// Mittigkeit. Farbe, Dicke und Stil bleiben weiter BEWUSST weg — dafuer gibt
// es bis heute keinen zweiten Fall.
//
// Die Richtung bestimmt auch, wie sich der Baustein auf der Rasterflaeche
// verhaelt (Startgroesse, Breiten-Anfasser). Das steht als Zustands-VARIANTE
// im raster-Eintrag und wird generisch gelesen (rasterSpecOf) — im Canvas
// liegt kein Sondercode fuer diesen Baustein (Regel 2).
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*).

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

// Technikwerte der Richtung; sichtbar sind nur die Klarnamen (Regel 3).
const RICHTUNGEN = ['waagerecht', 'senkrecht'] as const
type Richtung = (typeof RICHTUNGEN)[number]
const RICHTUNG_STANDARD: Richtung = 'waagerecht'

// Unbekannte/alte Werte fallen auf den Standard zurueck — nie eine Trennlinie
// ohne Richtung (sie waere unsichtbar).
function coerceRichtung(v: unknown): Richtung {
  return RICHTUNGEN.includes(v as Richtung) ? (v as Richtung) : RICHTUNG_STANDARD
}

export class TrennerBlock extends BasicBlock {
  static readonly blockType = 'trenner'
  static readonly tagName = 'ff-trenner'
  static readonly displayName = 'Trennlinie'
  static readonly category: BlockCategory = 'layout'
  // Immer volle Breite, kein Anfasser: eine waagerechte Trennlinie teilt die
  // ganze Flaeche. (Gilt im FLUSS — auf der Rasterflaeche entscheidet der
  // raster-Eintrag unten.)
  static readonly defaultProps = { width: 'fill', richtung: RICHTUNG_STANDARD }
  static readonly resizableWidth = false
  // Raster-Startgroesse: waagerecht volle Breite, eine Zeile hoch. Senkrecht
  // ist das Spiegelbild — eine Spalte breit, sechs Zeilen hoch — und der
  // Breiten-Anfasser faellt weg: ein senkrechter Strich in einem breiteren
  // Kasten wuerde nur leeren Raum um sich herum erzeugen. Die Hoehe bleibt in
  // beiden Richtungen ziehbar.
  static readonly raster = {
    startW: 24,
    startH: 1,
    minW: 1,
    minH: 1,
    varianten: [{
      wenn: { attributeName: 'richtung', equals: 'senkrecht' },
      startW: 1,
      startH: 6,
      breiteZiehbar: false,
    }],
  }
  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'richtung',
      name: 'Richtung',
      description: 'Waagerecht trennt oben von unten, senkrecht links von rechts.',
      kind: 'select',
      options: [
        { value: 'waagerecht', label: 'Waagerecht' },
        { value: 'senkrecht', label: 'Senkrecht' },
      ],
    },
  ]

  static override styles = [
    BasicBlock.styles,
    css`
      /* Die Flaeche traegt den dezenten Aussenabstand (--se-gap-sm) QUER zur
         Linie und haelt den Strich mittig. Auf der Rasterflaeche fuellt sie
         die Zelle (:host([fuellt]) setzt die Hoehe), im Fluss bleibt sie so
         hoch wie ihr Inhalt. */
      .flaeche {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      .waagerecht { padding: var(--se-gap-sm) 0; }
      .senkrecht {
        padding: 0 var(--se-gap-sm);
        /* Im FLUSS gibt es keine Zellhoehe, aus der sich der Strich bedienen
           koennte — ohne dieses Mindestmass waere er dort 0 hoch und damit
           unsichtbar. Auf der Rasterflaeche gewinnt die Zellhoehe. */
        min-height: 24px;
      }
      .linie { background: var(--se-line); }
      .waagerecht .linie { width: 100%; height: 1px; }
      .senkrecht .linie { width: 1px; height: 100%; }
    `,
  ]

  @property() richtung: string = RICHTUNG_STANDARD

  override render(): TemplateResult {
    return html`<div class="flaeche ${coerceRichtung(this.richtung)}"><div class="linie"></div></div>`
  }
}

BasicBlock.defineAndRegister(TrennerBlock)
