import { afterEach, describe, expect, it } from 'vitest'
import { macheFeldLeser } from './fremdeQuellen'

class FakeEl {
  private readonly attrs: Record<string, string>
  constructor(attrs: Record<string, string>) { this.attrs = attrs }
  getAttribute(name: string): string | null { return this.attrs[name] ?? null }
}

function el(weitere: unknown): HTMLElement {
  return new FakeEl(
    weitere === undefined ? {} : { weiterequellen: JSON.stringify(weitere) },
  ) as unknown as HTMLElement
}

const EINE_VERBINDUNG = [{
  quelleId: 'tiere',
  keyPairs: [{ fromField: '10_8', toField: '10_8' }],
}]

function setzeDaten(tierZeilen: unknown[]): void {
  Object.assign(globalThis, {
    FF_DATA_SOURCES: [
      { id: 'termine', name: 'Terminplaner', tableId: 'IDBID0001', indexField: '0_10' },
      { id: 'tiere', name: 'Kundenhaustiere', tableId: 'IDBID0004', indexField: '' },
    ],
    SEDATA: {
      Daten: {
        SEFileLoop: [
          { ALIAS: 'Terminplaner', Zeilen: [{ '10_8': '41', '78_30': 'Minka' }] },
          { ALIAS: 'Kundenhaustiere', Zeilen: tierZeilen },
        ],
      },
    },
  })
}

afterEach(() => {
  delete (globalThis as Record<string, unknown>).FF_DATA_SOURCES
  delete (globalThis as Record<string, unknown>).SEDATA
})

describe('macheFeldLeser', () => {
  it('holt den Wert aus der Partnerzeile der weiteren Quelle', () => {
    setzeDaten([
      { '10_8': '7', '128_350': 'falsche Zeile' },
      { '10_8': '41', '128_350': 'Vertraegt kein Narkosemittel' },
    ])
    const lies = macheFeldLeser(el(EINE_VERBINDUNG))
    const zeile = { '10_8': '41', '78_30': 'Minka' }
    expect(lies(zeile, 'tiere::128_350')).toBe('Vertraegt kein Narkosemittel')
  })

  it('liest ein Feld ohne Vorsilbe weiter aus der eigenen Zeile', () => {
    setzeDaten([{ '10_8': '41', '128_350': 'Notiz' }])
    const lies = macheFeldLeser(el(EINE_VERBINDUNG))
    expect(lies({ '10_8': '41', '78_30': 'Minka' }, '78_30')).toBe('Minka')
  })

  it('KEIN Partner -> leerer Wert (die Zeile bleibt stehen)', () => {
    setzeDaten([{ '10_8': '99', '128_350': 'anderer Kunde' }])
    const lies = macheFeldLeser(el(EINE_VERBINDUNG))
    expect(lies({ '10_8': '41' }, 'tiere::128_350')).toBe('')
  })

  it('leerer Schluesselwert trifft NICHT die Zeilen mit derselben Luecke', () => {
    setzeDaten([{ '10_8': '', '128_350': 'darf nicht gefunden werden' }])
    const lies = macheFeldLeser(el(EINE_VERBINDUNG))
    expect(lies({ '10_8': '' }, 'tiere::128_350')).toBe('')
  })

  it('bei mehreren Schluesselfeldern muessen ALLE passen', () => {
    Object.assign(globalThis, {
      FF_DATA_SOURCES: [{ id: 'tiere', name: 'Kundenhaustiere', tableId: 'IDBID0004', indexField: '' }],
      SEDATA: {
        Daten: {
          SEFileLoop: [{
            ALIAS: 'Kundenhaustiere',
            Zeilen: [
              { '10_8': '41', '20_4': '2025', '128_350': 'altes Jahr' },
              { '10_8': '41', '20_4': '2026', '128_350': 'richtig' },
            ],
          }],
        },
      },
    })
    const lies = macheFeldLeser(el([{
      quelleId: 'tiere',
      keyPairs: [
        { fromField: '10_8', toField: '10_8' },
        { fromField: '30_4', toField: '20_4' },
      ],
    }]))
    expect(lies({ '10_8': '41', '30_4': '2026' }, 'tiere::128_350')).toBe('richtig')
    expect(lies({ '10_8': '41', '30_4': '2027' }, 'tiere::128_350')).toBe('')
  })

  it('mehrteilige Schluessel verrutschen nicht (AB+C ist nicht A+BC)', () => {
    Object.assign(globalThis, {
      FF_DATA_SOURCES: [{ id: 'tiere', name: 'Kundenhaustiere', tableId: 'IDBID0004', indexField: '' }],
      SEDATA: {
        Daten: {
          SEFileLoop: [{
            ALIAS: 'Kundenhaustiere',
            Zeilen: [{ a: 'AB', b: 'C', '128_350': 'Treffer AB|C' }],
          }],
        },
      },
    })
    const lies = macheFeldLeser(el([{
      quelleId: 'tiere',
      keyPairs: [{ fromField: 'a', toField: 'a' }, { fromField: 'b', toField: 'b' }],
    }]))
    expect(lies({ a: 'AB', b: 'C' }, 'tiere::128_350')).toBe('Treffer AB|C')
    expect(lies({ a: 'A', b: 'BC' }, 'tiere::128_350')).toBe('')
  })

  it('doppelte Schluessel: die ERSTE Zeile gewinnt (deterministisch)', () => {
    setzeDaten([
      { '10_8': '41', '128_350': 'erste' },
      { '10_8': '41', '128_350': 'zweite' },
    ])
    const lies = macheFeldLeser(el(EINE_VERBINDUNG))
    expect(lies({ '10_8': '41' }, 'tiere::128_350')).toBe('erste')
  })

  it('unbekannte Quelle -> leer statt Absturz', () => {
    setzeDaten([{ '10_8': '41', '128_350': 'Notiz' }])
    const lies = macheFeldLeser(el([{
      quelleId: 'gibtsnicht',
      keyPairs: [{ fromField: '10_8', toField: '10_8' }],
    }]))
    expect(lies({ '10_8': '41' }, 'gibtsnicht::128_350')).toBe('')
  })

  it('ohne Attribut und bei kaputtem JSON bleibt der einfache Weg', () => {
    setzeDaten([])
    const zeile = { '78_30': 'Minka' }
    expect(macheFeldLeser(el(undefined))(zeile, '78_30')).toBe('Minka')
    const kaputt = new FakeEl({ weiterequellen: '{nicht json' }) as unknown as HTMLElement
    expect(macheFeldLeser(kaputt)(zeile, '78_30')).toBe('Minka')
  })
})
