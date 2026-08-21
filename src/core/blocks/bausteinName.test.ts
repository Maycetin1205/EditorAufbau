import { describe, expect, it } from 'vitest'
import { eigenerText } from './bausteinName'

describe('eigenerText', () => {
  it('liefert leer, wenn der Baustein keine Namens-Eigenschaft nennt', () => {
    expect(eigenerText([], { placeholder: 'Vorname' })).toBe('')
  })

  it('nimmt den Platzhalter des Formularfelds als Eigennamen', () => {
    expect(eigenerText(['placeholder'], { placeholder: 'Vorname' })).toBe('Vorname')
  })

  it('behandelt einen unveränderten Default-Text NICHT als Eigennamen', () => {
    expect(eigenerText(['placeholder'], { placeholder: 'Feldname' }, { placeholder: 'Feldname' }))
      .toBe('')

    expect(eigenerText(['placeholder'], { placeholder: 'Vorname' }, { placeholder: 'Feldname' }))
      .toBe('Vorname')
  })

  it('nimmt die erste gefüllte Eigenschaft in der genannten Reihenfolge', () => {
    expect(eigenerText(['heading', 'text'], { heading: 'Titel', text: 'Zeile' })).toBe('Titel')
    expect(eigenerText(['heading', 'text'], { heading: '', text: 'Zeile' })).toBe('Zeile')
  })

  it('kürzt sehr lange Texte', () => {
    const lang = 'Dies ist ein ausgesprochen langer Beispieltext'
    expect(eigenerText(['text'], { text: lang })).toBe(`${lang.slice(0, 27)}…`)
  })
})
