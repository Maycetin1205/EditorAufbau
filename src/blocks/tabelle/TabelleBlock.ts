// TabelleBlock
// Datentabelle. Spalten kommen aus props.columns; im Design-Modus werden
// 3 Mock-Zeilen mit {Feld}-Platzhaltern gezeigt — keine echten SoftEngine-Daten.

import { css, html, LitElement, type TemplateResult } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { registerBlockType } from '../../core/blocks/blockRegistry'
import { escapeHtml } from '../shared'

export interface TabelleColumn {
  key: string
  label: string
  field: string
  width: number
}

interface TabelleProps {
  title: string
  dataSourceId: string
  columns: TabelleColumn[]
  showHeader: boolean
}

function tabelleTemplate(props: Partial<TabelleProps>): string {
  const title = escapeHtml(props.title ?? '')
  const columns = Array.isArray(props.columns) ? props.columns : []
  const showHeader = props.showHeader !== false

  const cols = columns.map((c) => `<col style="width:${Number(c.width) || 120}px" />`).join('')
  const head = showHeader
    ? `<thead><tr>${columns.map((c) => `<th>${escapeHtml(c.label || c.field || c.key)}</th>`).join('')}</tr></thead>`
    : ''
  const sampleRows = [0, 1, 2].map(() =>
    `<tr>${columns.map((c) => `<td><span class="ff-tab-placeholder">${escapeHtml(c.field ? `{${c.field}}` : '—')}</span></td>`).join('')}</tr>`,
  ).join('')
  const body = `<tbody>${sampleRows}</tbody>`

  const empty = columns.length === 0
    ? `<div class="ff-tab-empty">Keine Spalten definiert.</div>`
    : ''

  return `
    <div class="ff-tabelle">
      ${title ? `<div class="ff-tab-title">${title}</div>` : ''}
      ${empty || `<table>${cols}${head}${body}</table>`}
    </div>
  `.trim()
}

export class TabelleBlock extends LitElement {
  static styles = css`
    :host { display: block; width: 100%; height: 100%; }
    .ff-tabelle { display: flex; flex-direction: column; gap: 4px; height: 100%; box-sizing: border-box; overflow: hidden; }
    .ff-tab-title { font-size: 13px; font-weight: 600; color: #0f172a; }
    table { border-collapse: collapse; font-size: 12px; width: 100%; }
    th, td { padding: 4px 8px; border-bottom: 1px solid #e2e8f0; text-align: left; }
    thead th { background: #f1f5f9; color: #1e293b; font-weight: 600; }
    tbody tr:hover { background: #f8fafc; }
    .ff-tab-placeholder { color: #94a3b8; font-family: ui-monospace, monospace; font-size: 11px; }
    .ff-tab-empty { padding: 12px; border: 1px dashed #cbd5e1; border-radius: 4px; color: #64748b; font-size: 12px; text-align: center; }
  `

  private _title: string = ''
  private _dataSourceId: string = ''
  private _columns: TabelleColumn[] = []
  private _showHeader: boolean = true

  get title(): string { return this._title }
  set title(v: string) { const o = this._title; this._title = v; this.requestUpdate('title', o) }
  get dataSourceId(): string { return this._dataSourceId }
  set dataSourceId(v: string) { const o = this._dataSourceId; this._dataSourceId = v; this.requestUpdate('dataSourceId', o) }
  get columns(): TabelleColumn[] { return this._columns }
  set columns(v: TabelleColumn[]) { const o = this._columns; this._columns = Array.isArray(v) ? v : []; this.requestUpdate('columns', o) }
  get showHeader(): boolean { return this._showHeader }
  set showHeader(v: boolean) { const o = this._showHeader; this._showHeader = v; this.requestUpdate('showHeader', o) }

  render(): TemplateResult {
    return html`${unsafeHTML(tabelleTemplate({
      title: this._title,
      dataSourceId: this._dataSourceId,
      columns: this._columns,
      showHeader: this._showHeader,
    }))}`
  }
}

if (!customElements.get('ff-tabelle')) {
  customElements.define('ff-tabelle', TabelleBlock)
}

registerBlockType({
  type: 'tabelle',
  tagName: 'ff-tabelle',
  displayName: 'Datentabelle',
  category: 'daten',
  defaultProps: {
    title: 'Datentabelle',
    dataSourceId: '',
    columns: [],
    showHeader: true,
  },
  defaultLayout: { width: 520, height: 240 },
  customProperties: [
    { attributeName: 'title', name: 'Titel', description: '', isArray: false, maxLength: 80, kind: 'text' },
    { attributeName: 'dataSourceId', name: 'Datenquelle', description: '', isArray: false, maxLength: 0, kind: 'datasource' },
    { attributeName: 'showHeader', name: 'Kopfzeile', description: 'Spaltenkoepfe anzeigen', isArray: false, maxLength: 0, kind: 'boolean' },
    { attributeName: 'columns', name: 'Spalten', description: 'Definition der Tabellen-Spalten', isArray: true, maxLength: 0, kind: 'columns' },
  ],
  exportHtml: (props) => tabelleTemplate(props as Partial<TabelleProps>),
})
