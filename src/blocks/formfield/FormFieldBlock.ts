// FormFieldBlock (Kap. 6)
// Eingabe-Baustein: ein einzelnes Formular-Steuerelement. Der Baustein rendert
// NUR das Steuerelement — die Beschriftung erzeugt SoftEngine selbst (kein
// Label-Prop, Funktionsliste Kap. 4). WYSIWYG: dieselbe Web-Component steht im
// Editor und im Export.
//
// Der Feldtyp (Text/Zahl/E-Mail/Passwort/Mehrzeilig/Auswahl/Checkbox/Datum),
// Platzhalter, Pflichtfeld und Nur-lesen werden im Inspector gewaehlt (kein
// Inline-Edit — ein leeres Eingabefeld hat keinen Text zum Bearbeiten). Regel
// "Technikwert != Anzeigename": der Bediener waehlt Klarnamen (z. B. "Zahl"),
// gespeichert wird der Technikwert ('number').
//
// v1 ist STATISCH (ohne Datenbindung): rendert + exportiert als gueltige
// SE-Maske. Die Feld-Bindung (SoftEngine liest/schreibt) + Optionen aus einer
// Datenquelle folgen als eigener Schritt, sobald der reale SE-Formularfeld-
// Kontrakt vorliegt (behandlung-umbau) — nicht auf Verdacht gebaut.
//
// Aussehen AUSSCHLIESSLICH aus Masken-Tokens (--se-*), keine Literale bei
// Farben/Radius/Schrift; strukturelle Groessen (Hoehe, Padding) als Literale
// wie bei Button/Infobox. Verbindliches Zielbild: dashboard/stilprobe.html
// (.zb-input / Eingabefeld-Zielbild Kap. 6).

import { css, html, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { BlockCategory } from '../../core/blocks/BlockComponent'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'

// Technikwert (unsichtbar) — der Bediener waehlt den Klarnamen im Inspector.
export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'date'

const FIELD_TYPES: readonly FieldType[] = [
  'text',
  'number',
  'email',
  'password',
  'textarea',
  'select',
  'checkbox',
  'date',
]

// Unbekannte/alte Werte fallen sicher auf 'text' zurueck (z. B. Altbestand
// aus localStorage) — kein Block rendert je einen undefinierten Typ.
export function coerceFieldType(value: string): FieldType {
  return (FIELD_TYPES as readonly string[]).includes(value)
    ? (value as FieldType)
    : 'text'
}

// Kleiner Ja/Nein-Select fuer boolesche Eigenschaften (Pflicht, Nur-lesen).
// Bewusst als Select statt eigenem Boolean-Control: kein neues Inspector-Infra
// fuer v1 (DRY); ein echtes Toggle kann spaeter folgen, wenn ein zweiter Fall
// es braucht (vgl. statusVariant-Extraktion erst beim dritten Nutzer).
function jaNeinProperty(
  attributeName: string,
  name: string,
  description: string,
): PropertyDescription {
  return {
    attributeName,
    name,
    description,
    isArray: false,
    maxLength: 0,
    kind: 'select',
    options: [
      { value: 'nein', label: 'Nein' },
      { value: 'ja', label: 'Ja' },
    ],
  }
}

export class FormFieldBlock extends BasicBlock {
  static readonly blockType = 'formfield'
  static readonly tagName = 'ff-formfield'
  static readonly displayName = 'Eingabefeld'
  static readonly category: BlockCategory = 'eingabe'
  static readonly defaultProps = {
    fieldType: 'text',
    placeholder: 'Text eingeben',
    required: 'nein',
    readonly: 'nein',
    // Optionen fuer den Typ "Auswahl": mit Komma getrennt (eine Zeile —
    // robust als Attribut im Export, kein Zeilenumbruch). Andere Typen
    // ignorieren den Wert.
    options: 'Untersuchung, Impfung, Operation',
    // Sinnvolle Standardbreite (das Zielbild zeigt 220-240px); der Bediener
    // kann per Breite-Anfasser auf px/fill wechseln.
    width: 240,
  }

  static override readonly customProperties: PropertyDescription[] = [
    {
      attributeName: 'fieldType',
      name: 'Feldtyp',
      description: 'Art des Eingabefeldes.',
      isArray: false,
      maxLength: 0,
      kind: 'select',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Zahl' },
        { value: 'email', label: 'E-Mail' },
        { value: 'password', label: 'Passwort' },
        { value: 'textarea', label: 'Mehrzeilig' },
        { value: 'select', label: 'Auswahl' },
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'date', label: 'Datum' },
      ],
    },
    {
      attributeName: 'placeholder',
      name: 'Platzhalter',
      description: 'Grauer Hinweistext im leeren Feld.',
      isArray: false,
      maxLength: 120,
      kind: 'text',
    },
    {
      attributeName: 'options',
      name: 'Optionen',
      description: 'Nur bei "Auswahl": Einträge mit Komma getrennt.',
      isArray: false,
      maxLength: 500,
      kind: 'text',
    },
    jaNeinProperty('required', 'Pflichtfeld', 'Muss ausgefüllt werden.'),
    jaNeinProperty('readonly', 'Nur lesen', 'Wert wird angezeigt, aber nicht bearbeitbar.'),
  ]

  // Aussehen exakt nach Zielbild (.zb-input). Farben/Radius/Schrift aus Tokens;
  // strukturelle Groessen (Hoehe, Padding, Checkbox-Groesse) als Literale wie
  // bei Button/Infobox. select:read-only bewusst NICHT getoent (ein <select>
  // ist per Spec immer :read-only) — nur input/textarea zeigen den Nur-lesen-
  // Look, das echte Nur-lesen der Auswahl laeuft ueber :disabled.
  static styles = [
    BasicBlock.styles,
    css`
      .control {
        box-sizing: border-box;
        width: 100%;
        height: 34px;
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel-2);
        padding: 0 10px;
        font-family: var(--se-font);
        font-size: var(--se-fs);
        color: var(--se-ink);
      }
      .control::placeholder { color: var(--se-faint); }
      .control:focus { outline: none; border-color: var(--se-accent); }
      textarea.control {
        height: auto;
        min-height: 74px;
        padding: 7px 10px;
        line-height: 1.4;
        resize: vertical;
      }
      input.control:read-only,
      textarea.control:read-only,
      .control:disabled {
        background: var(--se-line-soft);
        color: var(--se-muted);
      }
      .check {
        width: 18px;
        height: 18px;
        margin: 0;
        accent-color: var(--se-accent);
      }
    `,
  ]

  @property() fieldType: FieldType = 'text'
  @property() placeholder = 'Text eingeben'
  @property() required = 'nein'
  @property() readonly = 'nein'
  @property() options = 'Untersuchung, Impfung, Operation'

  private get optionList(): string[] {
    return this.options
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
  }

  render(): TemplateResult {
    const type = coerceFieldType(this.fieldType)
    const req = this.required === 'ja'
    const ro = this.readonly === 'ja'

    switch (type) {
      case 'textarea':
        return html`<textarea
          class="control"
          placeholder=${this.placeholder}
          ?required=${req}
          ?readonly=${ro}
        ></textarea>`
      case 'select':
        return html`<select class="control" ?required=${req} ?disabled=${ro}>
          ${this.optionList.map((o) => html`<option>${o}</option>`)}
        </select>`
      case 'checkbox':
        return html`<input
          class="check"
          type="checkbox"
          ?required=${req}
          ?disabled=${ro}
        />`
      default:
        return html`<input
          class="control"
          type=${type}
          placeholder=${this.placeholder}
          ?required=${req}
          ?readonly=${ro}
        />`
    }
  }
}

BasicBlock.defineAndRegister(FormFieldBlock)
