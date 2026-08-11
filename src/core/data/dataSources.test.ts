// Tests des Feld-Woerterbuchs.
//
// Der Kopfkommentar von dataSources.ts verwies schon lange auf diese Datei
// ("maschinell erzwungen in dataSources.test.ts") — es gab sie nie. Sie holt
// das nach, damit die Zusage nicht laenger nur Prosa ist.

import { describe, expect, it } from 'vitest'
import {
  artFuer,
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
