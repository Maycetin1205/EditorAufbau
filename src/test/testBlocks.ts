import { registerBlockType } from '../core/blocks/blockRegistry'
import { FLOW_DEFAULTS } from '../core/blocks/flowLayout'

let registered = false

export const TEST_BLOCK = 't-block'
export const TEST_BOX = 't-box'

export const TEST_STRICT_BOX = 't-strict-box'

export const TEST_BOARD = 't-board'

export const TEST_DATA_BOX = 't-daten-box'

export const TEST_EVENT_BLOCK = 't-event-block'

export const TEST_FLAG_BLOCK = 't-flag-block'

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
    resizableHeight: false,
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
    resizableHeight: false,
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
    resizableHeight: false,
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
    resizableHeight: false,
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
    resizableHeight: false,
    acceptsDataSource: true,
  })
  registerBlockType({
    type: TEST_EVENT_BLOCK,
    tagName: 'ff-t-event-block',
    displayName: 'Testereignisblock',
    category: 'anzeige',
    defaultProps: { ...FLOW_DEFAULTS },
    customProperties: [],
    acceptsChildren: false,
    resizableWidth: true,
    resizableHeight: false,
    blockEvents: [
      { key: 'onClick', name: 'Klick' },
      { key: 'onPing', name: 'Angepingt' },
    ],
  })
  registerBlockType({
    type: TEST_FLAG_BLOCK,
    tagName: 'ff-t-flag-block',
    displayName: 'Testkennzeichenblock',
    category: 'anzeige',
    defaultProps: { ...FLOW_DEFAULTS, aktiv: 'nein', notiz: '' },
    customProperties: [
      {
        attributeName: 'aktiv',
        name: 'Aktiv',
        description: 'Exklusives Testkennzeichen.',        kind: 'select',
        options: [
          { value: 'nein', label: 'Nein' },
          { value: 'ja', label: 'Ja' },
        ],
        exclusiveAmongSiblings: true,
      },
    ],
    acceptsChildren: false,
    resizableWidth: true,
    resizableHeight: false,
  })
}
