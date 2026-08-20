import { describe, expect, it } from 'vitest'

import '../blocks/kanban/KanbanBlock'
import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { registerTestBlocks, TEST_DATA_BOX, TEST_EVENT_BLOCK } from '../test/testBlocks'

registerTestBlocks()

describe('exportMask: Datenquellen', () => {
  it('exportiert Kanban und Formularfeld mit eigenen Quellen gemeinsam', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board', 'field'] },
      board: {
        id: 'board', type: TEST_DATA_BOX, props: { source: 'termine' },
        parentId: 'root', childIds: [],
      },
      field: {
        id: 'field', type: TEST_DATA_BOX, props: { source: 'adressen' },
        parentId: 'root', childIds: [],
      },
    }
    const sources = [
      {
        id: 'termine', name: 'Termine', kind: 'idb' as const,
        idbId: 'IDBID0001', indexField: '0_10', fields: [],
      },
      {
        id: 'adressen', name: 'Adressen', kind: 'adressstamm' as const,
        fields: [{ code: '2_8', label: 'Adressnummer' }],
      },
    ]

    const { html, sevariablen } = exportMask(tree, 'Maske', sources)
    expect(html).toContain('window.FF_DATA_SOURCES = [{"id":"termine"')
    expect(html).toContain('{"id":"adressen","name":"Adressen","tableId":"ADR"')
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Termine', ID: 'IDBID0001', FELDER: '*' },
      { INDEX_NR: 0, ALIAS: 'Adressen', ID: 'ADR', FELDER: '2_8' },
    ])
  })

  it('nimmt die weiteren Datenquellen eines Bausteins in die SEFILELOOP auf', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: {
        id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'termine',
          weitereQuellen: [{
            quelleId: 'tiere',
            keyPairs: [{ fromField: '10_8', toField: '10_8' }],
          }],
          spalten: [
            { titel: 'Tiername', feld: '78_30' },
            { titel: 'Notiz', feld: 'tiere::128_350' },
          ],
          tagField: '', suche: 'nein',
        },
      },
    }
    const sources = [
      { id: 'termine', name: 'Terminplaner', kind: 'idb' as const, idbId: 'IDBID0001', indexField: '0_10', fields: [] },
      { id: 'tiere', name: 'Kundenhaustiere', kind: 'idb' as const, idbId: 'IDBID0004', fields: [] },
    ]
    const { html, sevariablen } = exportMask(tree, 'Maske', sources)

    expect(html).toContain('tiere::128_350')

    expect(html).toContain('weiterequellen=')
    expect(html).toContain('&quot;quelleId&quot;:&quot;tiere&quot;')

    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Terminplaner', ID: 'IDBID0001', FELDER: '0_10,78_30,10_8' },
      { INDEX_NR: 0, ALIAS: 'Kundenhaustiere', ID: 'IDBID0004', FELDER: '128_350,10_8' },
    ])
  })

  it('laesst eine LEERE Quellen-Liste aus dem Markup weg (Byte-Vertraeglichkeit)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: {
        id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
        props: { source: '', weitereQuellen: [], spalten: [], tagField: '', suche: 'nein', fusszeile: 'ja' },
      },
    }
    expect(exportMask(tree, 'Maske', []).html).not.toContain('weiterequellen')
  })

  it('nimmt eine nur in einer Aktionskette gelesene Quelle mit', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['knopf'] },
      knopf: {
        id: 'knopf', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [],
        events: {
          onClick: [{
            id: 's1',
            type: 'RELATION',
            resultKey: '',
            relationId: 'rel-put',
            params: [{ source: 'data_field', value: '30_10', dataSourceId: 'parameter' }],
            extraParams: [],
          }],
        },
      },
    }
    const sources = [
      { id: 'parameter', name: 'Parametertabelle', kind: 'idb' as const, idbId: 'IDBID0009', fields: [] },
    ]
    const relations = [
      { id: 'rel-put', name: 'Schreiben', verb: 'PUT_RELATION' as const, nr: '174', params: ['', '', '', '', '', ''] },
    ]
    const { html, sevariablen } = exportMask(tree, 'Maske', sources, relations)

    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Parametertabelle', ID: 'IDBID0009', FELDER: '30_10' },
    ])
    expect(html).toContain('window.FF_DATA_SOURCES = [{"id":"parameter"')
  })

  it('eine holende Quelle bestellt keine SEFILELOOP und traegt ihre Relation in FF_DATA_SOURCES', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['pos', 'belege'] },
      pos: { id: 'pos', type: TEST_DATA_BOX, props: { source: 'positionen' }, parentId: 'root', childIds: [] },
      belege: { id: 'belege', type: TEST_DATA_BOX, props: { source: 'belege' }, parentId: 'root', childIds: [] },
    }
    const sources = [
      {
        id: 'positionen', name: 'BelegPositionen', kind: 'belegposition' as const,

        kopfsatzIndex: 'BEL_0_11',
        ladeRelation: {
          nr: '69', geberQuelleId: 'belege',
          belegartFeld: '2_1', belegnummerFeld: '3_8',
          jahrFeld: '0_1', archivFeld: '1_1',
          endeFelder: ['11_6', '18_25'],
        },
        fields: [{ code: '18_25', label: 'Artikelnummer' }],
      },
      {
        id: 'belege', name: 'Belege', kind: 'beleg' as const,
        fields: [{ code: '3_8', label: 'Belegnummer' }],
      },
    ]
    const { html, sevariablen } = exportMask(tree, 'Maske', sources)
    const json = JSON.parse(sevariablen)
    expect(json.SEFILELOOP).toEqual([

      { INDEX_NR: 0, ALIAS: 'Belege', ID: 'BEL', FELDER: '3_8,2_1,0_1,1_1' },
    ])
    expect(json.VAR).toBeUndefined()
    expect(html).toContain('"ladeRelation":{"nr":"69","geberQuelleId":"belege"')

    expect(html).toContain('"endeFelder":["11_6","18_25"],"zusatzFelder":[]')
  })

  it('gibt der Hol-Relation die benutzten Felder hinter dem 255er-Schnitt mit', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['pos', 'knopf'] },
      pos: { id: 'pos', type: TEST_DATA_BOX, props: { source: 'positionen' }, parentId: 'root', childIds: [] },
      knopf: {
        id: 'knopf', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [],
        events: {
          onClick: [{
            id: 's1',
            type: 'RELATION',
            resultKey: '',
            relationId: 'rel-put',
            params: [

              { source: 'data_field', value: '280_12', dataSourceId: 'positionen' },
              { source: 'data_field', value: '18_25', dataSourceId: 'positionen' },
            ],
            extraParams: [],
          }],
        },
      },
    }
    const sources = [
      {
        id: 'positionen', name: 'BelegPositionen', kind: 'belegposition' as const,
        ladeRelation: {
          nr: '69', geberQuelleId: 'belege',
          belegartFeld: '2_1', belegnummerFeld: '3_8',
          jahrFeld: '0_1', archivFeld: '1_1',
          endeFelder: ['11_6', '18_25'],
        },
        fields: [],
      },
    ]
    const relations = [
      { id: 'rel-put', name: 'Schreiben', verb: 'PUT_RELATION' as const, nr: '82', params: ['', ''] },
    ]
    const { html } = exportMask(tree, 'Maske', sources, relations)
    expect(html).toContain('"zusatzFelder":["280_12"]')
  })

  it('nach einem Art-Wechsel wirkt eine liegengebliebene Hol-Relation nicht mehr', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
      a: { id: 'a', type: TEST_DATA_BOX, props: { source: 'q' }, parentId: 'root', childIds: [] },
    }
    const sources = [
      {
        id: 'q', name: 'Termine', kind: 'idb' as const, idbId: 'IDBID0001',
        ladeRelation: {
          nr: '69', geberQuelleId: 'egal', belegartFeld: '2_1',
          belegnummerFeld: '3_8', jahrFeld: '', archivFeld: '', endeFelder: ['11_6'],
        },
        fields: [],
      },
    ]
    const { html, sevariablen } = exportMask(tree, 'Maske', sources)
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Termine', ID: 'IDBID0001', FELDER: '*' },
    ])

    const quellenZeile = /window\.FF_DATA_SOURCES = .*/.exec(html)?.[0] ?? ''
    expect(quellenZeile).toContain('"id":"q"')
    expect(quellenZeile).not.toContain('ladeRelation')

    expect(html).not.toContain('"ladeRelation":')
  })

  it('schreibt eine ERP-Abfrage in den ERPAPICALL-Block, nicht in die SEFILELOOP', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['lfa', 'idb'] },
      lfa: {
        id: 'lfa', type: TEST_DATA_BOX, props: { source: 'lieferadressen' },
        parentId: 'root', childIds: [],
      },
      idb: {
        id: 'idb', type: TEST_DATA_BOX, props: { source: 'termine' },
        parentId: 'root', childIds: [],
      },
    }
    const sources = [
      {
        id: 'lieferadressen', name: 'Haustiere', kind: 'erpabfrage' as const,
        idbId: 'LIEFERADRESSE.GET', feldVorsatz: 'LFA_',
        fields: [
          { code: 'LFA_2_8', label: 'Adressnummer' },
          { code: 'LFA_400_30', label: 'Name' },
        ],
      },
      {
        id: 'termine', name: 'Termine', kind: 'idb' as const, idbId: 'IDBID0021', fields: [],
      },
    ]

    const sev = JSON.parse(exportMask(tree, 'Maske', sources).sevariablen)
    expect(sev.ERPAPICALL).toEqual([
      { ID: 'LIEFERADRESSE.GET', ALIAS: 'Haustiere', FELDER: 'LFA_2_8,LFA_400_30' },
    ])
    expect(sev.SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Termine', ID: 'IDBID0021', FELDER: '*' },
    ])
  })

  it('bestellt ein DataSet im DATASET-Block, mit Spaltennamen als Feldern', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['liste'] },
      liste: {
        id: 'liste', type: TEST_DATA_BOX, props: { source: 'chargen' },
        parentId: 'root', childIds: [],
      },
    }
    const sources = [{
      id: 'chargen', name: 'Chargen', kind: 'dataset' as const, idbId: 'ID0001',
      fields: [
        { code: 'Chargennummer', label: 'Chargennummer' },
        { code: 'Lagerbestand', label: 'Bestand' },
      ],
    }]

    const sev = JSON.parse(exportMask(tree, 'Maske', sources).sevariablen)
    // Die Bestellung landet NICHT in der SEFILELOOP: CHA & Co. gibt es dort
    // nicht, genau deshalb existiert der DATASET-Weg. Ohne SEFILELOOP-Quelle
    // faellt der Block ganz weg — leere Bloecke schreibt keine echte Maske.
    expect('SEFILELOOP' in sev).toBe(false)
    // FELDER bleibt '*': die Spaltenauswahl trifft die DataSet-Definition in
    // SoftEngine, und die gelieferten Zeilen tragen andere Schluessel als die
    // Spaltennamen (s. sevariablen.ts).
    expect(sev.DATASET).toEqual([
      { ID: 'ID0001', ALIAS: 'Chargen', FELDER: '*' },
    ])
  })

  it('laesst den DATASET-Block weg, solange keine Quelle ihn braucht', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['b'] },
      b: {
        id: 'b', type: TEST_DATA_BOX, props: { source: 'termine' },
        parentId: 'root', childIds: [],
      },
    }
    const sources = [{
      id: 'termine', name: 'Termine', kind: 'idb' as const, idbId: 'IDBID0001', fields: [],
    }]

    const sev = JSON.parse(exportMask(tree, 'Maske', sources).sevariablen)
    expect('DATASET' in sev).toBe(false)
  })
})
