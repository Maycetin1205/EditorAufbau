// ButtonBlock
// Lit Web Component fuer den Button-Block.
// Reine View: haelt nur Render-Properties (label, variant), KEINE Editor-State-Felder.
// Editor-State (id, layout, type) lebt im Editor als BlockData.
// HMR-Schutz + Self-Registrierung in blockRegistry am Datei-Ende.

import { html, LitElement, type TemplateResult } from 'lit'
import { registerBlockType } from '../../core/blocks/blockRegistry'

export class ButtonBlock extends LitElement {
  private _label: string = 'Klick mich'
  private _variant: string = 'primary'

  get label(): string {
    return this._label
  }
  set label(v: string) {
    const old = this._label
    this._label = v
    this.requestUpdate('label', old)
  }

  get variant(): string {
    return this._variant
  }
  set variant(v: string) {
    const old = this._variant
    this._variant = v
    this.requestUpdate('variant', old)
  }

  render(): TemplateResult {
    return html`<button class="${this._variant}">${this._label}</button>`
  }
}

// HMR-Schutz: bei Vite-Hot-Reload sonst "name already used"-Error.
if (!customElements.get('ff-button')) {
  customElements.define('ff-button', ButtonBlock)
}

registerBlockType({
  type: 'button',
  tagName: 'ff-button',
  defaultProps: { label: 'Klick mich', variant: 'primary' },
  defaultLayout: { width: 120, height: 40 },
  customProperties: [
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
  ],
})
