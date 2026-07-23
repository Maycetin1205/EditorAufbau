// TextBlock
// Statisches Anzeige-Atom "Text": zeigt statischen Text an. EIN Bibliotheks-
// eintrag; die Optik bestimmen DREI freie Stil-Eigenschaften (Nutzer-
// Entscheidung 2026-07-21: „ich will entscheiden, WO es liegt, wie viele
// Pixel groß, dünn, dick" — KEINE Größen-Auswahlstufen, kein zweiter
// Baustein, keine Art-Umschaltung):
//   - groesse:     Schriftgröße als freie Pixelzahl (Vorbild chef-maske:
//                  dort sind Schriftgrößen ebenfalls Pixel-Literale)
//   - gewicht:     Dünn / Normal / Fett
//   - ausrichtung: Links / Mitte / Rechts
// Alle drei teilen sich im Inspector EINE kompakte Zeile „Text-Stil"
// (inspectorRow — Registry-Daten, kein Sondercode im Inspector).
//
// Der Text wird per Doppelklick DIREKT am Ding bearbeitet (Inline-Edit,
// WYSIWYG — Muster Schaltflaechen-Beschriftung); der Default-Text ist
// Platzhalter-Inhalt zum Ueberschreiben, keine erfundenen Daten (Regel 7).
//
// Keine Datenbindung, keine Ereignisse. Farben aus Masken-Tokens (--se-*);
// strukturelle Groessen als Literale wie bei Button.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

// Grenzen der freien Pixelgröße — großzügig, aber nie 0/negativ/absurd.
const GROESSE_MIN = 6
const GROESSE_MAX = 96
const GROESSE_STANDARD = 14

// Gewicht/Ausrichtung (Technikwerte) — sichtbar sind nur die Klarnamen.
const GEWICHTE = { duenn: '300', normal: '400', fett: '700' } as const
type Gewicht = keyof typeof GEWICHTE
const AUSRICHTUNGEN = { links: 'left', mitte: 'center', rechts: 'right' } as const
type Ausrichtung = keyof typeof AUSRICHTUNGEN

// Freie Pixelzahl; die Stufen-Werte der ersten Fassung (ueberschrift/
// normal/klein) werden still auf ihre damaligen Pixel abgebildet, damit
// heute angelegte Bloecke nicht kippen.
function coerceGroesse(v: unknown): number {
  if (v === 'ueberschrift') return 15
  if (v === 'klein') return 12
  const n = typeof v === 'number' ? v : Number.parseFloat(String(v ?? ''))
  if (!Number.isFinite(n)) return GROESSE_STANDARD
  return Math.min(GROESSE_MAX, Math.max(GROESSE_MIN, n))
}

function coerceGewicht(v: unknown): Gewicht {
  return typeof v === 'string' && v in GEWICHTE ? (v as Gewicht) : 'normal'
}

function coerceAusrichtung(v: unknown): Ausrichtung {
  return typeof v === 'string' && v in AUSRICHTUNGEN ? (v as Ausrichtung) : 'links'
}

export class TextBlock extends BasicBlock {
  static readonly blockType = 'text'
  static readonly tagName = 'ff-text'
  static readonly displayName = 'Text'
  static readonly category: BlockCategory = 'anzeige'
  // Volle Breite: Fliesstext bricht dann im Container um, und die
  // Ausrichtung (Mitte/Rechts) hat eine echte Bezugsflaeche. Der
  // Breiten-Anfasser bleibt aktiv (Doppelklick stellt den Standard wieder her).
  static readonly defaultProps = {
    width: 'fill',
    groesse: GROESSE_STANDARD,
    gewicht: 'normal',
    ausrichtung: 'links',
    text: 'Text',
  }

  // Raster-Startgröße auf der Maskenfläche (im Browser gemessen 2026-07-23:
  // eine Textzeile ~19px). Feste Zeilen (je 12px) → 2 Zellen = 32px, damit die
  // Zeile nicht abschneidet. Mehr Text → Baustein größer ziehen.
  static readonly raster = { startW: 6, startH: 2, minW: 1, minH: 1 }

  // Inspector: EINE Zeile „Text-Stil" (Groesse | Gewicht | Ausrichtung).
  // Der Text selbst laeuft ueber Inline-Edit, nicht ueber den Inspector.
  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'groesse',
      name: 'Größe',
      description: 'Schriftgröße in Pixeln.',
      isArray: false,
      maxLength: 0,
      kind: 'number',
      unit: 'px',
      min: GROESSE_MIN,
      max: GROESSE_MAX,
      inspectorRow: 'Text-Stil',
    },
    {
      attributeName: 'gewicht',
      name: 'Gewicht',
      description: 'Strichstärke der Schrift.',
      isArray: false,
      maxLength: 0,
      kind: 'segment',
      options: [
        { value: 'duenn', label: 'Dünn' },
        { value: 'normal', label: 'Normal' },
        { value: 'fett', label: 'Fett' },
      ],
      inspectorRow: 'Text-Stil',
    },
    {
      attributeName: 'ausrichtung',
      name: 'Ausrichtung',
      description: 'Wo der Text in seiner Breite sitzt.',
      isArray: false,
      maxLength: 0,
      kind: 'segment',
      options: [
        { value: 'links', label: 'Links' },
        { value: 'mitte', label: 'Mitte' },
        { value: 'rechts', label: 'Rechts' },
      ],
      inspectorRow: 'Text-Stil',
    },
  ]

  static styles = [
    BasicBlock.styles,
    css`
      .text {
        font-family: var(--se-font);
        color: var(--se-ink);
        line-height: 1.35;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      /* Leerer Text bleibt im Editor ein greifbares Klick-Ziel (Regel 7:
         Platzhalter statt erfundener Wert); die Maske zeigt bei leerem Text
         schlicht nichts. */
      :host([data-ff-editor]) .text:empty::before {
        content: 'Text …';
        color: var(--se-faint);
      }
    `,
  ]

  @property({ type: Number }) groesse: number = GROESSE_STANDARD
  @property() gewicht = 'normal'
  @property() ausrichtung = 'links'
  @property() text = 'Text'

  render(): TemplateResult {
    // Freie Werte als Inline-Stil (styleMap) — Klassen-Stufen gibt es nicht mehr.
    const stil = {
      fontSize: `${coerceGroesse(this.groesse)}px`,
      fontWeight: GEWICHTE[coerceGewicht(this.gewicht)],
      textAlign: AUSRICHTUNGEN[coerceAusrichtung(this.ausrichtung)],
    }
    return html`<div
      class="text"
      style=${styleMap(stil)}
      data-ff-editable
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'text')}
    >${this.text}</div>`
  }
}

BasicBlock.defineAndRegister(TextBlock)
