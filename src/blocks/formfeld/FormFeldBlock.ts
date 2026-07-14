// FormFeldBlock
// Eingabe-Baustein "Formularfeld" — NEUBAU nach der ECHTEN Referenz
// (behandlung/index.basis.source.html): dort ist ein Feld ein kleines
// Grossbuchstaben-Label UEBER dem Eingabeelement, und alle Eingabeelemente
// teilen EINE Optik-Klasse `.ctrl` (1px-Rahmen var(--line), Panel-Flaeche,
// kantiger Radius, Fokus = Hausfarbe; Z. 205-210 der Referenz). Die
// vorkommenden Feldtypen der Referenz: Text, Zahl (Menge), Mehrzeilig
// (Doku-Textarea), Auswahl (Zimmer-Select), Datum, Ankreuzfeld (Impfung).
//
// V1 = STATISCH (Nutzer-Entscheidung: erst die Bausteine, dann Schritt
// fuer Schritt die SoftEngine-Logik): kein field-Prop, kein Lesen/Schreiben.
// Die Datenanbindung kommt spaeter ueber die vorhandenen Mechaniken
// (getField / Relation-Vorlagen — dieselben, die das Kanban benutzt).
//
// Bedienung: Label per Doppelklick direkt am Block (Inline-Edit, WYSIWYG);
// Inspector nur Feldtyp / Platzhalter / Auswahl-Optionen (Klarnamen
// sichtbar, Technikwerte text/number/... unsichtbar — Regel Technikwert
// != Anzeigename). Im EDITOR ist das Eingabeelement bewusst nicht
// bedienbar (pointer-events, gated ueber data-ff-editor wie die
// Daten-Markierung): im Editor wird das Feld GESTALTET, ausgefuellt wird
// in der Maske — der Export bleibt unberuehrt (1 Render-Quelle).
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Literale,
// keine Fallbacks; strukturelle Groessen (Padding, letter-spacing) als
// Literale wie bei Karte/Spalte.

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

// Feldtypen (Technikwerte) — der Bediener sieht nur die Klarnamen unten.
const FELD_TYPEN = ['text', 'number', 'textarea', 'select', 'date', 'checkbox'] as const
type FeldTyp = (typeof FELD_TYPEN)[number]

function coerceFeldTyp(v: unknown): FeldTyp {
  return FELD_TYPEN.includes(v as FeldTyp) ? (v as FeldTyp) : 'text'
}

export class FormFeldBlock extends BasicBlock {
  static readonly blockType = 'formfeld'
  static readonly tagName = 'ff-formfeld'
  static readonly displayName = 'Formularfeld'
  static readonly category: BlockCategory = 'eingabe'
  // Standardbreite fest (240px) — der Breiten-Anfasser bleibt aktiv,
  // Doppelklick auf den Anfasser stellt den Standard wieder her.
  static readonly defaultProps = {
    width: 240,
    label: 'Feldname',
    fieldType: 'text',
    placeholder: '',
    options: '',
  }

  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'fieldType',
      name: 'Feldtyp',
      description: 'Welche Art Eingabe das Feld annimmt.',
      isArray: false,
      maxLength: 0,
      kind: 'select',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Zahl' },
        { value: 'textarea', label: 'Mehrzeilig' },
        { value: 'select', label: 'Auswahl' },
        { value: 'date', label: 'Datum' },
        { value: 'checkbox', label: 'Ankreuzfeld' },
      ],
    },
    {
      attributeName: 'placeholder',
      name: 'Platzhalter',
      description: 'Grauer Hinweistext, solange das Feld leer ist (bei Text/Zahl/Mehrzeilig).',
      isArray: false,
      maxLength: 0,
      kind: 'text',
    },
    {
      attributeName: 'options',
      name: 'Auswahl-Optionen',
      description: 'Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2").',
      isArray: false,
      maxLength: 0,
      kind: 'text',
    },
  ]

  static styles = [
    BasicBlock.styles,
    css`
      .feld {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-family: var(--se-font);
      }
      .label {
        font-size: var(--se-fs-xs);
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--se-muted);
      }
      /* .ctrl exakt nach Referenz-Optik: Rahmen, Panel-Flaeche, kantiger
         Radius; Fokus = Hausfarbe als Rahmen + 1px-Ring (kein weicher
         Schatten — Flaechen leben von Rahmen). */
      .ctrl {
        box-sizing: border-box;
        width: 100%;
        padding: 7px 10px;
        border: 1px solid var(--se-line);
        background: var(--se-panel);
        border-radius: var(--se-r-sm);
        font-family: var(--se-font);
        font-size: var(--se-fs);
        color: var(--se-ink);
      }
      .ctrl::placeholder { color: var(--se-faint); }
      .ctrl:focus {
        outline: none;
        border-color: var(--se-accent);
        box-shadow: 0 0 0 1px var(--se-accent);
      }
      textarea.ctrl {
        resize: vertical;
        min-height: 64px;
        line-height: 1.5;
      }
      select.ctrl { padding: 6px 8px; }
      /* Ankreuzfeld: Kaestchen + Beschriftung in EINER Zeile (Referenz
         .impf-chk); die Beschriftung ist hier normaler Text, keine Caps. */
      .zeile {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      input[type='checkbox'].ctrl {
        width: 15px;
        height: 15px;
        padding: 0;
        flex: none;
        accent-color: var(--se-accent);
      }
      .zeile .label {
        text-transform: none;
        letter-spacing: 0;
        font-size: var(--se-fs);
        font-weight: 400;
        color: var(--se-ink);
      }
      /* Im Editor wird gestaltet, nicht ausgefuellt: das Eingabeelement
         nimmt dort keine Bedienung an (nur im Editor — data-ff-editor
         setzt ausschliesslich der BlockHost, der Export bleibt frei). */
      :host([data-ff-editor]) .ctrl { pointer-events: none; }
    `,
  ]

  @property() label = 'Feldname'
  @property() fieldType = 'text'
  @property() placeholder = ''
  @property() options = ''

  private labelTpl(): TemplateResult {
    return html`<span
      class="label"
      data-ff-editable
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'label')}
    >${this.label}</span>`
  }

  private controlTpl(typ: FeldTyp): TemplateResult {
    switch (typ) {
      case 'textarea':
        return html`<textarea class="ctrl" placeholder=${this.placeholder}></textarea>`
      case 'select': {
        const eintraege = this.options.split(',').map((o) => o.trim()).filter((o) => o !== '')
        return html`<select class="ctrl">
          ${eintraege.length === 0
            ? html`<option>(keine Optionen)</option>`
            : eintraege.map((o) => html`<option>${o}</option>`)}
        </select>`
      }
      default:
        // text / number / date teilen das eine Input-Element.
        return html`<input class="ctrl" type=${typ} placeholder=${this.placeholder} />`
    }
  }

  render(): TemplateResult {
    const typ = coerceFeldTyp(this.fieldType)
    if (typ === 'checkbox') {
      // Kaestchen links, Beschriftung rechts — bewusst OHNE <label for>-
      // Kopplung: im Editor wuerde ein Klick auf die Beschriftung sonst
      // das Kaestchen umschalten und mit dem Inline-Edit kollidieren.
      return html`<div class="feld">
        <div class="zeile">
          <input class="ctrl" type="checkbox" />
          ${this.labelTpl()}
        </div>
      </div>`
    }
    return html`<div class="feld">
      ${this.labelTpl()}
      ${this.controlTpl(typ)}
    </div>`
  }
}

BasicBlock.defineAndRegister(FormFeldBlock)
