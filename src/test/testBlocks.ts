// Test-Blöcke
// Registriert leichte Block-Definitionen direkt in der Registry — OHNE
// Lit/DOM. Damit testen Store-Tests die echte Logik (Factory, normalize,
// sanitize), ohne dass Web Components definiert werden müssen.

import { registerBlockType } from '../core/blocks/blockRegistry'
import { FLOW_DEFAULTS } from '../core/blocks/flowLayout'

let registered = false

export const TEST_BLOCK = 't-block'
export const TEST_BOX = 't-box'

export function registerTestBlocks(): void {
  if (registered) return
  registered = true
  registerBlockType({
    type: TEST_BLOCK,
    tagName: 'ff-t-block',
    displayName: 'Testblock',
    category: 'anzeige',
    defaultProps: { ...FLOW_DEFAULTS, text: 'Standard' },
    customProperties: [],
    acceptsChildren: false,
    resizableWidth: true,
  })
  registerBlockType({
    type: TEST_BOX,
    tagName: 'ff-t-box',
    displayName: 'Testbereich',
    category: 'layout',
    defaultProps: { ...FLOW_DEFAULTS, direction: 'column', width: 'fill' },
    customProperties: [],
    acceptsChildren: true,
    resizableWidth: true,
  })
}
