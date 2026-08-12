// Export-Tests: die BESTELLUNG einer Datenquelle — welche SPALTEN (FELDER,
// S5.1, 2026-08-11) und welche ZEILEN (FREISELEKT, R5, 2026-08-12).
//
// Bis dahin bestellte jede IDB-Quelle `FELDER:'*'` — alle Felder aller Zeilen.
// SoftEngine macht fuer JEDEN gelieferten Wert einen Bild-Nachschlag
// (GET_RELATION 1911; Nutzer-Log 2026-08-11: 5 953 Aufrufe in 9,2 s beim
// Oeffnen der Maske). Die SE-Seite koennen wir nicht aendern, die MENGE
// liefert unsere Bestellung.
//
// ⚠ Was diese Tests NICHT belegen: den SE-Kontrakt. Die explizite Liste ist
// fuer IDB an keiner echten Maske belegt — beide Chef-Masken fuehren IDB mit
// '*'. Belegt sind nur die FORM (pos_len, s. docs/chef-maske/JsonBeleg.json)
// und dass die Zeilen-Schluessel pos_len tragen. Hier steht die HERLEITUNG:
// dass jeder Weg, auf dem ein Feldcode in die Maske reist, mitgezaehlt wird.
// Ueber den Kontrakt entscheidet der SE-Echttest des Nutzers.
//
// Eigene Datei seit 2026-08-11 (500-Zeilen-Deckel, derselbe Schnitt wie
// datenquellen.test.ts aus export.test.ts und preflight.test.ts davor):
// drueben stehen die Quellen SELBST (welche in der SEFILELOOP landen), hier
// was jede von ihnen bestellt.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
// Side-Effect-Imports: registrieren die echten Bausteine der Faelle.
import '../blocks/kanban/KanbanBlock'
import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { registerTestBlocks, TEST_EVENT_BLOCK } from '../test/testBlocks'

registerTestBlocks()

describe('exportMask: FELDER-Bestellung', () => {
  // Der Fall, der zaehlt: eine grosse Tabelle, von der die Maske wenig liest.
  // Geprueft wird jeder Weg, auf dem ein Feldcode ueberhaupt in die Maske
  // reist — Feld-Property am Board, Bindung an der Musterkarte, Spalte samt
  // Zusatzfeld der Darstellung, Tagesfilter, Datensatz-Nummer.
  it('bestellt bei einer IDB-Quelle nur die benutzten Felder', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board', 'tab'] },
      board: {
        id: 'board', type: 'kanban', parentId: 'root', childIds: ['sp'],
        // statusField + tagField sind Feld-Properties (kind 'field'), also
        // NACKTE Feldcodes an der Quelle in Reichweite.
        props: { source: 'termine', statusField: '20_10', tagField: '50_10' },
      },
      sp: { id: 'sp', type: 'kanban-spalte', props: { heading: 'Offen' }, parentId: 'board', childIds: ['karte'] },
      karte: {
        id: 'karte', type: 'card', parentId: 'sp', childIds: [],
        // Bindungen fester Stellen — an der KARTE, aufgeloest gegen die Quelle
        // ihres Traegers (des Boards).
        props: { headingField: '40_20', timeField: '10_5' },
      },
      tab: {
        id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'termine', suche: 'nein',
          spalten: [
            // Eine Spalte der Darstellung „Bild + Name" liest DREI Felder:
            // ihr eigenes plus die Zusatzfelder der Art.
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
          // Die drei liest NIEMAND — genau sie sollen wegfallen.
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
        // Datensatz-Nummer vorne (die Laufzeit liest sie fuer jeden pindex),
        // danach Woerterbuch-Reihenfolge.
        FELDER: '0_10,40_20,10_5,20_10,30_10,50_10,60_10,70_30',
      },
    ])
  })

  // Die beiden Schluesselwege, die ein Baustein NICHT ueber eine Bindung
  // nimmt: die Auswahl-Folge (beide Seiten des Feldpaares) und der
  // Ketten-Parameter „Feld der gewaehlten Zeile" (Feld in der Quelle des
  // GEBERS, adressiert ueber dessen Baum-id). Fehlt einer, filtert die Maske
  // stumm nie bzw. schreibt Leere.
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
      // Spalte + linke Seite des Feldpaares + Feld der gewaehlten Zeile.
      { INDEX_NR: 0, ALIAS: 'Kunden', ID: 'IDBID0001', FELDER: '20_30,10_8,0_10' },
      // Spalte + rechte Seite des Feldpaares.
      { INDEX_NR: 0, ALIAS: 'Belege', ID: 'IDBID0002', FELDER: '30_8,11_8' },
    ])
  })

  // Und die Felder der NACHSCHLAGE-Quelle (kind 'quelle' + kind 'field' mit
  // quelleProp): sie haengen nicht an der Quelle in Reichweite, sondern an der
  // Nachbar-Prop. Ohne sie blieben beide Spalten des Lupen-Fensters leer.
  it('bestellt die Felder der Nachschlage-Quelle', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['feld'] },
      feld: {
        id: 'feld', type: 'formfeld', parentId: 'root', childIds: [],
        props: {
          label: 'Kunde', fieldType: 'nachschlagen', nachschlagQuelle: 'kunden',
          anzeigeFeld: '20_30', speicherFeld: '10_8',
          // Liegen geblieben aus der Zeit als Textfeld: am Nachschlage-Feld ist
          // die Wert-Bindung nicht bindbar, der Export laesst sie weg, die
          // Laufzeit liest sie nicht — also wird sie auch nicht bestellt.
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

  // Das SICHERHEITSVENTIL. Ein Feldcode darf laut DataSourceField auch ein
  // direkter Property-Name sein ('name' statt '20_30'); fuer den ist die Form
  // einer expliziten FELDER-Liste NIRGENDS belegt. Dann bleibt es bei '*':
  // lieber die alte Datenmenge als eine Stelle, die in der fertigen Maske
  // still leer bleibt (Regel 4).
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

  // --- Der ZEILENfilter: FREISELEKT (R5, 2026-08-12) ---------------------
  //
  // Dieselbe Frage wie oben, andere Achse: FELDER sagt WELCHE SPALTEN eine
  // Quelle bestellt, FREISELEKT WELCHE ZEILEN. Anlass ist der Blocker des
  // Nutzers: ein Refresh schiebt jedes Mal den ganzen Bestand erneut, und die
  // Menge bestimmt allein unsere Bestellung.
  //
  // Belegt (Desktop\VORLAGEN, 267 echte SEvariablen-Dateien des Herstellers,
  // 10 mit Treffern): FREISELEKT ist ein optionales Praedikat am
  // SEFILELOOP-Eintrag und steht HINTER FELDER
  // ({ ID, …, FELDER, FREISELEKT, SORTIERUNG }). Geprueft wird darum die
  // Schluessel-REIHENFOLGE mit, nicht nur der Wert.
  //
  // Und: eine Quelle OHNE Filter behaelt ihren Eintrag Byte fuer Byte —
  // sonst waere jede bestehende Maske betroffen.
  it('haengt den Zeilenfilter als FREISELEKT hinter FELDER, nur wo einer steht', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['belege', 'adr'] },
      belege: {
        id: 'belege', type: 'tabelle', parentId: 'root', childIds: [],
        props: { source: 'belege', suche: 'nein', spalten: [{ titel: 'Nummer', feld: '3_8' }] },
      },
      adr: {
        id: 'adr', type: 'tabelle', parentId: 'root', childIds: [],
        props: { source: 'adressen', suche: 'nein', spalten: [{ titel: 'Nr', feld: '2_8' }] },
      },
    }
    const sources = [
      {
        id: 'belege', name: 'Belege', kind: 'beleg' as const,
        // Wie in der echten Datei: Feld MIT Datei-Praefix, Operator '<'.
        zeilenFilter: 'BEL_3_8<99990000',
        fields: [{ code: '3_8', label: 'Belegnummer' }],
      },
      {
        id: 'adressen', name: 'Adressen', kind: 'adressstamm' as const,
        fields: [{ code: '2_8', label: 'Adressnummer' }],
      },
    ]

    const eintraege = JSON.parse(exportMask(tree, 'Maske', sources).sevariablen).SEFILELOOP
    expect(eintraege).toEqual([
      {
        INDEX_NR: 0, ALIAS: 'Belege', ID: 'BEL', FELDER: '3_8',
        FREISELEKT: 'BEL_3_8<99990000',
      },
      { INDEX_NR: 0, ALIAS: 'Adressen', ID: 'ADR', FELDER: '2_8' },
    ])
    expect(Object.keys(eintraege[0])).toEqual(['INDEX_NR', 'ALIAS', 'ID', 'FELDER', 'FREISELEKT'])
  })

  // Ein leerer bzw. nur aus Leerzeichen bestehender Filter darf NICHT als
  // Schluessel hinausgehen: ein leeres FREISELEKT kommt in echten Dateien vor,
  // aber wir haben keinen Beleg, was SoftEngine mit einem Ausdruck aus
  // Leerzeichen macht — weglassen ist der Zustand von vorher.
  it('schreibt keinen FREISELEKT, wenn der Filter leer oder nur Leerzeichen ist', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['adr'] },
      adr: {
        id: 'adr', type: 'tabelle', parentId: 'root', childIds: [],
        props: { source: 'adressen', suche: 'nein', spalten: [{ titel: 'Nr', feld: '2_8' }] },
      },
    }
    const sources = [
      {
        id: 'adressen', name: 'Adressen', kind: 'adressstamm' as const,
        zeilenFilter: '   ',
        fields: [{ code: '2_8', label: 'Adressnummer' }],
      },
    ]

    const { sevariablen } = exportMask(tree, 'Maske', sources)
    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Adressen', ID: 'ADR', FELDER: '2_8' },
    ])
  })
})
