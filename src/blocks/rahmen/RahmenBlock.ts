// RahmenBlock
// Visueller Container/Gruppierung. Im aktuellen Schnitt KEINE Verschachtelung —
// andere Bloecke liegen positionsbasiert darueber. Spaeter kann parentId
// fuer echte Container-Hierarchie nachgeruestet werden (eigene Architektur-Etappe).

import { css, html, LitElement, type TemplateResult } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { registerBlockType } from '../../core/blocks/blockRegistry'
import { escapeHtml, inlineStyle } from '../shared'

interface RahmenProps {
  title: string
  border: boolean
  background: string
  padding: number
}

function rahmenTemplate(props: Partial<RahmenProps>): string {
  const title = escapeHtml(props.title ?? '')
  const border = props.border !== false
  const bg = props.background ?? ''
  const padding = typeof props.padding === 'number' ? props.padding : 8

  const frameStyle = inlineStyle({
    border: border ? '1px solid #cbd5e1' : 'none',
    'background-color': bg,
    padding: `${padding}px`,
  })

  return `
    <div class="ff-rahmen" style="${frameStyle}">
      ${title ? `<div class="ff-rahmen-title">${title}</div>` : ''}
      <div class="ff-rahmen-body"></div>
    </div>
  `.trim()
}

export class RahmenBlock extends LitElement {
  static styles = css`
    :host { display: block; width: 100%; height: 100%; }
    .ff-rahmen { display: flex; flex-direction: column; height: 100%; box-sizing: border-box; border-radius: 6px; }
    .ff-rahmen-title { font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 6px; }
    .ff-rahmen-body { flex: 1; min-height: 0; }
  `

  private _title: string = ''
  private _border: boolean = true
  private _background: string = ''
  private _padding: number = 8

  get title(): string { return this._title }
  set title(v: string) { const o = this._title; this._title = v; this.requestUpdate('title', o) }
  get border(): boolean { return this._border }
  set border(v: boolean) { const o = this._border; this._border = v; this.requestUpdate('border', o) }
  get background(): string { return this._background }
  set background(v: string) { const o = this._background; this._background = v; this.requestUpdate('background', o) }
  get padding(): number { return this._padding }
  set padding(v: number) { const o = this._padding; this._padding = v; this.requestUpdate('padding', o) }

  render(): TemplateResult {
    return html`${unsafeHTML(rahmenTemplate({
      title: this._title,
      border: this._border,
      background: this._background,
      padding: this._padding,
    }))}`
  }
}

if (!customElements.get('ff-rahmen')) {
  customElements.define('ff-rahmen', RahmenBlock)
}

registerBlockType({
  type: 'rahmen',
  tagName: 'ff-rahmen',
  displayName: 'Rahmen',
  category: 'layout',
  defaultProps: {
    title: '',
    border: true,
    background: '',
    padding: 8,
  },
  defaultLayout: { width: 320, height: 220 },
  customProperties: [
    { attributeName: 'title', name: 'Titel', description: '', isArray: false, maxLength: 80, kind: 'text' },
    { attributeName: 'border', name: 'Rahmen anzeigen', description: '', isArray: false, maxLength: 0, kind: 'boolean' },
    { attributeName: 'background', name: 'Hintergrundfarbe', description: 'Hex-Wert oder leer', isArray: false, maxLength: 0, kind: 'color' },
    { attributeName: 'padding', name: 'Innenabstand', description: 'Pixel', isArray: false, maxLength: 0, kind: 'number' },
  ],
  exportHtml: (props) => rahmenTemplate(props as Partial<RahmenProps>),
})
