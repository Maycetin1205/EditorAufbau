// TextBlock
// Konkreter Block-Typ: Text.
// Erweitert BasicBlock um content, fontSize, color, align.
// Registriert sich am Ende der Datei als Custom-Element <ff-text>.
// Validiert dass Vererbungs-Muster wiederverwendbar ist (zweiter Block nach Button).

import { html, type TemplateResult } from 'lit'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { registerBlockType } from '../../core/blocks/blockRegistry'

export class TextBlock extends BasicBlock {
  protected _content: string = 'Neuer Text'
  protected _fontSize: number = 16
  protected _color: string = '#000000'
  protected _align: 'left' | 'center' | 'right' = 'left'

  constructor(id: string = crypto.randomUUID(), width: number = 200, height: number = 40) {
    super(id, 'text', width, height)
  }

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

  get align(): 'left' | 'center' | 'right' {
    return this._align
  }
  set align(v: 'left' | 'center' | 'right') {
    const old = this._align
    this._align = v
    this.requestUpdate('align', old)
  }

  override get customProperties(): PropertyDescription[] {
    return [
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
    ]
  }

  override render(): TemplateResult {
    const style = `font-size:${this._fontSize}px;color:${this._color};text-align:${this._align};`
    return html`<span style="${style}">${this._content}</span>`
  }
}

customElements.define('ff-text', TextBlock)
registerBlockType('text', TextBlock)
