// Unit-Tests fuer die puren Helfer der Kanban-SoftEngine-Anbindung
// (Kap. 5.3): Feldcode-Aufloesung (direkt + pos_len aus dem SATZ), Zeilen
// aus den SEDATA-Formen der Referenzmaske, Spalten-Zuordnung mit Auffang.
// Die DOM-Hydrierung selbst prueft e2e/kanban-data.spec.ts im echten Browser.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
// formatNowDate ist mit Z2 nach core/data/relations gezogen (zweiter
// Konsument seAktionen) — der Testfall selbst ist unveraendert.
import { formatNowDate } from '../../core/data/relations'
import {
  catchColumnIndex,
  columnIndexFor,
  effectiveColumnValues,
  findRuntimeDataSource,
  findRuntimeRelation,
  getField,
  messagePayload,
  parseStatusValues,
  payloadDaten,
  rowsFor,
  setField,
} from './seRuntime'

// Kap. 5.4: die exportierte Maske traegt ihre Quellen-Definitionen selbst
// (var FF_DATA_SOURCES aus exportMask) — hier die pure Aufloesung dazu.
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
// (var FF_RELATIONS aus exportMask) — hier die pure Aufloesung dazu.
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

describe('formatNowDate ({NOW_DATE}-Platzhalter)', () => {
  it('formatiert deutsches Datum mit fuehrenden Nullen', () => {
    expect(formatNowDate(new Date(2026, 6, 8))).toBe('08.07.2026')
    expect(formatNowDate(new Date(2026, 11, 25))).toBe('25.12.2026')
  })
})

describe('getField (Feldcode -> Wert)', () => {
  it('liest direkte Properties und trimmt', () => {
    expect(getField({ '78_30': ' Minka ' }, '78_30')).toBe('Minka')
    expect(getField({ name: 'Buddy' }, 'name')).toBe('Buddy')
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
    expect(messagePayload({ MSG: { DATA: { Daten: {} } } })).toEqual({ Daten: {} })
    expect(messagePayload(JSON.stringify({ MSG: { DATA: 'roh' } }))).toBe('roh')
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

// B1 (V2/K6): der Spaltenwert ist eine LISTE — statusvalues reist als JSON-
// Attribut (exportMask), parseStatusValues liest strikt zurueck, und die
// Standard-Regel der freigegebenen Strecke gilt: leere Liste = der
// SPALTENTITEL zaehlt als Wert (effectiveColumnValues).
describe('parseStatusValues (statusvalues-Attribut -> Liste)', () => {
  it('liest das JSON-Array aus exportMask zurueck', () => {
    expect(parseStatusValues('["2"]')).toEqual(['2'])
    expect(parseStatusValues('["Zimmer 1","Zimmer 2"]')).toEqual(['Zimmer 1', 'Zimmer 2'])
    expect(parseStatusValues('[]')).toEqual([])
  })

  it('weist alles andere strikt ab: fehlend, kaputt, kein Array, Nicht-Strings', () => {
    expect(parseStatusValues(null)).toEqual([])
    expect(parseStatusValues(undefined)).toEqual([])
    expect(parseStatusValues('')).toEqual([])
    expect(parseStatusValues('kein json')).toEqual([])
    expect(parseStatusValues('"nur-ein-string"')).toEqual([])
    expect(parseStatusValues('{"a":1}')).toEqual([])
    expect(parseStatusValues('[1,"ok",null]')).toEqual(['ok'])
  })
})

describe('effectiveColumnValues (Standard-Regel: leer = Titel)', () => {
  it('belegte Liste gewinnt — der Titel spielt dann keine Rolle', () => {
    expect(effectiveColumnValues('["2","3"]', 'Offen')).toEqual(['2', '3'])
  })

  it('leere Liste -> der Spaltentitel zaehlt als der eine Wert (getrimmt)', () => {
    expect(effectiveColumnValues('[]', 'Offen')).toEqual(['Offen'])
    expect(effectiveColumnValues(null, ' In Arbeit ')).toEqual(['In Arbeit'])
  })

  it('nur Leerraum-Werte zaehlen nicht als belegt -> Titel-Regel greift', () => {
    expect(effectiveColumnValues('["  ",""]', 'Offen')).toEqual(['Offen'])
  })

  it('ohne Liste UND ohne Titel hat die Spalte keine Werte (faengt nichts, kein Ablage-Ziel)', () => {
    expect(effectiveColumnValues('[]', '')).toEqual([])
    expect(effectiveColumnValues(null, '   ')).toEqual([])
    expect(effectiveColumnValues(null, null)).toEqual([])
  })
})

describe('columnIndexFor (Zeilenwert -> Spalte, Werte-Listen)', () => {
  const values = [[], ['2'], ['Fertig', 'Erledigt']]

  it('trifft exakt (getrimmt, Gross/klein egal) — JEDER Listenwert zaehlt', () => {
    expect(columnIndexFor('2', values)).toBe(1)
    expect(columnIndexFor(' fertig ', values)).toBe(2)
    expect(columnIndexFor('ERLEDIGT', values)).toBe(2)
  })

  it('erster Treffer in Spalten-Reihenfolge gewinnt', () => {
    expect(columnIndexFor('x', [['a'], ['x'], ['x']])).toBe(1)
  })

  it('kein Treffer oder leerer Wert -> -1 (B2: der Aufrufer entscheidet, NIE still Spalte 0)', () => {
    // Strengere Spec seit B2: die stille "erste Spalte"-Regel ist
    // abgeschafft — kein Treffer heisst Auffangspalte oder die
    // Laufzeit-Spalte "Nicht zugeordnet", nie ein heimlicher Default.
    expect(columnIndexFor('3', values)).toBe(-1)
    expect(columnIndexFor('', values)).toBe(-1)
  })

  it('leere Listen treffen nie', () => {
    // Zeilenwert '' darf NICHT auf die leere Spalte 1 "matchen" — er ist
    // schlicht ohne Treffer (-1).
    expect(columnIndexFor('', [['x'], [], ['y']])).toBe(-1)
    expect(columnIndexFor('unbekannt', [['x'], [], ['y']])).toBe(-1)
  })
})

describe('catchColumnIndex (B2: gewaehlte Auffangspalte)', () => {
  it('findet die erste Spalte mit auffang="ja" (getrimmt)', () => {
    expect(catchColumnIndex(['nein', 'ja', 'nein'])).toBe(1)
    expect(catchColumnIndex([null, ' ja ', 'ja'])).toBe(1)
  })

  it('keine gewaehlt -> -1 (dann erzeugt die Laufzeit "Nicht zugeordnet")', () => {
    expect(catchColumnIndex(['nein', '', null, undefined])).toBe(-1)
    expect(catchColumnIndex([])).toBe(-1)
  })

  it('nur der Technikwert "ja" zaehlt — kein Raten bei Muell', () => {
    expect(catchColumnIndex(['true', 'JA', 'yes'])).toBe(-1)
  })
})
