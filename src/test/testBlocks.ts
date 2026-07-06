// Test-Blöcke
// Registriert leichte Block-Definitionen direkt in der Registry — OHNE
// Lit/DOM. Damit testen Store-Tests die echte Logik (Factory, normalize,
// sanitize), ohne dass Web Components definiert werden müssen.

import { registerBlockType } from '../core/blocks/blockRegistry'
import { FLOW_DEFAULTS } from '../core/blocks/flowLayout'

let registered = false

export const TEST_BLOCK = 't-block'
export const TEST_BOX = 't-box'
// Restriktiver Container (Kap. 4K.4): nimmt NUR TEST_BLOCK auf — Testdouble
// fuer die Kanban-Spalte.
export const TEST_LIST = 't-list'
// Container mit Beispieldaten-Kindern: bringt beim Einfuegen 2 Listen mit je
// einem Block mit — Testdouble fuer das Kanban-Board.
export const TEST_KIT = 't-kit'

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
    allowedChildTypes: null,
    childDirection: null,
    defaultChildren: [],
    paletteHidden: false,
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
    allowedChildTypes: null,
    childDirection: null,
    defaultChildren: [],
    paletteHidden: false,
  })
  registerBlockType({
    type: TEST_LIST,
    tagName: 'ff-t-list',
    displayName: 'Testliste',
    category: 'anzeige',
    defaultProps: { ...FLOW_DEFAULTS, title: 'Liste' },
    customProperties: [],
    acceptsChildren: true,
    resizableWidth: true,
    allowedChildTypes: [TEST_BLOCK],
    childDirection: 'column',
    defaultChildren: [],
    paletteHidden: true,
  })
  registerBlockType({
    type: TEST_KIT,
    tagName: 'ff-t-kit',
    displayName: 'Testbausatz',
    category: 'anzeige',
    defaultProps: { ...FLOW_DEFAULTS, width: 'fill' },
    customProperties: [],
    acceptsChildren: true,
    resizableWidth: true,
    allowedChildTypes: [TEST_LIST],
    childDirection: 'row',
    defaultChildren: [
      { type: TEST_LIST, props: { title: 'Links' }, children: [{ type: TEST_BLOCK, props: { text: 'A' } }] },
      { type: TEST_LIST, props: { title: 'Rechts' }, children: [{ type: TEST_BLOCK, props: { text: 'B' } }] },
    ],
    paletteHidden: false,
  })
}
