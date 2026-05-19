// TextBlock
// Lit Web Component fuer den Text-Block.
// Reine View: haelt nur Render-Properties (content, fontSize, color, align).
// Editor-State (id, layout, type) lebt im Editor als BlockData.

import { html, LitElement, type TemplateResult } from 'lit'
import { registerBlockType } from '../../core/blocks/blockRegistry'

export class TextBlock extends LitElement {
  private _content: string = 'Neuer Text'
  private _fontSize: number = 16
  private _color: string = '#000000'
  private _align: string = 'left'

  get content(): string {
    return this._content
  }
  set content(v: string) {
    const old = this._content
    this._content = v
    this.requestUpdate('content', old)
  }

  get fontSize(): number {
    return this._fontSize
  }
  set fontSize(v: number) {
    const old = this._fontSize
    this._fontSize = v
    this.requestUpdate('fontSize', old)
  }

  get color(): string {
    return this._color
  }
  set color(v: string) {
    const old = this._color
    this._color = v
    this.requestUpdate('color', old)
  }

  get align(): string {
    return this._align
  }
  set align(v: string) {
    const old = this._align
    this._align = v
    this.requestUpdate('align', old)
  }

  render(): TemplateResult {
    const style = `font-size:${this._fontSize}px;color:${this._color};text-align:${this._align};`
    return html`<span style="${style}">${this._content}</span>`
  }
}

if (!customElements.get('ff-text')) {
  customElements.define('ff-text', TextBlock)
}

registerBlockType({
  type: 'text',
  tagName: 'ff-text',
  defaultProps: {
    content: 'Neuer Text',
    fontSize: 16,
    color: '#000000',
    align: 'left',
  },
  defaultLayout: { width: 200, height: 40 },
  customProperties: [
    {
      attributeName: 'content',
      name: 'Inhalt',
      description: 'Text-Inhalt des Blocks',
      isArray: false,
      maxLength: 500,
    },
    {
      attributeName: 'fontSize',
      name: 'Schriftgroesse',
      description: 'Groesse in Pixel',
      isArray: false,
      maxLength: 4,
    },
    {
      attributeName: 'color',
      name: 'Farbe',
      description: 'Schriftfarbe als Hex-Code',
      isArray: false,
      maxLength: 7,
    },
    {
      attributeName: 'align',
      name: 'Ausrichtung',
      description: 'Links, Mitte oder Rechts',
      isArray: false,
      maxLength: 6,
    },
  ],
})
