import { describe, expect, it } from 'vitest'
import '../blocks/kanban/KanbanBlock'
import { createBlockSubtree } from '../core/blocks/blockFactory'
import { ROOT_ID, type BlockTree } from '../core/blocks/BlockData'
import { preflightMask } from './preflight'
import { failedChecks } from './validator'

describe('preflightMask - genau eine Auffangspalte', () => {
  it('blockiert einen manipulierten Altbestand mit zwei Auffangspalten', () => {
    const tree: BlockTree = {
      [ROOT_ID]: {
        id: ROOT_ID,
        type: 'root',
        props: {},
        parentId: null,
        childIds: [],
      },
    }
    const { nodes, rootId } = createBlockSubtree('kanban')
    Object.assign(tree, nodes)
    tree[rootId] = { ...tree[rootId], parentId: ROOT_ID }
    tree[ROOT_ID].childIds.push(rootId)
    const [erste, zweite] = tree[rootId].childIds
    tree[erste] = {
      ...tree[erste],
      props: { ...tree[erste].props, auffang: 'ja' },
    }
    tree[zweite] = {
      ...tree[zweite],
      props: { ...tree[zweite].props, auffang: 'ja' },
    }

    const failed = failedChecks(preflightMask(tree, []))
    expect(failed).toHaveLength(1)
    expect(failed[0].name).toBe('Kennzeichen mehrfach vergeben')
    expect(failed[0].detail).toContain('Auffangspalte')
    expect(failed[0].detail).not.toContain('auffang')
  })
})
