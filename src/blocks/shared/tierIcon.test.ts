import { describe, expect, it } from 'vitest'
import { tierBildName } from './tierIcon'
import { TIER_BILDER } from '../../core/data/tierBilder'

describe('tierBildName', () => {
  it('trifft die zehn Arten an echten Freitext-Werten', () => {
    expect(tierBildName('Hund')).toBe('hund')
    expect(tierBildName('Labrador-Welpe')).toBe('hund')
    expect(tierBildName('Europaeisch Kurzhaar-Katze')).toBe('katze')
    expect(tierBildName('Kater')).toBe('katze')
    expect(tierBildName('Zwergkaninchen')).toBe('kaninchen')
    expect(tierBildName('Rosetten-Meerschweinchen')).toBe('meerschweinchen')
    expect(tierBildName('Goldhamster')).toBe('hamster')
    expect(tierBildName('Wellensittich')).toBe('vogel')
    expect(tierBildName('Griechische Landschildkroete')).toBe('schildkroete')
    expect(tierBildName('Kornnatter')).toBe('schlange')
    expect(tierBildName('Goldfisch')).toBe('fisch')
    expect(tierBildName('Shetlandpony')).toBe('pferd')
  })

  it('haelt die Reihenfolge, an der die Zuordnung haengt', () => {
    expect(tierBildName('Meerschweinchen')).not.toBe('hamster')

    expect(tierBildName('Schildkroete')).toBe('schildkroete')
    expect(tierBildName('Leopardgecko')).toBe('schlange')
    expect(tierBildName('Bartagame (Echse)')).toBe('schlange')
  })

  it('gibt fuer Unbekanntes nichts zurueck — das ist der Pfoten-Fall', () => {
    expect(tierBildName('Frettchen')).toBe('')
    expect(tierBildName('')).toBe('')
    expect(tierBildName('12345')).toBe('')
  })

  it('jeder genannte Bildname existiert auch wirklich', () => {
    const arten = ['hund', 'katze', 'kaninchen', 'hamster', 'meerschweinchen',
      'vogel', 'schildkroete', 'fisch', 'schlange', 'pferd']
    for (const art of arten) {
      expect(TIER_BILDER[art], `Bild fehlt: ${art}`).toMatch(/^data:image\/png;base64,/)
    }

    expect(Object.keys(TIER_BILDER).sort()).toEqual([...arten].sort())
  })
})
