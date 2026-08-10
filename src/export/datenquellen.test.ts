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

  // --- Zeilen, die unter einem Kopfsatz haengen (2026-08-07) --------------
  //
  // Abgelesen an der ausgelieferten Belegerfassung des Nutzers:
  // { ID: 'POS', ALIAS: 'Belegpositionen', KOPFSATZ_INDEX: 'BEL_0_11', FELDER: … }.
  // Ohne den KOPFSATZ_INDEX schickt SoftEngine nicht die Positionen DIESES
  // Belegs — und das faellt still aus: die Maske laedt sauber und zeigt die
  // falschen Zeilen (oder keine).
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
        // DERSELBE Wert an einer Art, die keinen Kopfsatz fuehrt: er darf nicht
        // hinausgehen. Der Fall entsteht, wenn der Bediener die Art einer
        // bestehenden Quelle wechselt — der alte Wert bleibt in der Datei.
        id: 'termine', name: 'Termine', kind: 'idb' as const, idbId: 'IDBID0001',
        kopfsatzIndex: 'BEL_0_11', fields: [],
      },
    ]

    const { sevariablen } = exportMask(tree, 'Maske', sources)
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      {
        INDEX_NR: 0, ALIAS: 'Belegpositionen', ID: 'POS',
        KOPFSATZ_INDEX: 'BEL_0_11', FELDER: '18_25,45_60',
      },
      { INDEX_NR: 0, ALIAS: 'Termine', ID: 'IDBID0001', FELDER: '*' },
    ])
  })

  // --- Der Kopfsatz braucht seine Variable (2026-08-10) ------------------
  //
  // Gemessen an der Maske des Nutzers, drei Echttests in SoftEngine: POS ohne
  // Kopfsatz leer, POS mit Kopfsatz und BEL als SEFILELOOP-Eintrag leer, POS
  // mit Kopfsatz und handgeschriebenem VAR voll. 'BEL_0_11' loest gegen eine
  // VARIABLE namens BEL auf, nicht gegen eine SEFILELOOP-Zeile — fehlt sie,
  // verwirft SoftEngine den Eintrag ohne Fehlermeldung.
  //
  // Darum ist der VAR-Eintrag hier keine Einstellung, sondern eine FOLGE des
  // Kopfsatzes: wer einen schreibt, bekommt ihn.
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
        // Zweite Quelle am SELBEN Kopfsatz: EIN VAR-Eintrag, nicht zwei.
        id: 'serien', name: 'Seriennummern', kind: 'datei' as const, idbId: 'SERPOS',
        kopfsatzIndex: 'BEL_0_11',
        fields: [{ code: '43_1', label: 'Nummer' }],
      },
    ]

    const { sevariablen } = exportMask(tree, 'Maske', sources)
    expect(JSON.parse(sevariablen).VAR).toEqual([{ ID: 'BEL', FELDER: '0_11' }])
  })

  // Und die Gegenprobe: ohne Kopfsatz gibt es den Schluessel gar nicht. Sonst
  // truege jede bestehende Maske ploetzlich ein leeres VAR im Export.
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
    expect(Object.keys(JSON.parse(sevariablen))).toEqual(['SEFILELOOP', 'ERPAPICALL'])
  })

  // --- Der offene Satz: VAR statt SEFILELOOP (2026-08-07) ----------------
  //
  // Belegt an den ausgelieferten Belegerfassungs-Rahmen: der Satz, an dem die
  // Maske haengt, wird im VAR-Abschnitt bestellt (nur ID + FELDER, kein ALIAS,
  // kein INDEX_NR), und der Kopfsatz der Positionen zeigt auf ein Feld daraus.
  // Ohne VAR verwirft SoftEngine den POS-Eintrag stillschweigend.
  //
  // STILLGELEGT (2026-08-10, Nutzer-Entscheidung): Dieser Test beschreibt eine
  // Erwartung, die NICHT gebaut ist.
  // NACHGEZOGEN am selben Tag: einen VAR-Abschnitt gibt es inzwischen — er
  // entsteht aber aus den KOPFSAETZEN (Test oben), bestellt nur das
  // Kopfsatz-Feld und traegt keine Laufzeit-Marke. Was hier fehlt, ist der
  // offene Satz als eigene LESE-Quelle: `lieferung: 'offenerSatz'` waehlbar
  // machen, die Quelle dann aus der SEFILELOOP heraus- und mit ihren eigenen
  // Feldern ins VAR hineinnehmen, und die Laufzeit aus SEDATA.Daten.Var lesen
  // lassen. `istOffenerSatz` in core/data/dataSources.ts ruft weiterhin
  // niemand auf.
  //
  // Er wurde nicht geloescht und nicht passend gemacht: er IST die Bauanleitung
  // fuer die fehlende Haelfte, samt der Laufzeit-Marke, die dazugehoert. Wer
  // VAR baut, nimmt `todo` wieder weg -- dann prueft er wieder scharf. Bis
  // dahin waere ein rotes Pruefbuendel das schlechtere Signal: es macht jeden
  // spaeteren echten Fehler unsichtbar (Regel 3.5 des Umbau-Plans).
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
      ERPAPICALL: [],
    })
    // Die Laufzeit muss wissen, WO sie die Werte holt: aus SEDATA.Daten.Var
    // statt aus der SEFILELOOP. Ohne diese Marke lese sie ins Leere.
    expect(html).toContain('"tableId":"BEL","indexField":"","offenerSatz":true')
    // Und die Liste traegt die Marke NICHT — sonst aenderte sich jede Maske.
    expect(html).not.toContain('"ALIAS":"Belegpositionen","offenerSatz"')
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
