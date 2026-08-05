import { describe, expect, it } from 'vitest'
import { eigenerText } from './bausteinName'

describe('eigenerText', () => {
  it('liefert leer ohne Eigentext-Prop', () => {
    expect(eigenerText({ fieldType: 'text' })).toBe('')
  })

  it('nimmt den Platzhalter des Formularfelds als Eigennamen', () => {
    expect(eigenerText({ placeholder: 'Vorname' })).toBe('Vorname')
  })

  it('behandelt einen unveränderten Default-Text NICHT als Eigennamen', () => {
    // Frisches Formularfeld: Platzhalter noch = Default „Feldname".
    expect(eigenerText({ placeholder: 'Feldname' }, { placeholder: 'Feldname' })).toBe('')
    // Umbenannt → wieder ein Eigenname.
    expect(eigenerText({ placeholder: 'Vorname' }, { placeholder: 'Feldname' })).toBe('Vorname')
  })

  it('bevorzugt label vor placeholder (Reihenfolge)', () => {
    expect(eigenerText({ label: 'Speichern', placeholder: 'Feldname' })).toBe('Speichern')
  })

  it('kürzt sehr lange Texte', () => {
    const lang = 'Dies ist ein ausgesprochen langer Beispieltext'
    expect(eigenerText({ text: lang })).toBe(`${lang.slice(0, 27)}…`)
  })
})
