// Tests der Auswahl-Folge (defensiver Leser + Brauchbarkeits-Regel).

import { describe, expect, it } from 'vitest'
import { auswahlFolgenAus, folgeBrauchbar } from './auswahlFolge'

describe('auswahlFolgenAus (kaputter Speicher darf nie den Start blockieren)', () => {
  it('liest eine gueltige Folge', () => {
    const roh = [{ geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '3_8' }] }]
    expect(auswahlFolgenAus(roh)).toEqual(roh)
  })

  it('behaelt halbe Paare (der Bediener tippt gerade) — nur Strukturkaputtes faellt weg', () => {
    const raus = auswahlFolgenAus([
      { geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '' }] },
      { geberId: 42 },
      'quatsch',
      null,
      { geberId: 'g2', keyPairs: 'keine-liste' },
    ])
    expect(raus).toEqual([
      { geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '' }] },
      { geberId: 'g2', keyPairs: [] },
    ])
  })

  it('deckelt die Paare auf die gemeinsame Obergrenze (drei, wie sourceLinks)', () => {
    const paar = { fromField: 'a', toField: 'b' }
    const [f] = auswahlFolgenAus([{ geberId: 'g', keyPairs: [paar, paar, paar, paar, paar] }])
    expect(f.keyPairs).toHaveLength(3)
  })

  it('alles Nicht-Listenfoermige ergibt eine leere Liste', () => {
    expect(auswahlFolgenAus(undefined)).toEqual([])
    expect(auswahlFolgenAus('quatsch')).toEqual([])
    expect(auswahlFolgenAus({})).toEqual([])
  })
})

describe('folgeBrauchbar', () => {
  it('brauchbar = Geber genannt UND ein vollstaendiges Paar', () => {
    expect(folgeBrauchbar({ geberId: 'g', keyPairs: [{ fromField: 'a', toField: 'b' }] })).toBe(true)
    expect(folgeBrauchbar({ geberId: '', keyPairs: [{ fromField: 'a', toField: 'b' }] })).toBe(false)
    expect(folgeBrauchbar({ geberId: 'g', keyPairs: [{ fromField: 'a', toField: ' ' }] })).toBe(false)
    expect(folgeBrauchbar({ geberId: 'g', keyPairs: [] })).toBe(false)
  })
})
