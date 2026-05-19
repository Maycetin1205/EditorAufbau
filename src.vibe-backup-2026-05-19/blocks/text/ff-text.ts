// Echte WYSIWYG-Komponente: Canvas und Export verwenden denselben <ff-text>.
import { LitElement, css, html } from 'lit'
import type { TextAlign, TextSize, TextTone } from './text.schema'

export class FfText extends LitElement {
  static properties = {
    content: { type: String },
    size: { type: String },
    tone: { type: String },
    align: { type: String },
  }

  static styles = css`
    :host {
      display: block;
      max-width: 720px;
      font-family:
        Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
        sans-serif;
    }

    .text {
      margin: 0;
      color: #1f2937;
      line-height: 1.55;
      white-space: pre-wrap;
    }

    .text.lead {
      font-size: 18px;
      line-height: 1.45;
    }

    .text.heading {
      font-size: 24px;
      line-height: 1.25;
      font-weight: 700;
    }

    .text.muted {
      color: #667085;
    }

    .text.accent {
      color: #364fc7;
    }

    .text.center {
      text-align: center;
    }

    .text.right {
      text-align: right;
    }
  `

  declare content: string
  declare size: TextSize
  declare tone: TextTone
  declare align: TextAlign

  constructor() {
    super()
    this.content = 'Text'
    this.size = 'body'
    this.tone = 'default'
    this.align = 'left'
  }

  render() {
    const className = ['text', this.size, this.tone, this.align].join(' ')

    return html`<p class=${className}>${this.content}</p>`
  }
}

if (!customElements.get('ff-text')) {
  customElements.define('ff-text', FfText)
}

declare global {
  interface HTMLElementTagNameMap {
    'ff-text': FfText
  }
}
