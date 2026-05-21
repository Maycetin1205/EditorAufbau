// TextBlock
// Lit Web Component fuer den Text-Block.
// Reine View: haelt nur Render-Properties (content, fontSize).
// Editor-State (id, layout, type) lebt im Editor als BlockData.

import { css, html, LitElement, type TemplateResult } from 'lit'
import { registerBlockType } from '../../core/blocks/blockRegistry'

export class TextBlock extends LitElement {
  // Host fuellt den BlockHost-Rahmen, damit Greifrahmen = sichtbarer Block.
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    span {
      display: block;
      width: 100%;
      height: 100%;
    }
  `

  private _content: string = 'Neuer Text'
  private _fontSize: number = 16

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

  render(): TemplateResult {
    const style = `font-size:${this._fontSize}px;`
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
  ],
})
