// Preflight-Tests (Stabilisierung S1a)
// Die semantische Export-Vorpruefung blockiert den Export, wenn ein Block auf
// eine geloeschte/unbekannte Datenquelle zeigt — statt sie still zu ueber-
// springen (Nordstern). LEITPLANKE: Tests niemals loeschen/abschwaechen.

import { describe, expect, it } from 'vitest'
import '../blocks/kanban/KanbanBlock' // Side-Effect: registriert kanban (+ spalte + card)
import { createBlockSubtree } from '../core/blocks/blockFactory'
import { ROOT_ID, type BlockTree } from '../core/blocks/BlockData'
import type { DataSource } from '../core/data/dataSources'
import { preflightMask } from './preflight'
import { failedChecks } from './validator'

// Baum mit einem Kanban-Board, dessen source-Prop gesetzt wird.
function boardTree(source: string): BlockTree {
  const tree: BlockTree = {
    [ROOT_ID]: { id: ROOT_ID, type: 'root', props: {}, parentId: null, childIds: [] },
  }
  const { nodes, rootId } = createBlockSubtree('kanban')
  nodes[rootId] = {
    ...nodes[rootId],
    parentId: ROOT_ID,
    props: { ...nodes[rootId].props, source },
  }
  Object.assign(tree, nodes)
  tree[ROOT_ID].childIds.push(rootId)
  return tree
}

const LIB: DataSource[] = [
  { id: 'terminplaner', name: 'Terminplaner', kind: 'idb', idbId: 'IDBID0001', fields: [] },
]

describe('preflightMask — S1a: geloeschte Datenquelle blockiert den Export', () => {
  it('keine Quelle (leerer source) ist kein Fehler', () => {
    expect(failedChecks(preflightMask(boardTree(''), LIB))).toEqual([])
  })

  it('vorhandene Quelle ist kein Fehler', () => {
    expect(failedChecks(preflightMask(boardTree('terminplaner'), LIB))).toEqual([])
  })

  it('unbekannte/geloeschte Quelle ist genau ein Fehler', () => {
    const failed = failedChecks(preflightMask(boardTree('geloescht'), LIB))
    expect(failed).toHaveLength(1)
    expect(failed[0].name).toBe('Datenquelle fehlt')
  })
})
