// Tests der Tabellen-Inhaltssuche.
// Der Bediener tippt und erwartet Windows-Verhalten: Gross/Klein egal,
// mehrere Woerter sind ein UND, leere Eingabe blendet nie etwas aus.

import { describe, expect, it } from 'vitest'
import { filtereZeilen, zeilePasst } from './suche'

const zeilen = [
  ['Meier', 'Hund', '24.07.2026'],
  ['Schmidt', 'Katze', '01.12.2025'],
  ['meier-lang', 'Katze', '02.01.2026'],
  ['Özdemir', 'Vogel', ''],
]

const namen = (z: string[][]): string[] => z.map((r) => r[0])

describe('zeilePasst', () => {
  it('findet unabhaengig von Gross- und Kleinschreibung', () => {
    expect(zeilePasst(zeilen[0], 'meier')).toBe(true)
    expect(zeilePasst(zeilen[0], 'MEIER')).toBe(true)
  })

  it('findet den Text in JEDER Spalte, nicht nur der ersten', () => {
    expect(zeilePasst(zeilen[0], 'hund')).toBe(true)
    expect(zeilePasst(zeilen[0], '2026')).toBe(true)
  })

  it('verbindet mehrere Woerter mit UND — auch ueber Spalten hinweg', () => {
    // "meier" steht in Spalte 1, "2026" in Spalte 3.
    expect(zeilePasst(zeilen[0], 'meier 2026')).toBe(true)
    // "meier" ja, "katze" nein -> faellt raus.
    expect(zeilePasst(zeilen[0], 'meier katze')).toBe(false)
  })

  it('laesst bei leerer Eingabe alles durch', () => {
    expect(zeilePasst(zeilen[0], '')).toBe(true)
    expect(zeilePasst(zeilen[0], '   ')).toBe(true)
  })

  it('vertraegt Umlaute und leere Zellen', () => {
    expect(zeilePasst(zeilen[3], 'özdemir')).toBe(true)
    expect(zeilePasst(zeilen[3], 'ÖZ')).toBe(true)
  })
})

describe('filtereZeilen', () => {
  it('filtert auf die passenden Zeilen', () => {
    expect(namen(filtereZeilen(zeilen, 'katze'))).toEqual(['Schmidt', 'meier-lang'])
  })

  it('findet Teiltreffer mitten im Wort', () => {
    expect(namen(filtereZeilen(zeilen, 'meier'))).toEqual(['Meier', 'meier-lang'])
  })

  it('gibt bei leerer Suche ALLES zurueck', () => {
    expect(filtereZeilen(zeilen, '')).toHaveLength(4)
    expect(filtereZeilen(zeilen, '  ')).toHaveLength(4)
  })

  it('gibt bei keinem Treffer eine leere Liste zurueck', () => {
    expect(filtereZeilen(zeilen, 'gibtsnicht')).toEqual([])
  })

  it('laesst die Eingabe unangetastet', () => {
    const eingabe = [['a'], ['b']]
    filtereZeilen(eingabe, 'a')
    expect(eingabe).toHaveLength(2)
  })
})
