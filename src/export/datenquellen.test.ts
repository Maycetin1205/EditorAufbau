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
    // Und beide bestellen seit S5.1 explizit — hier zeigt sich, dass BEIDE
    // Seiten der Schluesselregel mitbestellt werden ('10_8' in der ersten UND
    // in der weiteren Quelle). Fehlte eine, faende die Laufzeit keine
    // Partnerzeile und die Fremdspalte bliebe still leer.
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Terminplaner', ID: 'IDBID0001', FELDER: '0_10,78_30,10_8' },
      { INDEX_NR: 0, ALIAS: 'Kundenhaustiere', ID: 'IDBID0004', FELDER: '128_350,10_8' },
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

    // Seit S5.1 bestellt sie genau das Feld, das der Parameter liest — der
    // Ketten-Weg zaehlt also mit. Ginge er hier verloren, schickte SoftEngine
    // das Feld nie und der PUT schriebe wieder Leere.
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Parametertabelle', ID: 'IDBID0009', FELDER: '30_10' },
    ])
    expect(html).toContain('window.FF_DATA_SOURCES = [{"id":"parameter"')
  })

  // --- Zeilen per Relation holen (Welle R, 2026-08-11) ---------------------
  //
  // Belegt in den Echttests des Nutzers (Relation 69): eine HOLENDE Quelle
  // bestellt bei SoftEngine NICHTS — ihr SEFILELOOP-Eintrag entfaellt samt
  // Kopfsatz und VAR, und die Hol-Relation reist als Daten in
  // FF_DATA_SOURCES (die Laufzeit dazu ist R2). Beides faellt sonst STILL
  // aus: ein liegengebliebener POS-Loop laesst die ganze SEFILELOOP-Liste
  // scheitern (Reihenfolge-Kontrakt), und ohne die Daten am Global koennte
  // die Laufzeit nie holen.
  it('eine holende Quelle bestellt keine SEFILELOOP und traegt ihre Relation in FF_DATA_SOURCES', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['pos', 'belege'] },
      pos: { id: 'pos', type: TEST_DATA_BOX, props: { source: 'positionen' }, parentId: 'root', childIds: [] },
      belege: { id: 'belege', type: TEST_DATA_BOX, props: { source: 'belege' }, parentId: 'root', childIds: [] },
    }
    const sources = [
      {
        id: 'positionen', name: 'BelegPositionen', kind: 'belegposition' as const,
        // Ein liegengebliebener Kopfsatz darf NICHT mit hinausgehen: die
        // holende Quelle hat keinen SEFILELOOP-Eintrag, an dem er stuende —
        // und ein VAR-Abschnitt entstuende sonst gleich mit.
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
      // Der GEBER bestellt die Schluessel der Hol-Relation MIT (2026-08-12, s. dataSources.test).
      { INDEX_NR: 0, ALIAS: 'Belege', ID: 'BEL', FELDER: '3_8,2_1,0_1,1_1' },
    ])
    expect(json.VAR).toBeUndefined()
    expect(html).toContain('"ladeRelation":{"nr":"69","geberQuelleId":"belege"')
    // Keine benutzten Felder hinter dem 255er-Schnitt -> leere zusatzFelder
    // (der Lader stellt dann je Position nur die eine breite Frage).
    expect(html).toContain('"endeFelder":["11_6","18_25"],"zusatzFelder":[]')
  })

  // Felder HINTER dem breiten Schnitt (POS=0/LEN=255) kann der Lader nicht
  // aus dem SATZ schneiden — er fragt sie je Position einzeln (Wellenkopf R).
  // WELCHE das sind, kann nur der Export abzaehlen (die laufende Maske hat
  // kein Feld-Woerterbuch): dieselbe S5.1-Sammlung wie die FELDER-Bestellung.
  // Ginge die Liste verloren, bliebe die Spalte in der Maske STILL leer.
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
              // Ein Feld hinter dem Schnitt (280+12 > 255) und eins im
              // Fenster (18+25 = 43): nur das erste reist als zusatzFeld.
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

  // Muster wie beim Kopfsatz oben: der Bediener wechselt die Art, der alte
  // Wert bleibt in der Datei — er darf weder die SEFILELOOP unterdruecken
  // noch in FF_DATA_SOURCES reisen (ladeRelationFor ist Art-gebunden).
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
    // Gezielt die FF_DATA_SOURCES-Zeile pruefen, nicht das ganze HTML: seit
    // R2 steckt das WORT ladeRelation auch im eingebetteten Runtime-Buendel
    // (der Lader-Code selbst) — dort ist es richtig und meint nicht, dass
    // die liegengebliebene Einstellung mitreist.
    const quellenZeile = /window\.FF_DATA_SOURCES = .*/.exec(html)?.[0] ?? ''
    expect(quellenZeile).toContain('"id":"q"')
    expect(quellenZeile).not.toContain('ladeRelation')
  })
})
