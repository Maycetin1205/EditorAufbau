// FeldBlock
// Generisches Eingabefeld (Text/Zahl/Checkbox/Select). An ein Catalog-Feld bindbar.
// Design-Modus: zeigt {Alias.Feld} als Platzhalter wenn Bindung gesetzt — keine echten Daten.
// SoftEngine-Anbindung kommt spaeter ueber Runtime-Adapter; das Feld kennt sie nicht direkt.

import { css, html, LitElement, type TemplateResult } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { registerBlockType } from '../../core/blocks/blockRegistry'
import { escapeHtml } from '../shared'

interface FeldProps {
  kind: 'text' | 'number' | 'checkbox' | 'select'
  label: string
  dataSourceId: string
  fieldName: string
  placeholder: string
  required: boolean
  readOnly: boolean
  options: string  // Komma-getrennte Werte fuer kind=select
}

function feldTemplate(props: Partial<FeldProps>): string {
  const kind = props.kind ?? 'text'
  const label = escapeHtml(props.label ?? '')
  const placeholderAttr = escapeHtml(props.placeholder ?? '')
  const required = props.required ? 'required' : ''
  const readOnly = props.readOnly ? 'readonly' : ''
  const bound = !!(props.dataSourceId && props.fieldName)
  const bindingBadge = bound
    ? `<span class="ff-feld-badge" title="gebunden an Datenquelle">${escapeHtml(props.fieldName ?? '')}</span>`
    : ''

  let input = ''
  switch (kind) {
    case 'number':
      input = `<input type="number" placeholder="${placeholderAttr}" ${required} ${readOnly} />`
      break
    case 'checkbox':
      input = `<label class="ff-feld-check"><input type="checkbox" ${readOnly} /> <span>${placeholderAttr || 'Aktiv'}</span></label>`
      break
    case 'select': {
      const optList = String(props.options ?? '').split(',').map((s) => s.trim()).filter(Boolean)
      const opts = optList.map((o) => `<option>${escapeHtml(o)}</option>`).join('')
      input = `<select ${readOnly}>${opts}</select>`
      break
    }
    default:
      input = `<input type="text" placeholder="${placeholderAttr}" ${required} ${readOnly} />`
  }

  return `
    <div class="ff-feld">
      ${label ? `<div class="ff-feld-label"><span>${label}</span>${bindingBadge}</div>` : bindingBadge}
      ${input}
    </div>
  `.trim()
}

export class FeldBlock extends LitElement {
  static styles = css`
    :host { display: block; width: 100%; height: 100%; }
    .ff-feld { display: flex; flex-direction: column; gap: 4px; height: 100%; box-sizing: border-box; }
    .ff-feld-label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #475569; }
    .ff-feld-badge {
      display: inline-block; font-size: 10px; padding: 1px 6px; border-radius: 999px;
      background: #dbeafe; color: #1e40af; font-weight: 500;
    }
    .ff-feld input[type='text'], .ff-feld input[type='number'], .ff-feld select {
      flex: 1; min-height: 28px; padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 4px;
      font-size: 13px; background: white; box-sizing: border-box;
    }
    .ff-feld-check { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #0f172a; }
    .ff-feld input:focus, .ff-feld select:focus { outline: 2px solid #3b82f6; outline-offset: 0; }
  `

  private _kind: FeldProps['kind'] = 'text'
  private _label: string = ''
  private _dataSourceId: string = ''
  private _fieldName: string = ''
  private _placeholder: string = ''
  private _required: boolean = false
  private _readOnly: boolean = false
  private _options: string = ''

  get kind(): FeldProps['kind'] { return this._kind }
  set kind(v: FeldProps['kind']) { const o = this._kind; this._kind = v; this.requestUpdate('kind', o) }
  get label(): string { return this._label }
  set label(v: string) { const o = this._label; this._label = v; this.requestUpdate('label', o) }
  get dataSourceId(): string { return this._dataSourceId }
  set dataSourceId(v: string) { const o = this._dataSourceId; this._dataSourceId = v; this.requestUpdate('dataSourceId', o) }
  get fieldName(): string { return this._fieldName }
  set fieldName(v: string) { const o = this._fieldName; this._fieldName = v; this.requestUpdate('fieldName', o) }
  get placeholder(): string { return this._placeholder }
  set placeholder(v: string) { const o = this._placeholder; this._placeholder = v; this.requestUpdate('placeholder', o) }
  get required(): boolean { return this._required }
  set required(v: boolean) { const o = this._required; this._required = v; this.requestUpdate('required', o) }
  get readOnly(): boolean { return this._readOnly }
  set readOnly(v: boolean) { const o = this._readOnly; this._readOnly = v; this.requestUpdate('readOnly', o) }
  get options(): string { return this._options }
  set options(v: string) { const o = this._options; this._options = v; this.requestUpdate('options', o) }

  render(): TemplateResult {
    return html`${unsafeHTML(feldTemplate({
      kind: this._kind,
      label: this._label,
      dataSourceId: this._dataSourceId,
      fieldName: this._fieldName,
      placeholder: this._placeholder,
      required: this._required,
      readOnly: this._readOnly,
      options: this._options,
    }))}`
  }
}

if (!customElements.get('ff-feld')) {
  customElements.define('ff-feld', FeldBlock)
}

registerBlockType({
  type: 'feld',
  tagName: 'ff-feld',
  displayName: 'Formularfeld',
  category: 'eingabe',
  defaultProps: {
    kind: 'text',
    label: 'Feld',
    dataSourceId: '',
    fieldName: '',
    placeholder: 'Eingabe...',
    required: false,
    readOnly: false,
    options: '',
  },
  defaultLayout: { width: 240, height: 64 },
  customProperties: [
    {
      attributeName: 'kind', name: 'Feldtyp', description: 'Welche Eingabe?', isArray: false, maxLength: 0, kind: 'select',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Zahl' },
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'select', label: 'Auswahl' },
      ],
    },
    { attributeName: 'label', name: 'Label', description: 'Beschriftung ueber dem Feld', isArray: false, maxLength: 80, kind: 'text' },
    { attributeName: 'dataSourceId', name: 'Datenquelle', description: '', isArray: false, maxLength: 0, kind: 'datasource' },
    { attributeName: 'fieldName', name: 'Feld', description: 'Feld in der Datenquelle', isArray: false, maxLength: 80, kind: 'field', bindsTo: 'dataSourceId' },
    { attributeName: 'placeholder', name: 'Platzhalter', description: '', isArray: false, maxLength: 80, kind: 'text' },
    { attributeName: 'required', name: 'Pflichtfeld', description: '', isArray: false, maxLength: 0, kind: 'boolean' },
    { attributeName: 'readOnly', name: 'Nur lesen', description: '', isArray: false, maxLength: 0, kind: 'boolean' },
    { attributeName: 'options', name: 'Optionen', description: 'Komma-getrennt (nur fuer Auswahl)', isArray: false, maxLength: 500, kind: 'text' },
  ],
  exportHtml: (props) => feldTemplate(props as Partial<FeldProps>),
})
