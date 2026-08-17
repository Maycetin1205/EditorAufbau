import { describe, expect, it } from 'vitest'
import { bindungMitQuelle, zerlegeBindung } from './BlockDefinition'

describe('bindungMitQuelle', () => {
  it('laesst die erste Quelle unqualifiziert', () => {
    expect(bindungMitQuelle('', '128_350')).toBe('128_350')
  })

  it('setzt die Quellen-Vorsilbe davor', () => {
    expect(bindungMitQuelle('kundenhaustiere', '128_350')).toBe('kundenhaustiere::128_350')
  })

  it('macht aus „nicht gebunden" keine halbe Angabe', () => {
    expect(bindungMitQuelle('kundenhaustiere', '')).toBe('')
    expect(bindungMitQuelle('', '')).toBe('')
  })
})

describe('zerlegeBindung', () => {
  it('liest einen nackten Feldcode als erste Quelle', () => {
    expect(zerlegeBindung('128_350')).toEqual({ quelleId: '', code: '128_350' })
  })

  it('liest die qualifizierte Form', () => {
    expect(zerlegeBindung('kundenhaustiere::128_350'))
      .toEqual({ quelleId: 'kundenhaustiere', code: '128_350' })
  })

  it('faellt bei Mehrdeutigem auf „nackter Code" zurueck, statt zu raten', () => {
    for (const kaputt of ['a::b::c', '::x', 'x::', '::']) {
      expect(zerlegeBindung(kaputt)).toEqual({ quelleId: '', code: kaputt })
    }
  })

  it('wirft nie — auch nicht bei leer', () => {
    expect(zerlegeBindung('')).toEqual({ quelleId: '', code: '' })
  })

  it('ist die Umkehrung von bindungMitQuelle', () => {
    const wert = bindungMitQuelle('artikel', '10_8')
    expect(zerlegeBindung(wert)).toEqual({ quelleId: 'artikel', code: '10_8' })
  })
})
