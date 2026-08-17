import { describe, expect, it } from 'vitest'
import { alsDatum, alsZahl, erkenneArt, sortiereIndizes, sortiereZeilen } from './sortierung'

const spalte0 = (zeilen: string[][]): string[] => zeilen.map((z) => z[0])

describe('Werte erkennen', () => {
  it('liest Zahlen — auch deutsch geschrieben', () => {
    expect(alsZahl('9')).toBe(9)
    expect(alsZahl('10')).toBe(10)
    expect(alsZahl('-12')).toBe(-12)
    expect(alsZahl('3,5')).toBe(3.5)
    expect(alsZahl('1.234')).toBe(1234)
    expect(alsZahl('1.234,56')).toBe(1234.56)
  })

  it('haelt Text von Zahlen fern', () => {
    expect(alsZahl('')).toBeNull()
    expect(alsZahl('Meier')).toBeNull()
    expect(alsZahl('12a')).toBeNull()
    expect(alsZahl('1-2')).toBeNull()
  })

  it('liest Datumsangaben in SE-Schreibweise', () => {
    expect(alsDatum('24.07.2026')).toBe(new Date(2026, 6, 24).getTime())
    expect(alsDatum('24.7.26')).toBe(new Date(2026, 6, 24).getTime())
    expect(alsDatum('2026-07-24')).toBe(new Date(2026, 6, 24).getTime())
  })

  it('weist unmoegliche Kalendertage ab (dann ist es Text)', () => {
    expect(alsDatum('32.07.2026')).toBeNull()
    expect(alsDatum('24.13.2026')).toBeNull()
    expect(alsDatum('irgendwas')).toBeNull()
  })

  it('erkennt die Spaltenart aus allen Werten', () => {
    expect(erkenneArt(['9', '10', '3'])).toBe('zahl')
    expect(erkenneArt(['24.07.2026', '01.01.2020'])).toBe('datum')
    expect(erkenneArt(['9', 'Meier'])).toBe('text')
    expect(erkenneArt(['9', '', '10'])).toBe('zahl')
    expect(erkenneArt(['', ''])).toBe('text')
  })
})

describe('Zeilen sortieren', () => {
  it('sortiert Zahlen numerisch — NICHT als Text (der eigentliche Bug)', () => {
    const zeilen = [['10'], ['9'], ['100'], ['2']]
    expect(spalte0(sortiereZeilen(zeilen, 0, true))).toEqual(['2', '9', '10', '100'])
    expect(spalte0(sortiereZeilen(zeilen, 0, false))).toEqual(['100', '10', '9', '2'])
  })

  it('sortiert Datumsangaben zeitlich, nicht alphabetisch', () => {
    const zeilen = [['01.12.2025'], ['24.07.2026'], ['02.01.2026']]
    expect(spalte0(sortiereZeilen(zeilen, 0, true))).toEqual([
      '01.12.2025', '02.01.2026', '24.07.2026',
    ])
  })

  it('sortiert Text deutsch und natuerlich', () => {
    const zeilen = [['Zeta'], ['Ärger'], ['apfel'], ['Pos 10'], ['Pos 2']]
    expect(spalte0(sortiereZeilen(zeilen, 0, true))).toEqual([
      'apfel', 'Ärger', 'Pos 2', 'Pos 10', 'Zeta',
    ])
  })

  it('haengt leere Zellen immer unten an — in BEIDEN Richtungen', () => {
    const zeilen = [['b'], [''], ['a']]
    expect(spalte0(sortiereZeilen(zeilen, 0, true))).toEqual(['a', 'b', ''])
    expect(spalte0(sortiereZeilen(zeilen, 0, false))).toEqual(['b', 'a', ''])
  })

  it('ist stabil: gleiche Werte behalten ihre Reihenfolge', () => {
    const zeilen = [['a', 'erst'], ['a', 'zweit'], ['a', 'dritt']]
    expect(sortiereZeilen(zeilen, 0, true).map((z) => z[1])).toEqual(['erst', 'zweit', 'dritt'])
  })

  it('laesst die Eingabe unangetastet', () => {
    const zeilen = [['b'], ['a']]
    sortiereZeilen(zeilen, 0, true)
    expect(spalte0(zeilen)).toEqual(['b', 'a'])
  })

  it('vertraegt fehlende Zellen und ungueltige Spalten', () => {
    expect(sortiereZeilen([['a'], []], 0, true)).toHaveLength(2)
    expect(spalte0(sortiereZeilen([['b'], ['a']], -1, true))).toEqual(['b', 'a'])
    expect(sortiereZeilen([], 0, true)).toEqual([])
  })
})

describe('sortiereIndizes (Zeilen-Identitaet fuer die Auswahl, 2026-08-05)', () => {
  const zeilen = [['10'], ['9'], [''], ['2']]

  it('liefert die Reihenfolge als ROHINDIZES — Leeres ans Ende', () => {
    expect(sortiereIndizes(zeilen, 0, true)).toEqual([3, 1, 0, 2])
    expect(sortiereIndizes(zeilen, 0, false)).toEqual([0, 1, 3, 2])
  })

  it('ungueltige Spalte = urspruengliche Reihenfolge', () => {
    expect(sortiereIndizes(zeilen, -1, true)).toEqual([0, 1, 2, 3])
  })

  it('sortiereZeilen ist exakt die Werte-Form derselben Logik', () => {
    expect(sortiereZeilen(zeilen, 0, true))
      .toEqual(sortiereIndizes(zeilen, 0, true).map((i) => zeilen[i]))
  })
})
