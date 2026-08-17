import { describe, expect, it } from 'vitest'

import '../blocks/formfeld/FormFeldBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { preflightMask } from './preflight'
import { registerTestBlocks, TEST_EVENT_BLOCK } from '../test/testBlocks'

registerTestBlocks()

describe('exportMask: Relationen', () => {
  it('nimmt Relationsvorlagen aus Aktionsschritten in FF_RELATIONS auf', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
      a: {
        id: 'a', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [],
        events: {
          onClick: [{
            id: 's1', type: 'RELATION', resultKey: '', relationId: 'rel-a',
            params: [{ source: 'context', value: 'VALUE' }],
            extraParams: [],
          }],
        },
      },
    }
    const relations = [{
      id: 'rel-a', name: 'Schreiben', verb: 'PUT_RELATION', nr: '0174',
      params: ['{VALUE}'], allowExtraParams: false,
    }] as const
    const { html } = exportMask(tree, 'Maske', [], relations)
    expect(html).toContain('window.FF_RELATIONS = [{"id":"rel-a"')
    expect(html).toContain('&quot;type&quot;:&quot;RELATION&quot;')
    expect(preflightMask(tree, [], relations)).toEqual([])
  })

  it('verknuepft einen Relationsparameter mit dem aktuellen Wert eines Formularfelds', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['button', 'feld-tiername'] },
      button: {
        id: 'button', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [],
        events: {
          onClick: [{
            id: 'put', type: 'RELATION', resultKey: '', relationId: 'rel-put',
            params: [{ source: 'block_value', blockId: 'feld-tiername', value: 'value' }],
            extraParams: [],
          }],
        },
      },
      'feld-tiername': {
        id: 'feld-tiername', type: 'formfeld', parentId: 'root', childIds: [],
        props: {
          fieldType: 'text', placeholder: 'Tiername', options: '',
          source: '', value: '', valueField: '', width: 240,
        },
      },
    }
    const relations = [{
      id: 'rel-put', name: 'Tiername schreiben', verb: 'PUT_RELATION', nr: '0174',
      params: ['QUELLDATEN'], allowExtraParams: false,
    }] as const
    const { html } = exportMask(tree, 'Maske', [], relations)
    expect(html).toContain('<ff-formfeld')
    expect(html).toContain('data-ff-block-id="feld-tiername"')
    expect(html).toContain('&quot;source&quot;:&quot;block_value&quot;')
    expect(html).toContain('&quot;blockId&quot;:&quot;feld-tiername&quot;')
    expect(preflightMask(tree, [], relations)).toEqual([])

    const ohneFeld: BlockTree = {
      root: { ...tree.root, childIds: ['button'] },
      button: tree.button,
    }
    expect(preflightMask(ohneFeld, [], relations).some((result) =>
      result.detail.includes('gelöschten Baustein'))).toBe(true)
  })
})
