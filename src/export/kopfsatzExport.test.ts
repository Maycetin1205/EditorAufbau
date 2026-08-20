import { describe, expect, it } from 'vitest'

import '../blocks/kanban/KanbanBlock'
import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { registerTestBlocks, TEST_DATA_BOX } from '../test/testBlocks'

registerTestBlocks()

describe('exportMask: Kopfsatz und VAR', () => {
  it('schreibt den Kopfsatz in die SEFILELOOP — und nur, wo die Art ihn fuehrt', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['pos', 'termine'] },
      pos: {
        id: 'pos', type: TEST_DATA_BOX, props: { source: 'positionen' },
        parentId: 'root', childIds: [],
      },
      termine: {
        id: 'termine', type: TEST_DATA_BOX, props: { source: 'termine' },
        parentId: 'root', childIds: [],
      },
    }
    const sources = [
      {
        id: 'positionen', name: 'Belegpositionen', kind: 'datei' as const, idbId: 'POS',
        kopfsatzIndex: 'BEL_0_11',
        fields: [
          { code: '18_25', label: 'Artikelnummer' },
          { code: '45_60', label: 'Bezeichnung' },
        ],
      },
      {
        id: 'termine', name: 'Termine', kind: 'idb' as const, idbId: 'IDBID0001',
        kopfsatzIndex: 'BEL_0_11', fields: [],
      },
    ]

    const { sevariablen } = exportMask(tree, 'Maske', sources)

    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Termine', ID: 'IDBID0001', FELDER: '*' },
      {
        INDEX_NR: 0, ALIAS: 'Belegpositionen', ID: 'POS',
        KOPFSATZ_INDEX: 'BEL_0_11', FELDER: '18_25,45_60',
      },
    ])
  })

  it('schreibt Kopfsatz-Quellen zuletzt, egal in welcher Reihenfolge angelegt', () => {
    const bauBaum = (ersteQuelle: string, zweiteQuelle: string): BlockTree => ({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'b', 'c'] },
      a: { id: 'a', type: TEST_DATA_BOX, props: { source: ersteQuelle }, parentId: 'root', childIds: [] },
      b: { id: 'b', type: TEST_DATA_BOX, props: { source: zweiteQuelle }, parentId: 'root', childIds: [] },
      c: { id: 'c', type: TEST_DATA_BOX, props: { source: 'adressen' }, parentId: 'root', childIds: [] },
    })
    const sources = [
      {
        id: 'positionen', name: 'Belegpositionen', kind: 'belegposition' as const,
        kopfsatzIndex: 'BEL_0_11', fields: [{ code: '18_25', label: 'Artikelnummer' }],
      },
      { id: 'termine', name: 'Termine', kind: 'idb' as const, idbId: 'IDBID0001', fields: [] },
      { id: 'adressen', name: 'Adressen', kind: 'adressstamm' as const, fields: [{ code: '2_8', label: 'Nr' }] },
    ]
    const aliasse = (baum: BlockTree): string[] =>
      JSON.parse(exportMask(baum, 'Maske', sources).sevariablen)
        .SEFILELOOP.map((s: { ALIAS: string }) => s.ALIAS)

    expect(aliasse(bauBaum('positionen', 'termine')))
      .toEqual(['Termine', 'Adressen', 'Belegpositionen'])

    expect(aliasse(bauBaum('termine', 'positionen')))
      .toEqual(['Termine', 'Adressen', 'Belegpositionen'])
  })

  it('bestellt zu jedem Kopfsatz seine Variable im VAR-Abschnitt', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['pos', 'ser'] },
      pos: {
        id: 'pos', type: TEST_DATA_BOX, props: { source: 'positionen' },
        parentId: 'root', childIds: [],
      },
      ser: {
        id: 'ser', type: TEST_DATA_BOX, props: { source: 'serien' },
        parentId: 'root', childIds: [],
      },
    }
    const sources = [
      {
        id: 'positionen', name: 'Belegpositionen', kind: 'belegposition' as const,
        kopfsatzIndex: 'BEL_0_11',
        fields: [{ code: '18_25', label: 'Artikelnummer' }],
      },
      {
        id: 'serien', name: 'Seriennummern', kind: 'datei' as const, idbId: 'SERPOS',
        kopfsatzIndex: 'BEL_0_11',
        fields: [{ code: '43_1', label: 'Nummer' }],
      },
    ]

    const { sevariablen } = exportMask(tree, 'Maske', sources)
    expect(JSON.parse(sevariablen).VAR).toEqual([{ ID: 'BEL', FELDER: '0_11' }])
  })

  it('laesst VAR ganz weg, wo keine Quelle einen Kopfsatz hat', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['termine'] },
      termine: {
        id: 'termine', type: TEST_DATA_BOX, props: { source: 'termine' },
        parentId: 'root', childIds: [],
      },
    }
    const sources = [
      { id: 'termine', name: 'Termine', kind: 'idb' as const, idbId: 'IDBID0001', fields: [] },
    ]

    const { sevariablen } = exportMask(tree, 'Maske', sources)
    expect(Object.keys(JSON.parse(sevariablen))).toEqual(['SEFILELOOP'])
  })

  it.todo('bestellt den offenen Satz im VAR-Abschnitt, die Liste bleibt in der SEFILELOOP', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['kopf', 'pos'] },
      kopf: {
        id: 'kopf', type: TEST_DATA_BOX, props: { source: 'beleg' },
        parentId: 'root', childIds: [],
      },
      pos: {
        id: 'pos', type: TEST_DATA_BOX, props: { source: 'positionen' },
        parentId: 'root', childIds: [],
      },
    }
    const sources = [
      {
        id: 'beleg', name: 'Offener Beleg', kind: 'beleg' as const,
        lieferung: 'offenerSatz' as const,
        fields: [{ code: '0_11', label: 'Satzschlüssel' }, { code: '3_8', label: 'Belegnummer' }],
      },
      {
        id: 'positionen', name: 'Belegpositionen', kind: 'belegposition' as const,
        kopfsatzIndex: 'BEL_0_11',
        fields: [{ code: '18_25', label: 'Artikelnummer' }],
      },
    ]

    const { html, sevariablen } = exportMask(tree, 'Maske', sources)
    expect(JSON.parse(sevariablen)).toEqual({
      VAR: [{ ID: 'BEL', FELDER: '0_11,3_8' }],
      SEFILELOOP: [
        {
          INDEX_NR: 0, ALIAS: 'Belegpositionen', ID: 'POS',
          KOPFSATZ_INDEX: 'BEL_0_11', FELDER: '18_25',
        },
      ],
    })

    expect(html).toContain('"tableId":"BEL","indexField":"","offenerSatz":true')

    expect(html).not.toContain('"ALIAS":"Belegpositionen","offenerSatz"')
  })
})
