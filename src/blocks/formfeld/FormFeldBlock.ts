// FormFeldBlock
// Eingabe-Baustein "Formularfeld" — NEUBAU nach der ECHTEN Referenz
// (behandlung/index.basis.source.html): alle Eingabeelemente teilen EINE
// Optik-Klasse `.ctrl` (1px-Rahmen var(--line), Panel-Flaeche, kantiger
// Radius, Fokus = Hausfarbe; Z. 205-210 der Referenz). Feldtypen der
// Referenz: Text, Zahl (Menge), Mehrzeilig (Doku), Auswahl (Zimmer),
// Datum, Ankreuzfeld (Impfung).
//
// KEIN Label ueber dem Feld (Nutzer-Korrektur 2026-07-14): der Text steht
// IM Feld — als Platzhalter (grau, verschwindet beim Tippen) bzw. beim
// Ankreuzfeld als Beschriftung neben dem Kaestchen. EINE Text-Prop
// (`placeholder`) fuer beides, per Doppelklick DIREKT im Feld aenderbar
// (Inline-Edit, WYSIWYG). Der Platzhalter ist ein eigenes Element mit
// Verschwinde-Logik (statt native placeholder-Attribut), damit derselbe
// Text in Editor UND Maske identisch sitzt und im Editor editierbar ist;
// die Maske blendet ihn beim Tippen bzw. nach einer Auswahl aus (input-/
// change-Event — die Komponente lebt in beiden Welten, 1 Render-Quelle).
//
// V1 = STATISCH (Nutzer-Entscheidung: erst die Bausteine, dann Schritt
// fuer Schritt die SoftEngine-Logik): kein field-Prop, kein Lesen/
// Schreiben. Die Datenanbindung kommt spaeter ueber die vorhandenen
// Mechaniken (getField / Relation-Vorlagen — dieselben wie beim Kanban).
//
// Inspector: nur Feldtyp + Auswahl-Optionen (Klarnamen sichtbar,
// Technikwerte text/number/... unsichtbar). Im EDITOR ist das
// Eingabeelement bewusst nicht bedienbar (pointer-events, gated ueber
// data-ff-editor): im Editor wird gestaltet, ausgefuellt wird in der
// Maske — der Export bleibt unberuehrt.
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Literale,
// keine Fallbacks; strukturelle Groessen (Padding, Positionen) als
// Literale wie bei Karte/Spalte.

import { css, html, nothing, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

// Feldtypen (Technikwerte) — der Bediener sieht nur die Klarnamen unten.
const FELD_TYPEN = ['text', 'number', 'textarea', 'select', 'date', 'checkbox'] as const
type FeldTyp = (typeof FELD_TYPEN)[number]

function coerceFeldTyp(v: unknown): FeldTyp {
  return FELD_TYPEN.includes(v as FeldTyp) ? (v as FeldTyp) : 'text'
}

// Typen mit sichtbarem Platzhalter IM Feld. Beim Select liegt darunter eine
// leere, deaktivierte Startoption: der Platzhalter beschreibt das Feld, ist
// aber selbst nie ein auswählbarer Wert.
const MIT_PLATZHALTER: readonly FeldTyp[] = ['text', 'number', 'textarea', 'select']

export class FormFeldBlock extends BasicBlock {
  static readonly blockType = 'formfeld'
  static readonly tagName = 'ff-formfeld'
  static readonly displayName = 'Formularfeld'
  static readonly category: BlockCategory = 'eingabe'
  // Standardbreite fest (240px) — der Breiten-Anfasser bleibt aktiv,
  // Doppelklick auf den Anfasser stellt den Standard wieder her.
  static readonly defaultProps = {
    width: 240,
    fieldType: 'text',
    placeholder: 'Feldname',
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
      attributeName: 'options',
      name: 'Auswahl-Optionen',
      description: 'Nur bei Feldtyp "Auswahl": Einträge durch Komma getrennt (z. B. "Zimmer 1, Zimmer 2") — jeder Eintrag wird eine Dropdown-Zeile.',
      isArray: false,
      maxLength: 0,
      kind: 'text',
      visibleWhen: { attributeName: 'fieldType', equals: 'select' },
    },
  ]

  static styles = [
    BasicBlock.styles,
    css`
      .feld { font-family: var(--se-font); }
      /* Anker fuer den im Feld sitzenden Platzhalter. */
      .huelle { position: relative; }
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
      .ctrl:focus {
        outline: none;
        border-color: var(--se-accent);
        box-shadow: 0 0 0 1px var(--se-accent);
      }
      textarea.ctrl {
        display: block;
        resize: vertical;
        min-height: 64px;
        line-height: 1.5;
      }
      select.ctrl { padding: 6px 8px; }
      /* Der Platzhalter sitzt IM Feld (an der Textposition des .ctrl:
         1px Rahmen + 7px/10px Innenabstand), faengt keine Klicks der
         Maske ab und verschwindet, sobald das Feld Inhalt hat. */
      .ph {
        position: absolute;
        top: 8px;
        left: 11px;
        right: 11px;
        color: var(--se-faint);
        font-size: var(--se-fs);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: none;
      }
      .ph[hidden] { display: none; }
      /* Select hat 1px weniger Innenabstand als Textfelder; der eingeblendete
         Feldtext sitzt trotzdem exakt an seiner nativen Textposition. */
      .ph-select {
        top: 7px;
        left: 9px;
        right: 25px;
      }
      /* Ankreuzfeld: Kaestchen + Beschriftung in EINER Zeile (Referenz
         .impf-chk) — bewusst ohne <label for>-Kopplung, sonst kollidiert
         der Beschriftungs-Klick mit dem Inline-Edit. */
      .zeile {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--se-fs);
        color: var(--se-ink);
      }
      input[type='checkbox'].ctrl {
        width: 15px;
        height: 15px;
        padding: 0;
        flex: none;
        accent-color: var(--se-accent);
      }
      /* Im Editor wird gestaltet, nicht ausgefuellt: das Eingabeelement
         nimmt dort keine Bedienung an — dafuer wird der Platzhalter
         anfassbar (Doppelklick = Text im Feld aendern). Ein leerer
         Platzhalter bekommt nur im Editor einen greifbaren Hinweis. */
      :host([data-ff-editor]) .ctrl { pointer-events: none; }
      :host([data-ff-editor]) .ph { pointer-events: auto; cursor: text; }
      :host([data-ff-editor]) .ph:empty::before { content: 'Text …'; opacity: 0.6; }
    `,
  ]

  @property() fieldType = 'text'
  @property() placeholder = 'Feldname'
  @property() options = ''

  // true sobald das Feld Inhalt traegt -> Platzhalter weg (laeuft in der
  // Maske; im Editor ist das Feld inert und bleibt leer).
  @state() private _belegt = false

  private onInput(e: Event): void {
    const t = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    this._belegt = t.value !== ''
  }

  // Der Text IM Feld — Platzhalter bzw. Ankreuzfeld-Beschriftung; per
  // Doppelklick direkt am Feld aenderbar (nur bei selektiertem Block,
  // wie jedes Inline-Edit).
  private textTpl(cls: string): TemplateResult {
    return html`<span
      class=${cls}
      data-ff-editable
      @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'placeholder')}
    >${this.placeholder}</span>`
  }

  private controlTpl(typ: FeldTyp): TemplateResult {
    switch (typ) {
      case 'textarea':
        return html`<textarea class="ctrl" @input=${this.onInput}></textarea>`
      case 'select': {
        const eintraege = this.options.split(',').map((o) => o.trim()).filter((o) => o !== '')
        return html`<select class="ctrl" @change=${this.onInput}>
          <option value="" disabled selected hidden></option>
          ${eintraege.length === 0
            ? html`<option disabled>(keine Optionen)</option>`
            : eintraege.map((o) => html`<option value=${o}>${o}</option>`)}
        </select>`
      }
      default:
        // text / number / date teilen das eine Input-Element.
        return html`<input class="ctrl" type=${typ} @input=${this.onInput} />`
    }
  }

  render(): TemplateResult {
    const typ = coerceFeldTyp(this.fieldType)
    if (typ === 'checkbox') {
      return html`<div class="feld">
        <div class="zeile">
          <input class="ctrl" type="checkbox" />
          ${this.textTpl('text')}
        </div>
      </div>`
    }
    return html`<div class="feld">
      <div class="huelle">
        ${this.controlTpl(typ)}
        ${MIT_PLATZHALTER.includes(typ)
          ? html`<span
              class=${typ === 'select' ? 'ph ph-select' : 'ph'}
              ?hidden=${this._belegt}
              data-ff-editable
              @dblclick=${(e: MouseEvent) => this.inlineEdit(e, 'placeholder')}
            >${this.placeholder}</span>`
          : nothing}
      </div>
    </div>`
  }
}

BasicBlock.defineAndRegister(FormFeldBlock)
