// Tests des Feld-Woerterbuchs.
//
// Der Kopfkommentar von dataSources.ts verwies schon lange auf diese Datei
// ("maschinell erzwungen in dataSources.test.ts") — es gab sie nie. Sie holt
// das nach, damit die Zusage nicht laenger nur Prosa ist.

import { describe, expect, it } from 'vitest'
import {
  BUILTIN_DATA_SOURCES,
  sanitizeDataSources,
} from './dataSources'

const FELDCODE = /^\d+_\d+$/

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

describe('Regel 3 im Startbestand: Technikwert ist nie der Anzeigename', () => {
  it.each(BUILTIN_DATA_SOURCES.map((s) => [s.name, s] as const))('%s', (_name, source) => {
    for (const f of source.fields) {
      expect(f.label, `${f.code} traegt einen Feldcode als Klarname`).not.toMatch(FELDCODE)
      expect(f.label.trim()).not.toBe('')
    }
  })
})
