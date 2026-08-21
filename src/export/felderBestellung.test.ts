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

  // Die sechs Faelle darueber und darunter benutzen ALLE `kind: 'idb'` — die
  // einzige Art ohne `felderEinzeln`. Genau darum blieb bis 2026-08-21
  // unbemerkt, dass der Benutzt-Filter fuer die anderen SIEBEN Arten nie lief:
  // `felderFor` sprang vorher heraus und bestellte die ganze Feldliste der
  // Quelle. Dasselbe Muster wie der Tabellen-Bug 2026-07-24 — ein gruener
  // Test deckte einen Zweig ab, den das Produkt so nie erreichte.
  const POS_FELDER = [
    { code: '2_1', label: 'Belegart' },
    { code: '3_8', label: 'Belegnummer' },
    { code: '18_25', label: 'Artikelnummer' },
    { code: '45_60', label: 'Bezeichnung' },
    { code: '164_8', label: 'Menge' },
    { code: '246_9', label: 'Einzelpreis' },
    { code: '280_12', label: 'Gesamtpreis' },
    { code: '645_10', label: 'Satznummer' },
  ]

  const posQuelle = [{
    id: 'pos', name: 'Positionen', kind: 'belegposition' as const,
    indexField: '645_10', fields: POS_FELDER,
  }]

  const tabelleMitSpalten = (spalten: { titel: string; feld: string; art: string }[]): BlockTree => ({
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
    tab: {
      id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
      props: { source: 'pos', suche: 'nein', spalten },
    },
  })

  it('bestellt auch bei einer Einzelfeld-Art nur die benutzten Felder', () => {
    const tree = tabelleMitSpalten([
      { titel: 'Artikel', feld: '18_25', art: 'text' },
      { titel: 'Bezeichnung', feld: '45_60', art: 'text' },
    ])

    const { sevariablen } = exportMask(tree, 'Maske', posQuelle)
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      {
        INDEX_NR: 0, ALIAS: 'Positionen', ID: 'POS',
        // Der Satzschluessel steht VORNE und ist nicht verhandelbar: die
        // Laufzeit liest ihn als {PINDEX} — die Satznummer, in die eine
        // Aktionskette schreibt. Ohne ihn ginge ein PUT_RELATION aus einem
        // Zeilenklick ins Leere.
        FELDER: '645_10,18_25,45_60',
      },
    ])
  })

  it('bestellt die ganze Liste, wenn die Maske kein Feld der Quelle benutzt', () => {
    // Kein Wissen heisst NICHT „nichts bestellen": eine leere Bestellung
    // liesse SoftEngine fuer diese Quelle gar nichts liefern. Geraten wird
    // hier bewusst nicht — lieber zu viel als eine stumme leere Tabelle.
    const tree = tabelleMitSpalten([{ titel: 'Spalte 1', feld: '', art: 'text' }])

    const { sevariablen } = exportMask(tree, 'Maske', posQuelle)
    expect(JSON.parse(sevariablen).SEFILELOOP[0].FELDER)
      .toBe('2_1,3_8,18_25,45_60,164_8,246_9,280_12,645_10')
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

  it('bestellt auch die Felder einer VERKNUEPFTEN Quelle (G3)', () => {
    // Die Erfassungszeile schlaegt in genau den Quellen nach, an die ihre
    // Spalten gebunden sind. Eine Spalte auf einer verknuepften Quelle muss
    // deren Feld mitbestellen: ohne das schickte SoftEngine die Saetze nie
    // und die Zelle bliebe in der fertigen Maske leer.
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: {
        id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'pos', suche: 'nein', erfassung: 'ja',
          weitereQuellen: [{
            quelleId: 'gaben',
            keyPairs: [{ fromField: '40_4', toField: '2_4' }],
          }],
          spalten: [
            { titel: 'Artikel', feld: '11_6', art: 'text' },
            { titel: 'Menge', feld: '', art: 'zahl' },
            { titel: 'Gabe', feld: 'gaben::5_4', art: 'text' },
          ],
        },
      },
    }
    // Zwei IDB-Quellen: nur dort ist die Bestellung eine AUSWAHL von Feldern
    // (ein Stamm bestellt ohnehin alle) — hier wuerde ein Fehler sichtbar.
    const sources = [
      {
        id: 'pos', name: 'Positionen', kind: 'idb' as const, idbId: 'IDBID0002',
        fields: [
          { code: '11_6', label: 'Artikelnummer' },
          { code: '40_4', label: 'Tierart' },
          { code: '99_10', label: 'Preis' },
        ],
      },
      {
        id: 'gaben', name: 'Gaben', kind: 'idb' as const, idbId: 'IDBID0001',
        fields: [
          { code: '5_4', label: 'Kuerzel' },
          { code: '2_4', label: 'Tierart' },
          { code: '9_20', label: 'Klartext' },
        ],
      },
    ]

    // Beide Quellen stehen in der SEFILELOOP; bestellt sind das gebundene Feld
    // und die beiden Schluesselfelder der Verknuepfung — das unbenutzte
    // Preis-Feld und der Klartext nicht.
    const loops = JSON.parse(exportMask(tree, 'Maske', sources).sevariablen).SEFILELOOP
    expect(loops).toEqual([
      { INDEX_NR: 0, ALIAS: 'Positionen', ID: 'IDBID0002', FELDER: '11_6,40_4' },
      { INDEX_NR: 0, ALIAS: 'Gaben', ID: 'IDBID0001', FELDER: '5_4,2_4' },
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
