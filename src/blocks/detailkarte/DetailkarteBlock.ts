// DetailkarteBlock
// Einzeldatensatz formularartig dargestellt, gruppiert in Sektionen.
// Design-Modus: zeigt {Feld}-Platzhalter pro Wert-Zelle.

import { css, html, LitElement, type TemplateResult } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { registerBlockType } from '../../core/blocks/blockRegistry'
import { escapeHtml } from '../shared'

export interface DetailField {
  label: string
  field: string
}

export interface DetailSection {
  id: string
  title: string
  fields: DetailField[]
}

interface DetailkarteProps {
  title: string
  dataSourceId: string
  sections: DetailSection[]
}

function detailkarteTemplate(props: Partial<DetailkarteProps>): string {
  const title = escapeHtml(props.title ?? '')
  const sections = Array.isArray(props.sections) ? props.sections : []

  const sectionsHtml = sections.map((s) => {
    const fields = (s.fields ?? []).map((f) =>
      `<div class="ff-dk-field">
        <div class="ff-dk-label">${escapeHtml(f.label ?? '')}</div>
        <div class="ff-dk-value">${f.field ? `<span class="ff-dk-placeholder">{${escapeHtml(f.field)}}</span>` : '<span class="ff-dk-muted">—</span>'}</div>
      </div>`,
    ).join('')
    return `
      <section class="ff-dk-section">
        ${s.title ? `<header>${escapeHtml(s.title)}</header>` : ''}
        <div class="ff-dk-grid">${fields || '<p class="ff-dk-muted">Keine Felder.</p>'}</div>
      </section>
    `
  }).join('')

  const empty = sections.length === 0
    ? `<div class="ff-dk-empty">Keine Sektionen.</div>`
    : ''

  return `
    <div class="ff-detailkarte">
      ${title ? `<div class="ff-dk-title">${title}</div>` : ''}
      ${empty || sectionsHtml}
    </div>
  `.trim()
}

export class DetailkarteBlock extends LitElement {
  static styles = css`
    :host { display: block; width: 100%; height: 100%; }
    .ff-detailkarte {
      display: flex; flex-direction: column; gap: 8px; height: 100%;
      box-sizing: border-box; padding: 8px; overflow: auto;
      border: 1px solid #e2e8f0; border-radius: 6px; background: white;
    }
    .ff-dk-title { font-size: 14px; font-weight: 600; color: #0f172a; }
    .ff-dk-section header {
      font-size: 12px; font-weight: 600; color: #1e293b; padding: 4px 0;
      border-bottom: 1px solid #e2e8f0; margin-bottom: 4px;
    }
    .ff-dk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; }
    .ff-dk-field { display: flex; flex-direction: column; gap: 2px; }
    .ff-dk-label { font-size: 11px; color: #64748b; }
    .ff-dk-value { font-size: 12px; color: #0f172a; }
    .ff-dk-placeholder { color: #475569; font-family: ui-monospace, monospace; font-size: 11px; }
    .ff-dk-muted { color: #94a3b8; }
    .ff-dk-empty { padding: 12px; border: 1px dashed #cbd5e1; border-radius: 4px; color: #64748b; font-size: 12px; text-align: center; }
  `

  private _title: string = ''
  private _dataSourceId: string = ''
  private _sections: DetailSection[] = []

  get title(): string { return this._title }
  set title(v: string) { const o = this._title; this._title = v; this.requestUpdate('title', o) }
  get dataSourceId(): string { return this._dataSourceId }
  set dataSourceId(v: string) { const o = this._dataSourceId; this._dataSourceId = v; this.requestUpdate('dataSourceId', o) }
  get sections(): DetailSection[] { return this._sections }
  set sections(v: DetailSection[]) { const o = this._sections; this._sections = Array.isArray(v) ? v : []; this.requestUpdate('sections', o) }

  render(): TemplateResult {
    return html`${unsafeHTML(detailkarteTemplate({
      title: this._title,
      dataSourceId: this._dataSourceId,
      sections: this._sections,
    }))}`
  }
}

if (!customElements.get('ff-detailkarte')) {
  customElements.define('ff-detailkarte', DetailkarteBlock)
}

registerBlockType({
  type: 'detailkarte',
  tagName: 'ff-detailkarte',
  displayName: 'Detailkarte',
  category: 'daten',
  defaultProps: {
    title: 'Details',
    dataSourceId: '',
    sections: [
      { id: crypto.randomUUID(), title: 'Stammdaten', fields: [] },
    ],
  },
  defaultLayout: { width: 360, height: 280 },
  customProperties: [
    { attributeName: 'title', name: 'Titel', description: '', isArray: false, maxLength: 80, kind: 'text' },
    { attributeName: 'dataSourceId', name: 'Datenquelle', description: '', isArray: false, maxLength: 0, kind: 'datasource' },
    { attributeName: 'sections', name: 'Sektionen', description: 'Gruppen mit Label/Feld-Eintraegen', isArray: true, maxLength: 0, kind: 'sections' },
  ],
  exportHtml: (props) => detailkarteTemplate(props as Partial<DetailkarteProps>),
})
