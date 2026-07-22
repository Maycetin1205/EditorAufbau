// Unit-Tests für die puren Helfer der SoftEngine-Anbindung (Kap. 5.3):
// Feldcode-Auflösung (direkt + pos_len aus dem SATZ), Zeilen aus den
// SEDATA-Formen der Referenzmaske, Spalten-Zuordnung mit Auffang.
// Die DOM-Hydrierung selbst prüft e2e/kanban-data.spec.ts im echten Browser.
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.
// Schicht-Umzug 2026-07-15: die allgemeinen Helfer wohnen jetzt in
// src/softengine/ — nur die Importpfade sind neu, jede Aussage unverändert.

import { describe, expect, it } from 'vitest'
// formatNowDate ist mit Z2 nach core/data/relations gezogen (zweiter
// Konsument seAktionen) — der Testfall selbst ist unverändert.
import { formatNowDate } from '../../core/data/relations'
import {
  findRuntimeDataSource,
  getField,
  messagePayload,
  payloadDaten,
  rowsFor,
  setField,
} from '../../softengine/data'
import {
  extractRelationResult,
  findRuntimeRelation,
  newSeMessageResult,
  resolveActionParam,
  seMessageKeys,
} from '../../softengine/relations'
import { columnIndexFor } from './seRuntime'

// Kap. 5.4: die exportierte Maske traegt ihre Quellen-Definitionen selbst
// (window.FF_DATA_SOURCES aus exportMask) — hier die pure Aufloesung dazu.
describe('findRuntimeDataSource (FF_DATA_SOURCES -> Quelle)', () => {
  const liste = [
    { id: 'terminplaner', name: 'Terminplaner', tableId: 'IDBID0001', indexField: '0_10' },
    { id: 'adressen', name: 'Adressen', tableId: 'ADR', indexField: '' },
  ]

  it('findet den Eintrag zur source-id', () => {
    expect(findRuntimeDataSource(liste, 'terminplaner')).toEqual(liste[0])
    expect(findRuntimeDataSource(liste, 'adressen')).toEqual(liste[1])
  })

  it('liefert undefined bei unbekannter/leerer id oder fehlender Liste', () => {
    expect(findRuntimeDataSource(liste, 'gibt-es-nicht')).toBeUndefined()
    expect(findRuntimeDataSource(liste, '')).toBeUndefined()
    expect(findRuntimeDataSource(undefined, 'terminplaner')).toBeUndefined()
    expect(findRuntimeDataSource('quatsch', 'terminplaner')).toBeUndefined()
  })

  it('ignoriert kaputte Eintraege statt zu raten; fehlendes indexField wird leer', () => {
    expect(findRuntimeDataSource([{ id: 'x', name: 42, tableId: 'A' }], 'x')).toBeUndefined()
    expect(findRuntimeDataSource([{ id: 'x', name: 'X', tableId: 'A' }], 'x'))
      .toEqual({ id: 'x', name: 'X', tableId: 'A', indexField: '' })
  })
})

// Kap. 5.5: die exportierte Maske traegt ihre Relation-Vorlagen selbst
// (window.FF_RELATIONS aus exportMask) — hier die pure Aufloesung dazu.
describe('findRuntimeRelation (FF_RELATIONS -> Vorlage)', () => {
  const liste = [
    { id: 'standard-put', verb: 'PUT_RELATION', nr: '174', params: ['{FELD_POS}', 'L'] },
    { id: 'termin', verb: 'GET_RELATION', nr: '640', params: ['{PINDEX}'] },
  ]

  it('findet die Vorlage zur id (nur Technikwerte, kein Anzeigename noetig)', () => {
    expect(findRuntimeRelation(liste, 'standard-put')).toEqual(liste[0])
    expect(findRuntimeRelation(liste, 'termin')).toEqual(liste[1])
  })

  it('liefert undefined bei unbekannter/leerer id oder fehlender Liste', () => {
    expect(findRuntimeRelation(liste, 'gibt-es-nicht')).toBeUndefined()
    expect(findRuntimeRelation(liste, '')).toBeUndefined()
    expect(findRuntimeRelation(undefined, 'standard-put')).toBeUndefined()
  })

  it('ignoriert kaputte Eintraege statt zu raten (unbekanntes Verb, params kein Array)', () => {
    expect(findRuntimeRelation([{ id: 'x', verb: 'X', nr: '1', params: [] }], 'x')).toBeUndefined()
    expect(findRuntimeRelation([{ id: 'x', verb: 'PUT_RELATION', nr: '1', params: 'nope' }], 'x')).toBeUndefined()
    expect(findRuntimeRelation([{ id: 'x', verb: 'PUT_RELATION', nr: '', params: [] }], 'x')).toBeUndefined()
  })
})

describe('Relations-Antworten (BWMSG/WWMSG-Callback und SEDATA-Fallback)', () => {
  it('liest explizite Ergebnisse aus den belegten Antwortformen', () => {
    expect(extractRelationResult({ RESULT: '4711' })).toBe('4711')
    expect(extractRelationResult(JSON.stringify({ payload: { result: { PINDEX: 23 } } }))).toBe('23')
    expect(extractRelationResult({ DATA: { RESULT: false } })).toBe('false')
  })

  it('verwechselt fremde Callback-Daten nicht mit einer Relationsantwort', () => {
    expect(extractRelationResult({ status: 'irgendein Event' })).toBeUndefined()
    expect(extractRelationResult('kein JSON')).toBeUndefined()
  })

  it('nimmt nur neu entstandene SEDATA.MessageN-Slots', () => {
    const seData = {
      Message1: { RESULT: 'alt' },
      Message3: { RESULT: 'neu' },
      Daten: {},
    }
    expect(seMessageKeys(seData)).toEqual(['Message1', 'Message3'])
    expect(newSeMessageResult(seData, new Set(['Message1']))).toBe('neu')
    expect(newSeMessageResult(seData, new Set(['Message1', 'Message3']))).toBeUndefined()
  })
})

describe('Relations-Parameterquellen', () => {
  const runtime = {
    FF_DATA_SOURCES: [
      { id: 'termine', name: 'Terminplaner', tableId: 'IDBID0001', indexField: '0_10' },
    ],
    SEDATA: {
      Daten: {
        VARArrays: { Mandant: '03' },
        SEFileLoop: [{
          ALIAS: 'Terminplaner',
          Zeilen: [
            { '0_10': '41', '78_30': 'Minka' },
            { '0_10': '42', '78_30': 'Balu' },
          ],
        }],
      },
    },
  }
  const values = { context: { PINDEX: '42', VALUE: 'Neu' }, previousResult: '991' }

  it('loest fest, Ereigniswert, vorheriges Ergebnis und VAR-Array auf', () => {
    expect(resolveActionParam({ source: 'fixed', value: 'L' }, values, runtime)).toBe('L')
    expect(resolveActionParam({ source: 'context', value: 'VALUE' }, values, runtime)).toBe('Neu')
    expect(resolveActionParam({ source: 'previous_result', value: '' }, values, runtime)).toBe('991')
    expect(resolveActionParam({ source: 'se_variable', value: 'Mandant' }, values, runtime)).toBe('03')
  })

  it('liest das Feld der ueber PINDEX bestimmten Datenzeile', () => {
    expect(resolveActionParam({
      source: 'data_field', value: '78_30', dataSourceId: 'termine',
    }, values, runtime)).toBe('Balu')
  })
})

describe('formatNowDate ({NOW_DATE}-Platzhalter)', () => {
  it('formatiert deutsches Datum mit fuehrenden Nullen', () => {
    expect(formatNowDate(new Date(2026, 6, 8))).toBe('08.07.2026')
    expect(formatNowDate(new Date(2026, 11, 25))).toBe('25.12.2026')
  })
})

describe('getField (Feldcode -> Wert)', () => {
  it('liest direkte Properties und trimmt', () => {
    expect(getField({ '78_30': ' Minka ' }, '78_30')).toBe('Minka')
    expect(getField({ name: 'Testname' }, 'name')).toBe('Testname')
  })

  it('faellt auf pos_len aus dem SATZ-Rohstring zurueck (SATZNEU vor SATZ)', () => {
    //            0123456789
    const satz = 'K2      Katze                         '
    expect(getField({ SATZ: satz }, '0_8')).toBe('K2')
    expect(getField({ SATZ: satz }, '8_30')).toBe('Katze')
    expect(getField({ SATZNEU: 'NEU     ', SATZ: satz }, '0_8')).toBe('NEU')
  })

  it('liefert leer bei fehlendem Feld, leerem Code oder kaputter Zeile', () => {
    expect(getField({ a: 1 }, 'fehlt')).toBe('')
    expect(getField({ a: 1 }, '')).toBe('')
    expect(getField(null, '78_30')).toBe('')
    expect(getField('keine zeile', '78_30')).toBe('')
  })

  // SE-Echttest 2026-07-11: SoftEngine liefert Zeilen-Properties MIT
  // Tabellen-Praefix (TFELD.Name = 'IDBID0001_253_30') — die Endungs-Regel
  // der Referenz (getField Z. 729) loest den Code '253_30' dagegen auf.
  it('findet praefixierte Schluessel (Endung _code, echte SE-Form)', () => {
    expect(getField({ IDBID0001_253_30: ' 2 ' }, '253_30')).toBe('2')
    expect(getField({ IDBID0001_78_30: 'Minka' }, '78_30')).toBe('Minka')
    // Leere direkte Property blockiert den Scan nicht (Regel der Referenz).
    expect(getField({ '253_30': ' ', IDBID0001_253_30: '2' }, '253_30')).toBe('2')
    // Praefix-Regel (code_...) der Referenz ebenfalls abgedeckt.
    expect(getField({ '10_8_zusatz': 'X' }, '10_8')).toBe('X')
  })
})

describe('setField (Schreibweg 5.3b: Wert -> Zeile)', () => {
  it('setzt eine direkte Property', () => {
    const row: Record<string, unknown> = { '253_30': '2', name: 'alt' }
    expect(setField(row, '253_30', '3')).toBe(true)
    expect(setField(row, 'name', 'neu')).toBe(true)
    expect(row['253_30']).toBe('3')
    expect(row.name).toBe('neu')
  })

  it('patcht pos_len im SATZ-Rohstring: exakte Feldlaenge, Rest unberuehrt', () => {
    //            0123456789
    const row = { SATZ: 'K2      Katze                         X' }
    expect(setField(row, '8_30', 'Hund')).toBe(true)
    expect(row.SATZ).toBe('K2      Hund                          X')
    expect(getField(row, '8_30')).toBe('Hund') // liest zurueck, was geschrieben wurde
    expect(getField(row, '0_8')).toBe('K2')    // Nachbarfeld unveraendert
  })

  it('kuerzt zu lange Werte auf die Feldlaenge und patcht SATZNEU vor SATZ', () => {
    const row = { SATZNEU: 'abcdefgh', SATZ: 'unberuehrt' }
    expect(setField(row, '0_4', 'LANGERWERT')).toBe(true)
    expect(row.SATZNEU).toBe('LANGefgh')
    expect(row.SATZ).toBe('unberuehrt')
  })

  it('verlaengert zu kurze Rohstrings deterministisch bis zur Feldposition', () => {
    const row = { SATZ: 'K2' }
    expect(setField(row, '8_4', 'OP')).toBe(true)
    expect(row.SATZ).toBe('K2      OP  ')
    expect(getField(row, '8_4')).toBe('OP')
  })

  it('haelt direkte Property UND Rohstring konsistent, wenn beide existieren', () => {
    const row: Record<string, unknown> = { '0_4': 'alt', SATZ: 'alt       ' }
    expect(setField(row, '0_4', 'neu')).toBe(true)
    expect(row['0_4']).toBe('neu')
    expect(row.SATZ).toBe('neu       ')
  })

  it('schreibt nichts bei kaputter Zeile, leerem Code oder unbekanntem Feld', () => {
    expect(setField(null, '0_4', 'x')).toBe(false)
    expect(setField({ SATZ: 'abc' }, '', 'x')).toBe(false)
    const row: Record<string, unknown> = { name: 'bleibt' }
    expect(setField(row, 'fehlt', 'x')).toBe(false)
    expect(row).toEqual({ name: 'bleibt' })
  })

  // SE-Echttest 2026-07-11: der Schreibweg muss dieselben praefixierten
  // Schluessel aktualisieren, die getField liest — sonst spraenge die
  // gezogene Karte bei der Neu-Hydrierung zurueck.
  it('patcht praefixierte Schluessel (echte SE-Form) und liest sie zurueck', () => {
    const row: Record<string, unknown> = { IDBID0001_253_30: '2', IDBID0001_78_30: 'Minka' }
    expect(setField(row, '253_30', '3')).toBe(true)
    expect(row.IDBID0001_253_30).toBe('3')
    expect(row.IDBID0001_78_30).toBe('Minka') // Nachbarfeld unberuehrt
    expect(getField(row, '253_30')).toBe('3')
  })
})

// SE-Push (Phase 2): SoftEngine schiebt die Daten an den REGISTER-Callback
// (String oder Objekt) bzw. als message-Event { MSG: { DATA } } — Formen
// exakt nach Referenz behandlung-umbau Block 1/9 (__seConsume/regSE) und
// altem Editor (installMessageHook).
describe('payloadDaten (geschobenes SE-Paket -> Daten)', () => {
  const daten = { SEFileLoop: [{ ALIAS: 'Terminplaner', Zeilen: [] }] }

  it('nimmt ein Objekt-Paket mit Daten.SEFileLoop an', () => {
    expect(payloadDaten({ Daten: daten })).toEqual(daten)
  })

  it('nimmt ein String-Paket an (SE liefert auch JSON-Strings)', () => {
    expect(payloadDaten(JSON.stringify({ Daten: daten }))).toEqual(daten)
  })

  it('nimmt die belegten Formen Tabellen (alter Editor) und ErpApiCall (Referenz) an', () => {
    expect(payloadDaten({ Daten: { Tabellen: { IDBID0001: {} } } })).toEqual({ Tabellen: { IDBID0001: {} } })
    expect(payloadDaten({ Daten: { ErpApiCall: {} } })).toEqual({ ErpApiCall: {} })
  })

  it('weist alles andere ab: kaputtes JSON, kein Daten, unbekannte Form, GET-Antworten', () => {
    expect(payloadDaten('kein json')).toBeUndefined()
    expect(payloadDaten(undefined)).toBeUndefined()
    expect(payloadDaten({ MessageN: 'GET-Antwort' })).toBeUndefined()
    expect(payloadDaten({ Daten: { Irgendwas: 1 } })).toBeUndefined()
  })
})

describe('messagePayload (message-Event -> Nutzlast)', () => {
  it('zieht MSG.DATA aus Objekt- und String-Events', () => {
    expect(messagePayload({ MSG: { MSGID: 'BWMSG', DATA: { Daten: {} } } })).toEqual({ Daten: {} })
    expect(messagePayload(JSON.stringify({ MSG: { MSGID: 'WWMSG', DATA: 'roh' } }))).toBe('roh')
  })

  it('ignoriert fremde Events (kein MSG, kaputtes JSON, kein Objekt)', () => {
    expect(messagePayload({ source: 'react-devtools' })).toBeUndefined()
    expect(messagePayload('kein json')).toBeUndefined()
    expect(messagePayload(42)).toBeUndefined()
  })
})

describe('rowsFor (SEDATA -> Zeilen einer Quelle)', () => {
  const zeilen = [{ '10_8': 'K1' }, { '10_8': 'K2' }]

  it('findet den SEFileLoop-Eintrag ueber den ALIAS (Array-Form, Gross/klein egal)', () => {
    const seData = { Daten: { SEFileLoop: [
      { ALIAS: 'Kundenhaustiere', Zeilen: [{ x: 1 }] },
      { ALIAS: ' terminplaner ', Zeilen: zeilen },
    ] } }
    expect(rowsFor(seData, 'Terminplaner', 'IDBID0001')).toEqual(zeilen)
  })

  it('findet den SEFileLoop-Eintrag in der Objekt-Form (Schluessel oder ALIAS)', () => {
    const perKey = { Daten: { SEFileLoop: { Terminplaner: { Saetze: zeilen } } } }
    expect(rowsFor(perKey, 'Terminplaner', 'IDBID0001')).toEqual(zeilen)
    const perAlias = { Daten: { SEFileLoop: { egal: { alias: 'Terminplaner', rows: zeilen } } } }
    expect(rowsFor(perAlias, 'Terminplaner', 'IDBID0001')).toEqual(zeilen)
  })

  it('faellt auf Tabellen zurueck (ALIAS- oder IDB-ID-Schluessel, auch als JSON-String)', () => {
    const perAlias = { Daten: { Tabellen: { Terminplaner: { Daten: zeilen } } } }
    expect(rowsFor(perAlias, 'Terminplaner', 'IDBID0001')).toEqual(zeilen)
    const perId = { Daten: { Tabellen: { IDBID0001: { Zeilen: JSON.stringify(zeilen) } } } }
    expect(rowsFor(perId, 'Terminplaner', 'IDBID0001')).toEqual(zeilen)
  })

  it('liefert [] ohne SEDATA, ohne Daten oder ohne passenden Eintrag', () => {
    expect(rowsFor(undefined, 'Terminplaner', 'IDBID0001')).toEqual([])
    expect(rowsFor({}, 'Terminplaner', 'IDBID0001')).toEqual([])
    expect(rowsFor({ Daten: { SEFileLoop: [] } }, 'Terminplaner', 'IDBID0001')).toEqual([])
  })
})

describe('columnIndexFor (Zeilenwert -> Spalte)', () => {
  const values = ['', '2', 'Fertig']

  it('trifft exakt (getrimmt, Gross/klein egal)', () => {
    expect(columnIndexFor('2', values)).toBe(1)
    expect(columnIndexFor(' fertig ', values)).toBe(2)
  })

  it('kein Treffer oder leerer Wert -> -1 fuer Auffang/Automatik', () => {
    expect(columnIndexFor('3', values)).toBe(-1)
    expect(columnIndexFor('', values)).toBe(-1)
  })

  it('leere Spaltentitel treffen nie', () => {
    expect(columnIndexFor('', ['x', '', 'y'])).toBe(-1)
    expect(columnIndexFor('unbekannt', ['x', '', 'y'])).toBe(-1)
  })
})
