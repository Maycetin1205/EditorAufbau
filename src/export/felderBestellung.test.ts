import { describe, expect, it } from 'vitest'

import '../blocks/kanban/KanbanBlock'
import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { registerTestBlocks, TEST_EVENT_BLOCK } from '../test/testBlocks'

registerTestBlocks()

describe('exportMask: FELDER-Bestellung', () => {
  it('bestellt bei einer IDB-Quelle nur die benutzten Felder', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board', 'tab'] },
      board: {
        id: 'board', type: 'kanban', parentId: 'root', childIds: ['sp'],

        props: { source: 'termine', statusField: '20_10', tagField: '50_10' },
      },
      sp: { id: 'sp', type: 'kanban-spalte', props: { heading: 'Offen' }, parentId: 'board', childIds: ['karte'] },
      karte: {
        id: 'karte', type: 'card', parentId: 'sp', childIds: [],

        props: { headingField: '40_20', timeField: '10_5' },
      },
      tab: {
        id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'termine', suche: 'nein',
          spalten: [

            { titel: 'Tier', feld: '30_10', art: 'bild', felder: { bild: '60_10', unter: '70_30' } },
          ],
        },
      },
    }
    const sources = [
      {
        id: 'termine', name: 'Terminplaner', kind: 'idb' as const,
        idbId: 'IDBID0001', indexField: '0_10',
        fields: [
          { code: '40_20', label: 'Titel' },
          { code: '10_5', label: 'Zeit' },
          { code: '20_10', label: 'Status' },
          { code: '30_10', label: 'Tier' },
          { code: '50_10', label: 'Datum' },
          { code: '60_10', label: 'Art' },
          { code: '70_30', label: 'Rasse' },

          { code: '80_60', label: 'Notiz' },
          { code: '90_12', label: 'Preis' },
          { code: '100_8', label: 'Bediener' },
        ],
      },
    ]

    const { sevariablen } = exportMask(tree, 'Maske', sources)
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      {
        INDEX_NR: 0, ALIAS: 'Terminplaner', ID: 'IDBID0001',

        FELDER: '0_10,40_20,10_5,20_10,30_10,50_10,60_10,70_30',
      },
    ])
  })

  it('zaehlt die Felder der Auswahl-Folge und der gewaehlten Zeile mit', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['geber', 'folger', 'knopf'] },
      geber: {
        id: 'geber', type: 'tabelle', parentId: 'root', childIds: [],
        props: { source: 'kunden', suche: 'nein', spalten: [{ titel: 'Name', feld: '20_30' }] },
      },
      folger: {
        id: 'folger', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'belege', suche: 'nein', spalten: [{ titel: 'Nummer', feld: '30_8' }],
          folgtAuswahl: [{ geberId: 'geber', keyPairs: [{ fromField: '10_8', toField: '11_8' }] }],
        },
      },
      knopf: {
        id: 'knopf', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [],
        events: {
          onClick: [{
            id: 's1', type: 'RELATION', resultKey: '', relationId: 'rel-put',
            params: [{ source: 'gewaehlte_zeile', value: '0_10', blockId: 'geber' }],
            extraParams: [],
          }],
        },
      },
    }
    const sources = [
      {
        id: 'kunden', name: 'Kunden', kind: 'idb' as const, idbId: 'IDBID0001',
        fields: [
          { code: '20_30', label: 'Name' },
          { code: '10_8', label: 'Adressnummer' },
          { code: '0_10', label: 'Satznummer' },
          { code: '40_60', label: 'Bemerkung' },
        ],
      },
      {
        id: 'belege', name: 'Belege', kind: 'idb' as const, idbId: 'IDBID0002',
        fields: [
          { code: '30_8', label: 'Nummer' },
          { code: '11_8', label: 'Adressnummer' },
          { code: '55_12', label: 'Betrag' },
        ],
      },
    ]
    const relations = [
      { id: 'rel-put', name: 'Schreiben', verb: 'PUT_RELATION' as const, nr: '174', params: [''] },
    ]

    const { sevariablen } = exportMask(tree, 'Maske', sources, relations)
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([

      { INDEX_NR: 0, ALIAS: 'Kunden', ID: 'IDBID0001', FELDER: '20_30,10_8,0_10' },

      { INDEX_NR: 0, ALIAS: 'Belege', ID: 'IDBID0002', FELDER: '30_8,11_8' },
    ])
  })

  it('bestellt die Felder der Nachschlage-Quelle', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['feld'] },
      feld: {
        id: 'feld', type: 'formfeld', parentId: 'root', childIds: [],
        props: {
          label: 'Kunde', fieldType: 'nachschlagen', nachschlagQuelle: 'kunden',
          speicherFeld: '10_8',
          nachschlagSpalten: [
            { titel: 'Name', feld: '20_30', art: 'text' },
            { titel: 'Adressnummer', feld: '10_8', art: 'text' },
          ],

          valueField: '40_60',
        },
      },
    }
    const sources = [
      {
        id: 'kunden', name: 'Kunden', kind: 'idb' as const, idbId: 'IDBID0001',
        fields: [
          { code: '20_30', label: 'Name' },
          { code: '10_8', label: 'Adressnummer' },
          { code: '40_60', label: 'Bemerkung' },
        ],
      },
    ]

    const { sevariablen } = exportMask(tree, 'Maske', sources)
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Kunden', ID: 'IDBID0001', FELDER: '20_30,10_8' },
    ])
  })

  it('bleibt bei "*", wo ein benutztes Feld kein pos_len ist', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: {
        id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'termine', suche: 'nein',
          spalten: [{ titel: 'Titel', feld: '40_20' }, { titel: 'Name', feld: 'TFELD_Name' }],
        },
      },
    }
    const sources = [
      {
        id: 'termine', name: 'Terminplaner', kind: 'idb' as const, idbId: 'IDBID0001',
        fields: [
          { code: '40_20', label: 'Titel' },
          { code: 'TFELD_Name', label: 'Name' },
        ],
      },
    ]

    const { sevariablen } = exportMask(tree, 'Maske', sources)
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Terminplaner', ID: 'IDBID0001', FELDER: '*' },
    ])
  })
})
