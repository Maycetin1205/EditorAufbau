// tierIcon-Tests — welcher Datenwert welches Tierzeichen bekommt.
//
// Geprueft wird tierBildName, also die ENTSCHEIDUNG, nicht das Zeichnen: der
// Datenwert aus SoftEngine ist Freitext („Rosetten-Meerschweinchen",
// „Griechische Landschildkroete"), und die Reihenfolge der Schluesselwoerter
// ist Teil der Regel. Genau daran kann eine spaetere Ergaenzung leise etwas
// kaputt machen — ein zu frueh eingefuegtes kurzes Wort faengt Werte weg, die
// einem spezifischeren gehoeren.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import { tierBildName } from './tierIcon'
import { TIER_BILDER } from './tierBilder'

describe('tierBildName', () => {
  it('trifft die zehn Arten an echten Freitext-Werten', () => {
    // Die Werte stammen aus der Patientenliste des Musterbogens bzw. sind
    // typische SoftEngine-Eintraege — Gross-/Kleinschreibung egal.
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
    // Meerschweinchen ist KEIN Hamster mehr (bis 2026-08-06 fiel es darauf).
    expect(tierBildName('Meerschweinchen')).not.toBe('hamster')
    // Die Schildkroete gewinnt gegen den Reptil-Rueckfall; Echse und Gecko
    // haben kein eigenes Bild und nehmen bewusst das der Schlange.
    expect(tierBildName('Schildkroete')).toBe('schildkroete')
    expect(tierBildName('Leopardgecko')).toBe('schlange')
    expect(tierBildName('Bartagame (Echse)')).toBe('schlange')
  })

  it('gibt fuer Unbekanntes nichts zurueck — das ist der Pfoten-Fall', () => {
    // Leer bedeutet: kein Bild. Der Aufrufer zeichnet dann die Pfote. Wichtig
    // ist, dass hier NICHT irgendein Tier herauskommt (Regel 7).
    expect(tierBildName('Frettchen')).toBe('')
    expect(tierBildName('')).toBe('')
    expect(tierBildName('12345')).toBe('')
  })

  it('jeder genannte Bildname existiert auch wirklich', () => {
    // Der Vertrag zwischen Liste und Bildern: ein Tippfehler im Namen ergaebe
    // sonst still die Pfote, obwohl ein Bild da ist.
    const arten = ['hund', 'katze', 'kaninchen', 'hamster', 'meerschweinchen',
      'vogel', 'schildkroete', 'fisch', 'schlange', 'pferd']
    for (const art of arten) {
      expect(TIER_BILDER[art], `Bild fehlt: ${art}`).toMatch(/^data:image\/png;base64,/)
    }
    // Und andersherum: kein eingebettetes Bild ist unerreichbar.
    expect(Object.keys(TIER_BILDER).sort()).toEqual([...arten].sort())
  })
})
