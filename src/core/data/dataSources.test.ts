// Tests des Feld-Woerterbuchs.
//
// Der Kopfkommentar von dataSources.ts verwies schon lange auf diese Datei
// ("maschinell erzwungen in dataSources.test.ts") — es gab sie nie. Sie holt
// das nach, damit die Zusage nicht laenger nur Prosa ist.

import { describe, expect, it } from 'vitest'
import { quellenKennung, sanitizeDataSources, type DataSource } from './dataSources'

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

// Hier stand bis 2026-07-30 eine Pruefung „Regel 3 im Startbestand:
// Technikwert ist nie der Anzeigename" ueber BUILTIN_DATA_SOURCES. Der
// Startbestand ist entfernt (Nutzer-Entscheidung: die Feldcodes einer
// einzelnen Installation gehoeren nicht in den Code) — damit hat die
// Pruefung kein Pruefobjekt mehr und faellt weg, statt sich ein neues zu
// suchen. Fuer die Daten des Bedieners erzwingt Regel 3 das Formular
// („Klarname darf kein Feldcode sein") und, beim Laden, der Test oben:
// ein Feld ohne label wird verworfen.

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
