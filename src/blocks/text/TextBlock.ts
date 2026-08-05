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
// Dazu (2026-08-04) die FARBE: feste Auswahl aus den Masken-Tokens, keine
// freie Farbwahl — s. FARBEN unten. Im Inspector eine eigene Zeile mit
// Farb-Kacheln (der vorhandene Mechanismus optionColors/ColorTileControl,
// nichts Neues gebaut).
//
// Der Text wird per Doppelklick DIREKT am Ding bearbeitet (Inline-Edit,
// WYSIWYG — Muster Schaltflaechen-Beschriftung); der Default-Text ist
// Platzhalter-Inhalt zum Ueberschreiben, keine erfundenen Daten (Regel 7).
//
// DATENBINDUNG (2026-08-04): der Text kann statt getippt auch aus einem Feld
// der Datenquelle kommen — EINE bindbare Stelle (`text`, Bindung in
// `textField`), dieselbe Bauart wie Karte und Formularfeld. Ungebunden bleibt
// alles wie zuvor: getippter Text, Inline-Edit. Gebunden zeigt der EDITOR den
// Feld-Klarnamen (Regel 7: nie ein erfundener Wert — die Vorschau setzt
// useLitElement generisch), die MASKE den Feldwert (seRuntime daneben).
// Er kann dabei der AUSWAHL eines Gebers folgen (kannAuswahlFolgen): dann
// zeigt er den Wert der angeklickten Zeile — und ohne Auswahl nichts.
//
// Keine Ereignisse (kein Schreibweg — geschrieben wird nur ueber sichtbare
// Ketten, und der Text nimmt keine Eingabe an). Farben aus Masken-Tokens
// (--se-*); strukturelle Groessen als Literale wie bei Button.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { styleMap } from 'lit/directives/style-map.js'
import { BasicBlock } from '../base/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { BindableSpotsFor } from '../../core/blocks/BlockDefinition'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { connectText, disconnectText } from './seRuntime'

// Grenzen der freien Pixelgröße — großzügig, aber nie 0/negativ/absurd.
const GROESSE_MIN = 6
const GROESSE_MAX = 96
const GROESSE_STANDARD = 14

// Gewicht/Ausrichtung (Technikwerte) — sichtbar sind nur die Klarnamen.
const GEWICHTE = { duenn: '300', normal: '400', fett: '700' } as const
type Gewicht = keyof typeof GEWICHTE
const AUSRICHTUNGEN = { links: 'left', mitte: 'center', rechts: 'right' } as const
type Ausrichtung = keyof typeof AUSRICHTUNGEN

// Farbe (Technikwert -> Masken-Token). KEINE freie Farbwahl und keine
// Hex-Werte: der Bediener waehlt aus den Farben, die die Maske ohnehin
// benutzt — dadurch sieht der Export aus wie der Editor (WYSIWYG) und eine
// spaetere Token-Aenderung zieht ueberall mit. Nur Tokens, die
// masken-tokens.css wirklich hergibt.
const FARBEN = {
  standard: 'var(--se-ink)',
  gedaempft: 'var(--se-muted)',
  akzent: 'var(--se-accent)',
  erfolg: 'var(--se-green)',
  warnung: 'var(--se-amber)',
  fehler: 'var(--se-red)',
} as const
type Farbe = keyof typeof FARBEN
const FARBE_STANDARD: Farbe = 'standard'

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

// Unbekannte/alte Werte fallen auf Standard zurueck — nie eine leere Farbe.
function coerceFarbe(v: unknown): Farbe {
  return typeof v === 'string' && v in FARBEN ? (v as Farbe) : FARBE_STANDARD
}

export class TextBlock extends BasicBlock {
  static readonly blockType = 'text'
  static readonly tagName = 'ff-text'
  static readonly displayName = 'Text'
  static readonly category: BlockCategory = 'anzeige'
  static readonly acceptsDataSource = true
  // Folgt der Auswahl eines Gebers (Tabelle/Kanban) — dieselbe Faehigkeit wie
  // beim Formularfeld: mit Auswahl der Wert der angeklickten Zeile, ohne
  // Auswahl nichts. Nur wo der Bauer die Folge einstellt; ohne sie gilt
  // weiterhin die erste Zeile der Quelle.
  static readonly kannAuswahlFolgen = true
  // EINE bindbare Stelle: der Text selbst.
  static readonly bindableSpots: BindableSpotsFor<typeof TextBlock.defaultProps> = [
    { prop: 'text', label: 'Text' },
  ]
  // Volle Breite: Fliesstext bricht dann im Container um, und die
  // Ausrichtung (Mitte/Rechts) hat eine echte Bezugsflaeche. Der
  // Breiten-Anfasser bleibt aktiv (Doppelklick stellt den Standard wieder her).
  static readonly defaultProps = {
    width: 'fill',
    groesse: GROESSE_STANDARD,
    gewicht: 'normal',
    ausrichtung: 'links',
    farbe: FARBE_STANDARD,
    text: 'Text',
    // Datenquelle (Technikwert = Vorlagen-id) und Bindung der Stelle
    // (Feldcode, '' = ungebunden). Beide MUESSEN hier stehen, damit
    // Persistenz und Export sie mitnehmen (Bindungs-Konvention).
    source: '',
    textField: '',
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
      description: 'Schriftgröße in Pixeln.',      kind: 'number',
      unit: 'px',
      min: GROESSE_MIN,
      max: GROESSE_MAX,
      inspectorRow: 'Text-Stil',
    },
    {
      attributeName: 'gewicht',
      name: 'Gewicht',
      description: 'Strichstärke der Schrift.',      kind: 'segment',
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
      description: 'Wo der Text in seiner Breite sitzt.',      kind: 'segment',
      options: [
        { value: 'links', label: 'Links' },
        { value: 'mitte', label: 'Mitte' },
        { value: 'rechts', label: 'Rechts' },
      ],
      inspectorRow: 'Text-Stil',
    },
    // Eigene Zeile UNTER „Text-Stil": der Inspector zeigt hier Farb-Kacheln
    // statt Dropdown, weil alle Werte in seiner Farbtabelle stehen
    // (editor/inspector/optionColors) — die Kachel traegt die ECHTE
    // Maskenfarbe. Innerhalb der geteilten Zeile gaebe es dafuer keine
    // Kompaktform, dort stuende ein zweites Label „Farbe" im Label „Text-Stil".
    {
      attributeName: 'farbe',
      name: 'Farbe',
      description: 'Textfarbe aus den Farben der Maske.',      kind: 'select',
      options: [
        { value: 'standard', label: 'Standard' },
        { value: 'gedaempft', label: 'Gedämpft' },
        { value: 'akzent', label: 'Akzent' },
        { value: 'erfolg', label: 'Erfolg' },
        { value: 'warnung', label: 'Warnung' },
        { value: 'fehler', label: 'Fehler' },
      ],
    },
  ]

  static override styles = [
    BasicBlock.styles,
    css`
      .text {
        font-family: var(--se-font);
        /* Farbe kommt als Inline-Stil aus FARBEN (styleMap) — hier steht nur
           der Ausgangswert, damit die Stelle auch ohne gesetzte Prop Text
           in der Haus-Textfarbe zeigt. */
        color: var(--se-ink);
        /* EINE Zeilenhoehe fuer beides: die Zeile des gesetzten Textes UND die
           Hoehe, die ein leerer Text freihaelt (s. unten). Zwei getrennte
           Zahlen liefen beim naechsten Nachstellen auseinander. */
        --text-zeilenhoehe: 1.35;
        line-height: var(--text-zeilenhoehe);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      /* Ein LEERER Text hat kein Zeilenfeld: in der Maske klappte er auf Hoehe
         0 zusammen — der Baustein war unsichtbar und das Layout sprang, sobald
         ein gebundener Text ohne Auswahl leer blieb (SE-Echttest 2026-08-04).
         Er haelt jetzt immer genau EINE Zeile frei. Relativ gerechnet
         (Schriftgroesse x Zeilenhoehe), damit die Luecke mit jeder frei
         eingestellten Groesse mitwaechst statt an einer Pixelzahl zu kleben. */
      .text:empty { min-height: calc(1em * var(--text-zeilenhoehe)); }
      /* Leerer Text bleibt im Editor ein greifbares Klick-Ziel (Regel 7:
         Platzhalter statt erfundener Wert) — der Griff fuellt dieselbe eine
         Zeile, die Editor-Hilfe sieht also unveraendert aus; die Maske zeigt
         bei leerem Text weiterhin nichts, nur ohne einzuklappen. */
      :host([data-ff-editor]) .text:empty::before {
        content: 'Text …';
        color: var(--se-faint);
      }
    `,
  ]

  @property({ type: Number }) groesse: number = GROESSE_STANDARD
  @property() gewicht = 'normal'
  @property() ausrichtung = 'links'
  @property() farbe: string = FARBE_STANDARD
  @property() text = 'Text'
  @property() source = ''
  @property() textField = ''

  override render(): TemplateResult {
    // Freie Werte als Inline-Stil (styleMap) — Klassen-Stufen gibt es nicht mehr.
    const stil = {
      fontSize: `${coerceGroesse(this.groesse)}px`,
      fontWeight: GEWICHTE[coerceGewicht(this.gewicht)],
      textAlign: AUSRICHTUNGEN[coerceAusrichtung(this.ausrichtung)],
      color: FARBEN[coerceFarbe(this.farbe)],
    }
    // Die Stelle traegt data-ff-spot (Klick-Ziel des Feld-Pickers) und
    // data-ff-bound, wenn sie gebunden ist (Daten-Markierung, sichtbar nur im
    // Editor — BasicBlock-CSS; gebunden faellt der Doppelklick durch zum
    // Picker statt ins Inline-Edit).
    return html`<div
      class="text"
      style=${styleMap(stil)}
      data-ff-editable
      data-ff-spot="text"
      ?data-ff-bound=${this.textField !== ''}
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'text')}
    >${this.text}</div>`
  }

  override connectedCallback(): void {
    super.connectedCallback()
    connectText(this)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    disconnectText(this)
  }
}

BasicBlock.defineAndRegister(TextBlock)
