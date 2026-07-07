// Test-Blöcke
// Registriert leichte Block-Definitionen direkt in der Registry — OHNE
// Lit/DOM. Damit testen Store-Tests die echte Logik (Factory, normalize,
// sanitize), ohne dass Web Components definiert werden müssen.

import { registerBlockType } from '../core/blocks/blockRegistry'
import { FLOW_DEFAULTS } from '../core/blocks/flowLayout'

let registered = false

export const TEST_BLOCK = 't-block'
export const TEST_BOX = 't-box'
// Container, der NUR t-block aufnimmt (allowedChildTypes, Kap. 4K.4).
export const TEST_STRICT_BOX = 't-strict-box'
// Block, der mit Beispieldaten-Teilbaum eingefügt wird (defaultChildren).
export const TEST_BOARD = 't-board'
// Container mit Datenquellen-Fähigkeit (acceptsDataSource, Kap. 5.1/5.2).
export const TEST_DATA_BOX = 't-daten-box'

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
  registerBlockType({
    type: TEST_STRICT_BOX,
    tagName: 'ff-t-strict-box',
    displayName: 'Strenger Testbereich',
    category: 'layout',
    defaultProps: { ...FLOW_DEFAULTS },
    customProperties: [],
    acceptsChildren: true,
    resizableWidth: true,
    allowedChildTypes: [TEST_BLOCK],
    childDirection: 'row',
  })
  registerBlockType({
    type: TEST_BOARD,
    tagName: 'ff-t-board',
    displayName: 'Testboard',
    category: 'layout',
    defaultProps: { ...FLOW_DEFAULTS },
    customProperties: [],
    acceptsChildren: true,
    resizableWidth: true,
    allowedChildTypes: [TEST_STRICT_BOX],
    defaultChildren: [
      {
        type: TEST_STRICT_BOX,
        children: [
          { type: TEST_BLOCK, props: { text: 'Karte A' } },
          { type: TEST_BLOCK, props: { text: 'Karte B' } },
        ],
      },
      { type: TEST_STRICT_BOX, children: [] },
    ],
  })
  registerBlockType({
    type: TEST_DATA_BOX,
    tagName: 'ff-t-daten-box',
    displayName: 'Testdatenbereich',
    category: 'layout',
    defaultProps: { ...FLOW_DEFAULTS, source: '' },
    customProperties: [],
    acceptsChildren: true,
    resizableWidth: true,
    acceptsDataSource: true,
  })
}
