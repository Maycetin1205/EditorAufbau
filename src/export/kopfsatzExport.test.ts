// Export-Tests: KOPFSATZ und VAR-Abschnitt
// Zeilen, die unter einem Kopfsatz haengen (Belegpositionen am offenen Beleg),
// und der VAR-Abschnitt, der ihren Schluessel bereitstellt. Beides ist
// SE-Kontrakt und scheitert STILL, wenn es fehlt: die Maske laedt sauber und
// zeigt die falschen Zeilen oder keine.
//
// Eigene Datei seit 2026-08-16 (500-Zeilen-Deckel, wie schon zweimal zuvor bei
// dieser Datei). Wortgleich aus datenquellen.test.ts herausgeloest, kein Fall
// geaendert; drueben bleibt, was Bausteine an Quellen mitgeben und was eine
// holende Quelle tut.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
// Side-Effect-Imports: registrieren die echten Bausteine der Faelle.
import '../blocks/kanban/KanbanBlock'
import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { registerTestBlocks, TEST_DATA_BOX } from '../test/testBlocks'

registerTestBlocks()

describe('exportMask: Kopfsatz und VAR', () => {
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
    // Die Positionen stehen ZULETZT, obwohl sie zuerst angelegt und zuerst im
    // Baum stehen — s. den Reihenfolge-Fall weiter unten.
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Termine', ID: 'IDBID0001', FELDER: '*' },
      {
        INDEX_NR: 0, ALIAS: 'Belegpositionen', ID: 'POS',
        KOPFSATZ_INDEX: 'BEL_0_11', FELDER: '18_25,45_60',
      },
    ])
  })

  // --- Die REIHENFOLGE der Eintraege (2026-08-11) -------------------------
  //
  // ⚠ SE-Kontrakt, belegt im A/B-Echttest des Nutzers mit DERSELBEN Maske:
  // steht der POS-Loop an ERSTER Stelle, liefert SoftEngine aus KEINER Quelle
  // Daten — auch ADR/ART/IDB dahinter bleiben leer. Dieselbe Datei mit POS an
  // LETZTER Stelle: alle Quellen liefern. Ein Kopfsatz-Loop scheitert
  // standalone, und SoftEngine bricht beim ersten gescheiterten Loop die ganze
  // Liste ab.
  //
  // Bis dahin schrieb der Export in Anlege-/Baum-Reihenfolge: wer die
  // Positionen zuerst anlegte, bekam eine Maske, in der GAR NICHTS ankam —
  // ohne Fehlermeldung und ohne Zusammenhang zur Ursache.
  //
  // Geprueft wird BEIDE Anlege-Richtungen mit demselben Soll: Kopfsatz-Quellen
  // zuletzt, alle uebrigen untereinander unveraendert.
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

    // Positionen zuerst gebaut — sie muessen trotzdem hinten landen.
    expect(aliasse(bauBaum('positionen', 'termine')))
      .toEqual(['Termine', 'Adressen', 'Belegpositionen'])
    // Und andersherum: an der Reihenfolge der uebrigen aendert sich nichts.
    expect(aliasse(bauBaum('termine', 'positionen')))
      .toEqual(['Termine', 'Adressen', 'Belegpositionen'])
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
})
