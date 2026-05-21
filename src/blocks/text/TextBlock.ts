// TextBlock
// Lit Web Component fuer den Text-Block.
// Single Source of Truth via textTemplate(props).

import { css, html, LitElement, type TemplateResult } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { registerBlockType } from '../../core/blocks/blockRegistry'
import { escapeHtml, inlineStyle } from '../shared'

interface TextProps {
  content: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  align: 'left' | 'center' | 'right'
  color: string
}

function textTemplate(props: Partial<TextProps>): string {
  const content = escapeHtml(props.content ?? 'Neuer Text')
  const style = inlineStyle({
    'font-size': props.fontSize ? `${props.fontSize}px` : undefined,
    'font-weight': props.fontWeight,
    'text-align': props.align,
    color: props.color,
  })
  return `<span style="${style}">${content}</span>`
}

export class TextBlock extends LitElement {
  static styles = css`
    :host { display: block; width: 100%; height: 100%; }
    span { display: block; width: 100%; height: 100%; }
  `

  private _content: string = 'Neuer Text'
  private _fontSize: number = 14
  private _fontWeight: TextProps['fontWeight'] = 'normal'
  private _align: TextProps['align'] = 'left'
  private _color: string = ''

  get content(): string { return this._content }
  set content(v: string) { const o = this._content; this._content = v; this.requestUpdate('content', o) }
  get fontSize(): number { return this._fontSize }
  set fontSize(v: number) { const o = this._fontSize; this._fontSize = v; this.requestUpdate('fontSize', o) }
  get fontWeight(): TextProps['fontWeight'] { return this._fontWeight }
  set fontWeight(v: TextProps['fontWeight']) { const o = this._fontWeight; this._fontWeight = v; this.requestUpdate('fontWeight', o) }
  get align(): TextProps['align'] { return this._align }
  set align(v: TextProps['align']) { const o = this._align; this._align = v; this.requestUpdate('align', o) }
  get color(): string { return this._color }
  set color(v: string) { const o = this._color; this._color = v; this.requestUpdate('color', o) }

  render(): TemplateResult {
    return html`${unsafeHTML(textTemplate({
      content: this._content,
      fontSize: this._fontSize,
      fontWeight: this._fontWeight,
      align: this._align,
      color: this._color,
    }))}`
  }
}

if (!customElements.get('ff-text')) {
  customElements.define('ff-text', TextBlock)
}

registerBlockType({
  type: 'text',
  tagName: 'ff-text',
  displayName: 'Textblock',
  category: 'inhalt',
  defaultProps: {
    content: 'Neuer Text',
    fontSize: 14,
    fontWeight: 'normal',
    align: 'left',
    color: '',
  },
  defaultLayout: { width: 240, height: 40 },
  customProperties: [
    { attributeName: 'content', name: 'Inhalt', description: 'Text-Inhalt des Blocks', isArray: false, maxLength: 1000, kind: 'textarea' },
    { attributeName: 'fontSize', name: 'Schriftgroesse', description: 'Groesse in Pixel', isArray: false, maxLength: 4, kind: 'number' },
    {
      attributeName: 'fontWeight', name: 'Schriftstaerke', description: '', isArray: false, maxLength: 0, kind: 'select',
      options: [
        { value: 'normal', label: 'Normal' },
        { value: 'bold', label: 'Fett' },
      ],
    },
    {
      attributeName: 'align', name: 'Ausrichtung', description: '', isArray: false, maxLength: 0, kind: 'select',
      options: [
        { value: 'left', label: 'Links' },
        { value: 'center', label: 'Zentriert' },
        { value: 'right', label: 'Rechts' },
      ],
    },
    { attributeName: 'color', name: 'Textfarbe', description: 'Hex-Farbe', isArray: false, maxLength: 0, kind: 'color' },
  ],
  exportHtml: (props) => textTemplate(props as Partial<TextProps>),
})
