// ButtonBlock
// Lit Web Component fuer den Button-Block.
// Reine View: haelt nur Render-Properties (label), KEINE Editor-State-Felder.
// Editor-State (id, layout, type) lebt im Editor als BlockData.
// HMR-Schutz + Self-Registrierung in blockRegistry am Datei-Ende.

import { css, html, LitElement, type TemplateResult } from 'lit'
import { registerBlockType } from '../../core/blocks/blockRegistry'

export class ButtonBlock extends LitElement {
  // :host = das Custom-Element selbst. display:block + 100%/100% sorgt dafuer,
  // dass der sichtbare Block die volle Flaeche des BlockHost-Rahmens einnimmt.
  // Sonst rendert <button> nur in nativer Browser-Groesse und der Greifrahmen
  // ist viel groesser als das was man sieht.
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    button {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      cursor: inherit;
    }
  `

  private _label: string = 'Klick mich'

  get label(): string {
    return this._label
  }
  set label(v: string) {
    const old = this._label
    this._label = v
    this.requestUpdate('label', old)
  }

  render(): TemplateResult {
    return html`<button>${this._label}</button>`
  }
}

// HMR-Schutz: bei Vite-Hot-Reload sonst "name already used"-Error.
if (!customElements.get('ff-button')) {
  customElements.define('ff-button', ButtonBlock)
}

registerBlockType({
  type: 'button',
  tagName: 'ff-button',
  defaultProps: { label: 'Klick mich' },
  defaultLayout: { width: 120, height: 40 },
  customProperties: [
    {
      attributeName: 'label',
      name: 'Beschriftung',
      description: 'Text auf dem Button',
      isArray: false,
      maxLength: 50,
    },
  ],
})
