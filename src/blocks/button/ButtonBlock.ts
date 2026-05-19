// ButtonBlock
// Konkreter Block-Typ: Button.
// Erweitert BasicBlock um label und variant.
// Registriert sich am Ende der Datei als Custom-Element <ff-button>.
// Vorlage: Notiz Woche 2 (KanbanBoard extends BasicComponentForGrid).

import { html, type TemplateResult } from 'lit'
import { BasicBlock } from '../../core/blocks/BasicBlock'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { registerBlockType } from '../../core/blocks/blockRegistry'

export class ButtonBlock extends BasicBlock {
  protected _label: string = 'Klick mich'
  protected _variant: 'primary' | 'secondary' = 'primary'

  constructor(id: string = crypto.randomUUID(), width: number = 120, height: number = 40) {
    super(id, 'button', width, height)
  }

  get label(): string {
    return this._label
  }
  set label(v: string) {
    const old = this._label
    this._label = v
    this.requestUpdate('label', old)
  }

  get variant(): 'primary' | 'secondary' {
    return this._variant
  }
  set variant(v: 'primary' | 'secondary') {
    const old = this._variant
    this._variant = v
    this.requestUpdate('variant', old)
  }

  override get customProperties(): PropertyDescription[] {
    return [
      {
        attributeName: 'label',
        name: 'Beschriftung',
        description: 'Text auf dem Button',
        isArray: false,
        maxLength: 50,
      },
      {
        attributeName: 'variant',
        name: 'Variante',
        description: 'Primaer oder Sekundaer',
        isArray: false,
        maxLength: 20,
      },
    ]
  }

  override render(): TemplateResult {
    return html`<button class="${this._variant}">${this._label}</button>`
  }
}

customElements.define('ff-button', ButtonBlock)
registerBlockType('button', ButtonBlock)
