// Tests des Feld-Woerterbuchs.
//
// Der Kopfkommentar von dataSources.ts verwies schon lange auf diese Datei
// ("maschinell erzwungen in dataSources.test.ts") — es gab sie nie. Sie holt
// das nach, damit die Zusage nicht laenger nur Prosa ist.

import { describe, expect, it } from 'vitest'
import {
  artFuer,
  felderFor,
  felderHinterSchnitt,
  ladeRelationFor,
  pruefeDatenquellen,
  quellenKennung,
  sanitizeDataSources,
  type DataSource,
} from './dataSources'

describe('sanitizeDataSources (kaputter Speicher darf nie den Start blockieren)', () => {
  const quelle = (fields: unknown) => [
    { id: 'q1', name: 'Quelle', kind: 'idb', idbId: 'IDBID0001', fields },
  ]

  it('behaelt ein gueltiges Feld', () => {
    const [q] = sanitizeDataSources(quelle([{ code: '193_30', label: 'Vorname' }]))
    expect(q.fields[0]).toEqual({ code: '193_30', label: 'Vorname' })
  })

  it('ein Feld traegt NUR code + label — Altschluessel fallen weg', () => {
    // `sample` bis 2026-07-10, `art` aus dem halben Tag Feld-Art (2026-07-27):
    // beides darf aus dem Speicher nicht zurueckkommen.
    const [q] = sanitizeDataSources(
      quelle([{ code: '183_10', label: 'Datum', art: 'datum', sample: '27.07.2026' }]),
    )
    expect(q.fields).toHaveLength(1)
    expect(q.fields[0]).toEqual({ code: '183_10', label: 'Datum' })
  })

  it('wirft Unbrauchbares weg, statt zu raten', () => {
    const [q] = sanitizeDataSources(
      quelle([{ code: '', label: 'Ohne Code' }, { code: '10_8' }, null, { code: '10_8', label: 'Adressnummer' }]),
    )
    expect(q.fields.map((f) => f.label)).toEqual(['Adressnummer'])
  })

  it('kein Feld-Array = Quelle ohne Felder, kein Absturz', () => {
    expect(sanitizeDataSources(quelle('quatsch'))[0].fields).toEqual([])
    expect(sanitizeDataSources('quatsch')).toEqual([])
  })

  // Der Zeilenfilter (R5) reist WOERTLICH durch den Speicher — auch mit
  // Leerzeichen am Rand. Wuerde der Lader hier trimmen oder den Wert
  // wegwerfen, sperrte die Verlust-Kontrolle (keinVerlust in state/ladeKette)
  // die ganze Bibliothek: sie vergleicht Gespeichertes mit Geladenem.
  it('der Zeilenfilter kommt woertlich zurueck, leer wird weggelassen', () => {
    const mitFilter = (zeilenFilter: unknown) => [
      { id: 'q1', name: 'Belege', kind: 'beleg', fields: [], zeilenFilter },
    ]
    expect(sanitizeDataSources(mitFilter('BEL_3_8<99990000'))[0].zeilenFilter)
      .toBe('BEL_3_8<99990000')
    expect(sanitizeDataSources(mitFilter(' BEL_3_8<9 '))[0].zeilenFilter).toBe(' BEL_3_8<9 ')
    expect(sanitizeDataSources(mitFilter(''))[0]).not.toHaveProperty('zeilenFilter')
    expect(sanitizeDataSources(mitFilter(42))[0]).not.toHaveProperty('zeilenFilter')
  })
})

// --- Hol-Relation (Welle R, 2026-08-11) ------------------------------------
describe('Hol-Relation: laden, verwerfen, Art-Bindung', () => {
  const holend = (ladeRelation: unknown) => [{
    id: 'pos', name: 'Positionen', kind: 'belegposition', fields: [], ladeRelation,
  }]
  const gueltig = {
    nr: '69', geberQuelleId: 'belege', belegartFeld: '2_1',
    belegnummerFeld: '3_8', jahrFeld: '0_1', archivFeld: '1_1',
    endeFelder: ['11_6', '18_25'],
  }

  it('eine gueltige Hol-Relation ueberlebt den Round-Trip', () => {
    const [q] = sanitizeDataSources(holend(gueltig))
    expect(q.ladeRelation).toEqual(gueltig)
  })

  it('eine kaputte wird verworfen UND gemeldet — die Quelle selbst bleibt', () => {
    // Ohne Geber-Quelle kann die Maske nie wissen, WELCHEN Satz sie holen
    // soll — so ein Eintrag darf nicht still weiterreisen (A4-Muster).
    const { liste, probleme } = pruefeDatenquellen(holend({ ...gueltig, geberQuelleId: '' }))
    expect(liste).toHaveLength(1)
    expect(liste[0].ladeRelation).toBeUndefined()
    expect(probleme.some((p) => p.grund.includes('Hol-Relation'))).toBe(true)
  })

  it('Jahr/Archiv duerfen leer sein (belegt: leer = aktueller Nummernkreis)', () => {
    const [q] = sanitizeDataSources(holend({ ...gueltig, jahrFeld: '', archivFeld: '' }))
    expect(q.ladeRelation?.jahrFeld).toBe('')
  })

  it('ladeRelationFor ist Art-gebunden: nach dem Art-Wechsel wirkt nichts mehr', () => {
    // Muster kopfsatzFor: der Wert bleibt in der Datei stehen, aber eine Art
    // ohne relationLadenMoeglich darf ihn nirgends wirken lassen.
    const quelle = { id: 'q', name: 'Q', kind: 'idb', fields: [], ladeRelation: gueltig } as unknown as DataSource
    expect(ladeRelationFor(quelle)).toBeNull()
    expect(ladeRelationFor({ ...quelle, kind: 'belegposition' })).toEqual(gueltig)
  })

  // R2: nur was ueber das 255er-Fenster HINAUSRAGT (pos+len > 255) kostet je
  // Position eine eigene Frage — ein Feld, das genau an der Kante endet
  // (250_5), schneidet getField noch aus dem SATZ. Sortiert fuer
  // deterministische Export-Bytes; Nicht-Feldcodes zaehlen nicht.
  it('felderHinterSchnitt: die Kante 255 entscheidet, sortiert, Fremdes faellt raus', () => {
    const benutzt = new Set(['280_12', '250_5', '250_6', '18_25', 'TFELD.Name'])
    expect(felderHinterSchnitt(benutzt)).toEqual(['250_6', '280_12'])
    expect(felderHinterSchnitt(undefined)).toEqual([])
  })
})

// Nachbesserung nach dem SE-Echttest 2026-08-12: die GEBER-Quelle muss die
// Schluesselfelder der Hol-Relation mitliefern. Sie standen bis dahin in
// keiner FELDER-Bestellung — SoftEngine schickte Jahr/Archiv also nie mit der
// angeklickten Zeile, die Parameter gingen LEER hinaus, und leer findet
// belegt nur den aktuellen Nummernkreis: 261er-Belege lieferten 255
// Leerzeichen, 262er lieferten Positionen.
describe('felderFor: der GEBER bestellt die Schluessel der Hol-Relation mit', () => {
  const belege: DataSource = {
    id: 'belege',
    name: 'Belege',
    kind: 'beleg',
    fields: [{ code: '3_8', label: 'Belegnummer' }],
  }

  it('haengt die fehlenden Schluessel ans Woerterbuch an — Woerterbuch zuerst', () => {
    // Modell-Reihenfolge belegart, belegnummer, jahr, archiv; 3_8 steht schon
    // im Woerterbuch und kommt nicht doppelt.
    expect(felderFor(belege, undefined, ['2_1', '3_8', '0_1', '1_1']))
      .toBe('3_8,2_1,0_1,1_1')
  })

  it('ohne Hol-Relation bleibt die Bestellung Byte fuer Byte, wie sie war', () => {
    expect(felderFor(belege)).toBe('3_8')
    expect(felderFor(belege, undefined, [])).toBe('3_8')
  })

  it("eine '*'-Quelle bleibt '*' — sie liefert ohnehin alles", () => {
    const idb: DataSource = { id: 'q', name: 'Termine', kind: 'idb', idbId: 'IDBID0001', fields: [] }
    expect(felderFor(idb, undefined, ['2_1', '0_1'])).toBe('*')
    expect(felderFor(idb, new Set<string>(), ['2_1', '0_1'])).toBe('*')
  })

  it('bei einer expliziten Liste stehen die Schluessel hinten, ohne Dopplung', () => {
    const idb: DataSource = {
      id: 'q',
      name: 'Termine',
      kind: 'idb',
      idbId: 'IDBID0001',
      fields: [{ code: '40_20', label: 'Titel' }, { code: '2_1', label: 'Art' }],
    }
    expect(felderFor(idb, new Set(['40_20', '2_1']), ['2_1', '0_1'])).toBe('40_20,2_1,0_1')
  })
})

// Hier stand bis 2026-07-30 eine Pruefung „Regel 3 im Startbestand:
// Technikwert ist nie der Anzeigename" ueber BUILTIN_DATA_SOURCES. Der
// Startbestand ist entfernt (Nutzer-Entscheidung: die Feldcodes einer
// einzelnen Installation gehoeren nicht in den Code) — damit hat die
// Pruefung kein Pruefobjekt mehr und faellt weg, statt sich ein neues zu
// suchen. Fuer die Daten des Bedieners erzwingt Regel 3 das Formular
// („Klarname darf kein Feldcode sein") und, beim Laden, der Test oben:
// ein Feld ohne label wird verworfen.

describe('Belegpositionen als eigene Art (2026-08-07)', () => {
  const art = artFuer('belegposition')

  it('bringt Datei-ID und Kopfsatz der echten Masken mit', () => {
    expect(art.tabellenId).toBe('POS')
    expect(art.kopfsatzMoeglich).toBe(true)
    expect(art.kopfsatzStandard).toBe('BEL_0_11')
  })

  it('die mitgebrachten Felder halten Regel 3 ein und sind eindeutig', () => {
    // Ein Klarname, der wie ein Feldcode aussieht, laeuft im Formular als
    // Fehler auf; zwei gleiche Codes ebenso. Beides waere hier ein Tippfehler
    // in einer Liste, die kein Bediener mehr durchsieht.
    expect(art.standardFelder.length).toBeGreaterThan(0)
    for (const f of art.standardFelder) {
      expect(f.code).toMatch(/^\d+_\d+$/)
      expect(f.label).not.toMatch(/^\d+_\d+$/)
      expect(f.label.trim()).not.toBe('')
    }
    const codes = art.standardFelder.map((f) => f.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('nur Arten mit fester Datei-ID bringen Felder mit', () => {
    // Feldpositionen im Code sind nur dort erlaubt, wo sie SoftEngine-Standard
    // sind (Regel 5). Eine eigene IDB-Tabelle hat in jeder Installation andere.
    expect(artFuer('idb').standardFelder).toEqual([])
    expect(artFuer('datei').standardFelder).toEqual([])
  })
})

describe('quellenKennung (dezente Technik-Marke, 2026-08-06)', () => {
  const quelle = (kind: DataSource['kind'], idbId?: string): DataSource => ({
    id: 'q', name: 'Quelle', kind, ...(idbId ? { idbId } : {}), fields: [],
  })

  it('IDB-Tabellen zeigen die Bediener-Kurzform', () => {
    expect(quellenKennung(quelle('idb', 'IDBID0001'))).toBe('ID0001')
  })

  it('Stammtabellen zeigen ihre feste Kennung', () => {
    expect(quellenKennung(quelle('adressstamm'))).toBe('ADR')
    expect(quellenKennung(quelle('beleg'))).toBe('BEL')
  })

  it('andere Dateien zeigen ihr Kuerzel woertlich; ohne Kennung bleibt es leer', () => {
    expect(quellenKennung(quelle('datei', 'POS'))).toBe('POS')
    expect(quellenKennung(quelle('idb'))).toBe('')
  })
})
