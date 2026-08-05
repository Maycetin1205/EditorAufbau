// Export-Tests: DATENQUELLEN
// Was von den Quellen eines Bausteins im Export ankommt: die FF_DATA_SOURCES
// fuer die Laufzeit und die SEFILELOOP fuer SoftEngine. Beides scheitert
// STILL, wenn es fehlt — die Maske laedt sauber und bleibt leer.
//
// Eigene Datei seit 2026-07-28 (500-Zeilen-Deckel, wie preflight.test.ts
// vorher): export.test.ts prueft die Byte-Seite, hier steht die Datenseite.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
// Side-Effect-Imports: registrieren die echten Bausteine der Faelle.
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

  // --- Mehrere Datenquellen an einem Baustein (2026-07-28) ---------------
  //
  // Der Fall des Nutzers: eine Tabelle auf dem Terminplaner, eine Spalte holt
  // die Notiz aus Kundenhaustieren. Zwei Dinge muessen dafuer im Export
  // stimmen, und beide scheitern STILL, wenn sie fehlen:
  //   1. die qualifizierte Bindung reist unveraendert als Attribut mit,
  //   2. die zweite Quelle steht in der SEFILELOOP — sonst schickt SoftEngine
  //      ihre Daten nie und die Spalte bleibt in der fertigen Maske leer.
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

    // 1. Die Vorsilbe reist unveraendert mit (im JSON-Attribut der Spalten).
    expect(html).toContain('tiere::128_350')
    // Und die Verbindungsregel selbst, damit die Laufzeit die Partnerzeile findet.
    expect(html).toContain('weiterequellen=')
    expect(html).toContain('&quot;quelleId&quot;:&quot;tiere&quot;')

    // 2. BEIDE Quellen in der SEFILELOOP, erste zuerst (deterministisch).
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Terminplaner', ID: 'IDBID0001', FELDER: '*' },
      { INDEX_NR: 0, ALIAS: 'Kundenhaustiere', ID: 'IDBID0004', FELDER: '*' },
    ])
  })

  it('laesst eine LEERE Quellen-Liste aus dem Markup weg (Byte-Vertraeglichkeit)', () => {
    // Jeder Baustein mit Datenquelle traegt die neue Prop. Wuerde sie als
    // weiterequellen="[]" mitexportiert, aenderte sich JEDE bestehende Maske —
    // deshalb reist eine leere Liste nicht mit. Beweis nebenan: der
    // Referenzabzug bleibt im Markup unveraendert.
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: {
        id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
        props: { source: '', weitereQuellen: [], spalten: [], tagField: '', suche: 'nein', fusszeile: 'ja' },
      },
    }
    expect(exportMask(tree, 'Maske', []).html).not.toContain('weiterequellen')
  })

  // Eine Quelle, die NUR ein Ketten-Parameter liest („Feld einer Datenquelle").
  // Der Waehler in der Steuerung bietet die ganze Bibliothek an — so eine
  // Quelle haengt an keinem Baustein und fiel bis 2026-08-06 aus BEIDEN
  // Ausgaengen: kein SEFILELOOP (SoftEngine schickte ihre Daten nie) und kein
  // FF_DATA_SOURCES (die Laufzeit fand die id nicht). Der Parameter ging als
  // LEERER String hinaus — ein PUT schrieb Leere, ein GET suchte nach nichts.
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
      { INDEX_NR: 0, ALIAS: 'Parametertabelle', ID: 'IDBID0009', FELDER: '*' },
    ])
    expect(html).toContain('window.FF_DATA_SOURCES = [{"id":"parameter"')
  })
})
