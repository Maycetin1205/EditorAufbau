// FeldlisteBlock
// Mehrere Felder als 2-Spalten-Grid (Label | Wert-Platzhalter).
// Schlanke Alternative zur Detailkarte ohne Sektionen.

import { css, html, LitElement, type TemplateResult } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { registerBlockType } from '../../core/blocks/blockRegistry'
import { escapeHtml } from '../shared'

export interface FeldlisteItem {
  label: string
  field: string
}

interface FeldlisteProps {
  title: string
  dataSourceId: string
  fields: FeldlisteItem[]
}

function feldlisteTemplate(props: Partial<FeldlisteProps>): string {
  const title = escapeHtml(props.title ?? '')
  const fields = Array.isArray(props.fields) ? props.fields : []
  const rows = fields.map((f) =>
    `<div class="ff-fl-row">
      <div class="ff-fl-label">${escapeHtml(f.label ?? '')}</div>
      <div class="ff-fl-value">${f.field ? `<span class="ff-fl-placeholder">{${escapeHtml(f.field)}}</span>` : '<span class="ff-fl-muted">—</span>'}</div>
    </div>`,
  ).join('')

  const empty = fields.length === 0 ? `<div class="ff-fl-empty">Keine Eintraege.</div>` : ''

  return `
    <div class="ff-feldliste">
      ${title ? `<div class="ff-fl-title">${title}</div>` : ''}
      ${empty || `<div class="ff-fl-grid">${rows}</div>`}
    </div>
  `.trim()
}

export class FeldlisteBlock extends LitElement {
  static styles = css`
    :host { display: block; width: 100%; height: 100%; }
    .ff-feldliste {
      display: flex; flex-direction: column; gap: 6px; height: 100%; box-sizing: border-box;
      padding: 6px; overflow: auto; border: 1px solid #e2e8f0; border-radius: 6px; background: white;
    }
    .ff-fl-title { font-size: 13px; font-weight: 600; color: #0f172a; }
    .ff-fl-grid { display: grid; grid-template-columns: minmax(80px, max-content) 1fr; gap: 4px 12px; align-items: center; }
    .ff-fl-row { display: contents; }
    .ff-fl-label { font-size: 11px; color: #64748b; }
    .ff-fl-value { font-size: 12px; color: #0f172a; }
    .ff-fl-placeholder { color: #475569; font-family: ui-monospace, monospace; font-size: 11px; }
    .ff-fl-muted { color: #94a3b8; }
    .ff-fl-empty { padding: 12px; border: 1px dashed #cbd5e1; border-radius: 4px; color: #64748b; font-size: 12px; text-align: center; }
  `

  private _title: string = ''
  private _dataSourceId: string = ''
  private _fields: FeldlisteItem[] = []

  get title(): string { return this._title }
  set title(v: string) { const o = this._title; this._title = v; this.requestUpdate('title', o) }
  get dataSourceId(): string { return this._dataSourceId }
  set dataSourceId(v: string) { const o = this._dataSourceId; this._dataSourceId = v; this.requestUpdate('dataSourceId', o) }
  get fields(): FeldlisteItem[] { return this._fields }
  set fields(v: FeldlisteItem[]) { const o = this._fields; this._fields = Array.isArray(v) ? v : []; this.requestUpdate('fields', o) }

  render(): TemplateResult {
    return html`${unsafeHTML(feldlisteTemplate({
      title: this._title,
      dataSourceId: this._dataSourceId,
      fields: this._fields,
    }))}`
  }
}

if (!customElements.get('ff-feldliste')) {
  customElements.define('ff-feldliste', FeldlisteBlock)
}

registerBlockType({
  type: 'feldliste',
  tagName: 'ff-feldliste',
  displayName: 'Feldliste',
  category: 'inhalt',
  defaultProps: {
    title: 'Details',
    dataSourceId: '',
    fields: [
      { label: 'Name', field: '' },
      { label: 'Typ', field: '' },
      { label: 'Status', field: '' },
    ],
  },
  defaultLayout: { width: 320, height: 180 },
  customProperties: [
    { attributeName: 'title', name: 'Titel', description: '', isArray: false, maxLength: 80, kind: 'text' },
    { attributeName: 'dataSourceId', name: 'Datenquelle', description: '', isArray: false, maxLength: 0, kind: 'datasource' },
    { attributeName: 'fields', name: 'Felder', description: 'Label/Feld-Paare', isArray: true, maxLength: 0, kind: 'fieldList' },
  ],
  exportHtml: (props) => feldlisteTemplate(props as Partial<FeldlisteProps>),
})
