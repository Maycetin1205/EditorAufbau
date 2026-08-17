import { describe, expect, it } from 'vitest'
import {
  MAX_SCHLUESSELPAARE,
  paarKlartext,
  quellenAufloesen,
  vollstaendigePaare,
  weitereQuellenAus,
  type BausteinQuelle,
} from './sourceLinks'
import type { DataSource } from './dataSources'

describe('vollstaendigePaare', () => {
  it('laesst halbe Paare weg — ein halbes Paar traefe alles oder nichts', () => {
    const traeger = { keyPairs: [
      { fromField: '2_8', toField: '10_8' },
      { fromField: '3_4', toField: '' },
      { fromField: '', toField: '5_2' },
    ] }
    expect(vollstaendigePaare(traeger)).toEqual([{ fromField: '2_8', toField: '10_8' }])
  })
})

const quelle = (id: string, felder: string[]): DataSource => ({
  id,
  name: id,
  kind: 'idb',
  fields: felder.map((c) => ({ code: c, label: `Feld ${c}` })),
})

const bibliothek: DataSource[] = [
  quelle('terminplaner', ['10_8', '78_30']),
  quelle('kundenhaustiere', ['10_8', '128_350']),
  quelle('artikel', ['20_8']),
]

const weitere = (over: Partial<BausteinQuelle> = {}): BausteinQuelle => ({
  quelleId: 'kundenhaustiere',
  keyPairs: [{ fromField: '10_8', toField: '10_8' }],
  ...over,
})

describe('quellenAufloesen', () => {
  it('liefert die erste Quelle auch ohne weitere', () => {
    const raus = quellenAufloesen('terminplaner', [], bibliothek)
    expect(raus.map((q) => q.source.id)).toEqual(['terminplaner'])

    expect(raus[0].paare).toBeUndefined()
  })

  it('haengt die weiteren in Listen-Reihenfolge an (deterministisch)', () => {
    const raus = quellenAufloesen('terminplaner', [
      weitere({ quelleId: 'artikel', keyPairs: [{ fromField: '10_8', toField: '20_8' }] }),
      weitere(),
    ], bibliothek)
    expect(raus.map((q) => q.source.id)).toEqual(['terminplaner', 'artikel', 'kundenhaustiere'])
  })

  it('ohne erste Quelle gibt es gar nichts — die weiteren haetten keinen Bezug', () => {
    expect(quellenAufloesen('', [weitere()], bibliothek)).toEqual([])
  })

  it('laesst Halbfertiges aus, statt damit zu verbinden', () => {
    const halb = weitere({ keyPairs: [{ fromField: '10_8', toField: '' }] })
    expect(quellenAufloesen('terminplaner', [halb], bibliothek).map((q) => q.source.id))
      .toEqual(['terminplaner'])
  })

  it('laesst eine geloeschte Quelle aus (der Preflight meldet sie)', () => {
    const weg = weitere({ quelleId: 'gibtsnicht' })
    expect(quellenAufloesen('terminplaner', [weg], bibliothek).map((q) => q.source.id))
      .toEqual(['terminplaner'])
  })

  it('nimmt dieselbe Quelle nur EINMAL — auch nicht als Kopie der ersten', () => {
    const raus = quellenAufloesen('terminplaner', [
      weitere({ quelleId: 'terminplaner' }),
      weitere(),
      weitere(),
    ], bibliothek)
    expect(raus.map((q) => q.source.id)).toEqual(['terminplaner', 'kundenhaustiere'])
  })

  it('wirft bei Muell nicht, sondern liefert nur die erste', () => {
    expect(quellenAufloesen('terminplaner', 'kaputt', bibliothek).map((q) => q.source.id))
      .toEqual(['terminplaner'])
  })
})

describe('weitereQuellenAus', () => {
  it('schneidet ueberzaehlige Schluesselpaare ab, statt den Eintrag zu verwerfen', () => {
    const viele = weitere({
      keyPairs: Array.from({ length: MAX_SCHLUESSELPAARE + 2 }, () => ({ fromField: 'a', toField: 'b' })),
    })
    expect(weitereQuellenAus([viele])[0].keyPairs).toHaveLength(MAX_SCHLUESSELPAARE)
  })

  it('ueberspringt Kaputtes, ohne zu werfen', () => {
    expect(weitereQuellenAus([null, 'text', { quelleId: 42 }, weitere()])).toHaveLength(1)
    expect(weitereQuellenAus(undefined)).toEqual([])
  })
})

describe('paarKlartext', () => {
  const erste = bibliothek[0]

  it('nennt Klarnamen der ersten Quelle, nie Feldcodes', () => {
    expect(paarKlartext([{ fromField: '10_8', toField: '10_8' }], erste)).toBe('Feld 10_8')
  })

  it('verbindet mehrere Schluesselfelder', () => {
    expect(paarKlartext(
      [{ fromField: '10_8', toField: '10_8' }, { fromField: '78_30', toField: '128_350' }],
      erste,
    )).toBe('Feld 10_8 + Feld 78_30')
  })

  it('laesst einen Code ohne Klarnamen aus, statt ihn durchschlagen zu lassen', () => {
    expect(paarKlartext([{ fromField: 'unbekannt', toField: 'x' }], erste)).toBe('')
    expect(paarKlartext([{ fromField: '10_8', toField: 'x' }], undefined)).toBe('')
  })
})
