// SEvariablen-Tests (Kap. 5.1 Daten-Anbindung)
// Prueft den Weg Datenquelle -> Export: SEFILELOOP entsteht aus den im Baum
// angehaengten Quellen (DIESELBE Quelle wie das HTML, Export-Grundsatz a),
// dedupliziert, deterministisch, ASCII-sicher. Dazu: die source-Prop
// ueberlebt die Persistenz (normalizeProps kennt sie als defaultProp).
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { beforeEach, describe, expect, it } from 'vitest'
import '../blocks/kanban/KanbanBlock' // Side-Effect: registriert kanban (+ spalte + card)
import { createBlockSubtree } from '../core/blocks/blockFactory'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { ROOT_ID, type BlockTree } from '../core/blocks/BlockData'
import type { DataSource } from '../core/data/dataSources'
import { Editor } from '../state/Editor'
import { exportMask } from './exportMask'
import { failedChecks, validateMaskHtml } from './validator'

// Baum mit n Boards; sources[i] wird als source-Prop des i-ten Boards gesetzt.
function boardsTree(sources: string[]): BlockTree {
  const tree: BlockTree = {
    [ROOT_ID]: { id: ROOT_ID, type: 'root', props: {}, parentId: null, childIds: [] },
  }
  for (const source of sources) {
    const { nodes, rootId } = createBlockSubtree('kanban')
    nodes[rootId] = {
      ...nodes[rootId],
      parentId: ROOT_ID,
      props: { ...nodes[rootId].props, source },
    }
    Object.assign(tree, nodes)
    tree[ROOT_ID].childIds.push(rootId)
  }
  return tree
}

describe('Registry-Flag acceptsDataSource (Kap. 5.1)', () => {
  it('Kanban nimmt eine Datenquelle an, Karte/Spalte nicht', () => {
    expect(getBlockDefinition('kanban')?.acceptsDataSource).toBe(true)
    expect(getBlockDefinition('kanban-spalte')?.acceptsDataSource).toBeUndefined()
    expect(getBlockDefinition('card')?.acceptsDataSource).toBeUndefined()
  })

  it('source ist Teil der Kanban-Defaults (Persistenz kennt sie)', () => {
    expect(getBlockDefinition('kanban')?.defaultProps.source).toBe('')
  })
})

describe('SEvariablen aus dem Baum', () => {
  it('ohne angehaengte Quelle bleibt der SEFILELOOP leer', () => {
    const { sevariablen } = exportMask(boardsTree(['']))
    expect(JSON.parse(sevariablen)).toEqual({ SEFILELOOP: [], ERPAPICALL: [] })
  })

  it('angehaengte Quelle wird zum SEFILELOOP-Eintrag (Vorbild praxis-kanban)', () => {
    const { html, sevariablen } = exportMask(boardsTree(['terminplaner']))
    expect(JSON.parse(sevariablen)).toEqual({
      SEFILELOOP: [{ INDEX_NR: 0, ALIAS: 'Terminplaner', ID: 'IDBID0001', FELDER: '*' }],
      ERPAPICALL: [],
    })
    // Der Technikwert reist als Attribut mit (Runtime braucht ihn ab 5.3).
    expect(html).toContain('<ff-kanban source="terminplaner"')
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('dedupliziert gleiche Quellen, behaelt Baum-Reihenfolge', () => {
    const { sevariablen } = exportMask(
      boardsTree(['kundenhaustiere', 'terminplaner', 'kundenhaustiere']),
    )
    const loop = (JSON.parse(sevariablen) as { SEFILELOOP: { ALIAS: string }[] }).SEFILELOOP
    expect(loop.map((e) => e.ALIAS)).toEqual(['Kundenhaustiere', 'Terminplaner'])
  })

  it('unbekannte Vorlagen-ids werden uebersprungen', () => {
    const { sevariablen } = exportMask(boardsTree(['geloeschte-quelle']))
    expect(JSON.parse(sevariablen)).toEqual({ SEFILELOOP: [], ERPAPICALL: [] })
  })

  it('ist deterministisch: gleicher Baum -> identische JSON', () => {
    const tree = boardsTree(['terminplaner', 'kundenhaustiere'])
    expect(exportMask(tree).sevariablen).toBe(exportMask(tree).sevariablen)
  })

  it('Stammtabellen-Quelle: feste ID + explizite FELDER-Liste (Kap. 5.4, Vorbild behandlung-umbau)', () => {
    const adr: DataSource = {
      id: 'adressen',
      name: 'Adressen',
      kind: 'adressstamm',
      fields: [
        { code: '2_8', label: 'Nummer', sample: 'K2' },
        { code: '3292_30', label: 'Vorname', sample: 'Lisa' },
      ],
    }
    const { sevariablen } = exportMask(boardsTree(['adressen']), 'Maske', [adr])
    expect(JSON.parse(sevariablen)).toEqual({
      SEFILELOOP: [{ INDEX_NR: 0, ALIAS: 'Adressen', ID: 'ADR', FELDER: '2_8,3292_30' }],
      ERPAPICALL: [],
    })
  })
})

// Kap. 5.4: die Vorlagen sind benutzerdefiniert (localStorage des Editors) —
// die exportierte Maske muss ihre Quellen-Definitionen deshalb SELBST tragen
// (var FF_DATA_SOURCES, gelesen von seRuntime). DIESELBE collectDataSources-
// Quelle wie die SEFILELOOP (Export-Grundsatz a).
describe('Quellen-Definitionen reisen in der Maske (FF_DATA_SOURCES)', () => {
  it('benutzte Quelle wird mit name/tableId/indexField eingebettet', () => {
    const { html } = exportMask(boardsTree(['terminplaner']))
    expect(html).toContain(
      'var FF_DATA_SOURCES = '
      + '[{"id":"terminplaner","name":"Terminplaner","tableId":"IDBID0001","indexField":"0_10"}];',
    )
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('ohne angehaengte Quelle ist die Liste leer', () => {
    const { html } = exportMask(boardsTree(['']))
    expect(html).toContain('var FF_DATA_SOURCES = [];')
  })

  it('Nicht-ASCII im Anzeigenamen wird \\uXXXX-escaped (ASCII-Regel)', () => {
    const quelle: DataSource = {
      id: 'q',
      name: 'Gerätestamm',
      kind: 'idb',
      idbId: 'IDBID0009',
      fields: [],
    }
    const { html } = exportMask(boardsTree(['q']), 'Maske', [quelle])
    expect(html).toContain('"name":"Ger\\u00E4testamm"')
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })
})

describe('source-Prop ueberlebt die Persistenz', () => {
  const KEY = 'aufbau_editor_mvp_v1'
  beforeEach(() => localStorage.clear())

  it('angehaengte Quelle ist nach dem Neuladen noch da', () => {
    localStorage.setItem(KEY, JSON.stringify({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['k'] },
        k: { id: 'k', type: 'kanban', props: { source: 'terminplaner' }, parentId: 'root', childIds: [] },
      },
      selectedId: null,
    }))
    const ed = new Editor()
    expect(ed.getNode('k')?.props.source).toBe('terminplaner')
  })
})
