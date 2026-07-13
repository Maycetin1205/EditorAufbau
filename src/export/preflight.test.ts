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

describe('preflightMask — Z2: unvollstaendige Aktionsschritte blockieren den Export', () => {
  // Kette am Board-Knoten anbringen (Ereignis onCardClick aus der Registry).
  function boardTreeMitKette(toolNr: string): BlockTree {
    const tree = boardTree('terminplaner')
    const boardId = tree[ROOT_ID].childIds[0]
    tree[boardId] = {
      ...tree[boardId],
      events: {
        onCardClick: [
          { id: 's1', type: 'START_TOOL', resultKey: '', toolNr, toolParams: [] },
        ],
      },
    }
    return tree
  }

  it('vollstaendiger Schritt ist kein Fehler', () => {
    expect(failedChecks(preflightMask(boardTreeMitKette('3003'), LIB))).toEqual([])
  })

  it('"Werkzeug starten" ohne Nummer blockiert mit verstaendlicher Meldung (Klarnamen)', () => {
    const failed = failedChecks(preflightMask(boardTreeMitKette(''), LIB))
    expect(failed).toHaveLength(1)
    expect(failed[0].name).toBe('Aktion unvollstaendig')
    expect(failed[0].detail).toContain('Kanban')
    expect(failed[0].detail).toContain('Karte angeklickt')
    expect(failed[0].detail).toContain('Werkzeug-Nummer')
    // Ereignis-Technikwerte erscheinen NICHT in der Meldung; der Schritt
    // erscheint mit vollem Klarnamen (SE-Kürzel in Klammern gehört seit der
    // Wortlaut-Runde V1 BEWUSST dazu, Muster „Lesen (GET)").
    expect(failed[0].detail).not.toContain('onCardClick')
    expect(failed[0].detail).toContain('Werkzeug starten (START_TOOL)')
  })
})
