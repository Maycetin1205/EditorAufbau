// Tests der Seitengroesse — reine Rechnung, darum ohne DOM pruefbar.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import {
  linealTakte,
  PASSEND,
  passendeZeilen,
  proSeiteAusEinstellung,
  seitenAufteilung,
  ZEILEN_HOEHE,
} from './seitengroesse'

describe('proSeiteAusEinstellung', () => {
  it('uebersetzt die festen Zahlen', () => {
    expect(proSeiteAusEinstellung('10')).toBe(10)
    expect(proSeiteAusEinstellung('25')).toBe(25)
    expect(proSeiteAusEinstellung('50')).toBe(50)
  })

  it('„passend" heisst gemessen (null)', () => {
    expect(proSeiteAusEinstellung(PASSEND)).toBeNull()
  })

  it('faellt bei allem Unbekannten auf gemessen zurueck, nie auf eine erfundene Zahl', () => {
    // Ein Attribut aus einem alten Stand, von Hand verstellt oder leer: nie
    // ein Absturz, nie eine Zahl, die niemand gewaehlt hat. Besonders „1000"
    // waere gefaehrlich — das machte die Maske zu einer endlosen Seite.
    expect(proSeiteAusEinstellung('1000')).toBeNull()
    expect(proSeiteAusEinstellung('7')).toBeNull()
    expect(proSeiteAusEinstellung('')).toBeNull()
    expect(proSeiteAusEinstellung('viele')).toBeNull()
    expect(proSeiteAusEinstellung('-10')).toBeNull()
  })
})

describe('passendeZeilen', () => {
  it('rechnet den freien Rumpf in ganze Zeilen um', () => {
    // 300px Rumpf minus 32px Kopf = 268px frei -> 8 ganze Zeilen (8,375).
    expect(passendeZeilen(300, ZEILEN_HOEHE, ZEILEN_HOEHE)).toBe(8)
    // Genau aufgehend: 10 Zeilen plus Kopf.
    expect(passendeZeilen(ZEILEN_HOEHE * 11, ZEILEN_HOEHE, ZEILEN_HOEHE)).toBe(10)
  })

  it('rechnet mit dem UEBERGEBENEN Takt, nicht mit dem Grundtakt', () => {
    // Seit eine Bild-Spalte den Takt erhoeht (spaltenArten): derselbe Rumpf
    // fasst dann weniger Zeilen. Rechnete die Funktion weiter mit 32, stuenden
    // die letzten Zeilen unter dem Rand.
    expect(passendeZeilen(300, ZEILEN_HOEHE, 44)).toBe(6)
  })

  it('rundet ab — eine halb sichtbare Zeile ist keine Zeile', () => {
    expect(passendeZeilen(ZEILEN_HOEHE * 5 + ZEILEN_HOEHE - 1, ZEILEN_HOEHE, ZEILEN_HOEHE)).toBe(4)
  })

  it('liefert nie weniger als eine Zeile', () => {
    // Flacher als der Kopf (im Aufbau, waehrend das Raster noch zieht):
    // eine Seite mit null Zeilen zeigte gar nichts und liesse sich nicht
    // durchblaettern.
    expect(passendeZeilen(40, ZEILEN_HOEHE, ZEILEN_HOEHE)).toBe(1)
    expect(passendeZeilen(0, ZEILEN_HOEHE, ZEILEN_HOEHE)).toBe(1)
    expect(passendeZeilen(-100, ZEILEN_HOEHE, ZEILEN_HOEHE)).toBe(1)
  })
})

describe('linealTakte', () => {
  it('fuellt den Platz unter den Zeilen mit ganzen Takten', () => {
    // Zwoelf Zeilen passen, drei stehen da -> neun Takte Lineal.
    expect(linealTakte(12, 3)).toBe(9)
  })

  it('zeichnet unter einer VOLLEN Seite gar kein Lineal mehr', () => {
    // Der eigentliche Fehler (Nutzer 2026-08-07 und 2026-08-10): hier blieb
    // der angebrochene Rest-Takt von 2 bis 30 px uebrig, und das Lineal malte
    // seine Spaltentrenner hinein — eine Scheinzeile unter der letzten Zeile.
    expect(linealTakte(12, 12)).toBe(0)
  })

  it('geht nie ins Minus (mehr Zeilen als gemessen passen)', () => {
    // Feste Einstellung „25 pro Seite" in einer Tabelle, in die 12 passen:
    // der Rumpf scrollt, unter den Zeilen ist kein Platz mehr.
    expect(linealTakte(12, 25)).toBe(0)
  })

  it('haelt sich ohne Messung heraus', () => {
    // null = kein ResizeObserver bzw. keine vorgegebene Hoehe. Dann waere jede
    // Takt-Zahl geraten; das Lineal waechst wie bis 2026-08-10 mit.
    expect(linealTakte(null, 3)).toBeNull()
  })
})

describe('seitenAufteilung', () => {
  const frage = (mehr: Partial<Parameters<typeof seitenAufteilung>[0]> = {}) => seitenAufteilung({
    sichtbar: [0, 1, 2, 3, 4],
    hatQuelle: true,
    proSeite: 2,
    wunschSeite: 0,
    platzhalterZeilen: 4,
    ...mehr,
  })

  it('teilt die sichtbaren Zeilen auf Seiten', () => {
    expect(frage()).toEqual({ seiten: 3, seite: 0, zeilen: [0, 1] })
    expect(frage({ wunschSeite: 1 }).zeilen).toEqual([2, 3])
  })

  it('fuellt die letzte Seite NICHT mit leeren Zeilen auf (2026-08-06)', () => {
    // Fuenf Saetze, zwei pro Seite: die dritte Seite zeigt EINE Zeile.
    // Vorher stand daneben eine leere, die sich beim Ueberfahren hinterlegte
    // und beim Klick nichts tat — sie sah aus wie ein ladender Satz.
    expect(frage({ wunschSeite: 2 }).zeilen).toEqual([4])
    // Und gar keine Saetze heisst gar keine Zeilen (leerer Tag im Tagesfilter).
    expect(frage({ sichtbar: [] }).zeilen).toEqual([])
  })

  it('zeigt ohne Quelle die Platzhalter-Zeilen des Editors', () => {
    const ohne = frage({ hatQuelle: false, sichtbar: [] })
    expect(ohne.zeilen).toEqual([null, null, null, null])
    expect(ohne.seiten).toBe(1)
  })

  it('klemmt eine veraltete Seite in die Grenzen (geschrumpfter SE-Push)', () => {
    expect(frage({ wunschSeite: 99 }).seite).toBe(2)
    expect(frage({ wunschSeite: -5 }).seite).toBe(0)
    // Leere Menge: Seite 1 von 1, nicht "Seite 1 von 0".
    expect(frage({ sichtbar: [] }).seiten).toBe(1)
  })
})
