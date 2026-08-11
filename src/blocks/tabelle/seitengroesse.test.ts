// Tests der Seitengroesse — reine Rechnung, darum ohne DOM pruefbar.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import {
  linealTakte,
  passendeZeilen,
  seitenAufteilung,
  ZEILEN_HOEHE,
  zeilenmass,
} from './seitengroesse'

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

describe('zeilenmass', () => {
  it('verteilt den Rest auf die Zeilen, sodass sie den Rumpf genau ausfuellen', () => {
    // 300px Rumpf minus 32px Kopf = 268px frei. Acht Zeilen a 32 = 256, es
    // blieben 12px uebrig — genau der Streifen, der den Nutzer stoert. Verteilt
    // sind es 268/8 = 33,5px je Zeile, und 8 * 33,5 = 268: kein Rest.
    const mass = zeilenmass(300, ZEILEN_HOEHE, ZEILEN_HOEHE)
    expect(mass.passen).toBe(8)
    expect(mass.zeilenHoehe).toBe(33.5)
    expect(mass.passen * mass.zeilenHoehe).toBe(268)
  })

  it('aendert die ANZAHL nicht — gezaehlt wird weiter mit dem Takt', () => {
    // Sonst liefe die Rechnung ihrem eigenen Ergebnis nach: hoehere Zeile,
    // weniger Zeilen, noch hoehere Zeile.
    for (const rumpf of [300, 301, 320, 331]) {
      expect(zeilenmass(rumpf, ZEILEN_HOEHE, ZEILEN_HOEHE).passen)
        .toBe(passendeZeilen(rumpf, ZEILEN_HOEHE, ZEILEN_HOEHE))
    }
  })

  it('laesst eine genau aufgehende Tabelle unberuehrt', () => {
    // Elf Takte Rumpf = Kopf + zehn Zeilen: es gibt keinen Rest zu verteilen.
    expect(zeilenmass(ZEILEN_HOEHE * 11, ZEILEN_HOEHE, ZEILEN_HOEHE))
      .toEqual({ passen: 10, zeilenHoehe: ZEILEN_HOEHE })
  })

  it('verteilt nichts, wenn nicht einmal ein ganzer Takt hineinpasst', () => {
    // Sonst schrumpfte die einzige Zeile auf die Resthoehe — eine 8px-Zeile ist
    // schlimmer als eine, die unten anstoesst.
    expect(zeilenmass(40, ZEILEN_HOEHE, ZEILEN_HOEHE))
      .toEqual({ passen: 1, zeilenHoehe: ZEILEN_HOEHE })
    expect(zeilenmass(0, ZEILEN_HOEHE, ZEILEN_HOEHE))
      .toEqual({ passen: 1, zeilenHoehe: ZEILEN_HOEHE })
  })

  it('rundet die Zeilenhoehe ab, nie auf', () => {
    // 297 - 32 = 265 frei, 8 Zeilen -> 33,125px. Aufgerundet waeren 8 Zeilen
    // 265,04px hoch, also einen Hauch hoeher als der Rumpf: das gibt eine
    // senkrechte Scrollleiste, die die Breite aendert, die Messung neu anstoesst
    // und die Tabelle zwischen zwei Zeilenzahlen zappeln laesst.
    const mass = zeilenmass(297, ZEILEN_HOEHE, ZEILEN_HOEHE)
    expect(mass.zeilenHoehe).toBe(33.12)
    expect(mass.passen * mass.zeilenHoehe).toBeLessThanOrEqual(265)
  })

  it('rechnet mit dem uebergebenen Takt (Bild-Spalte erhoeht ihn)', () => {
    const mass = zeilenmass(300, ZEILEN_HOEHE, 44)
    expect(mass.passen).toBe(6)
    // 268 / 6 = 44,666… -> abgeschnitten 44,66.
    expect(mass.zeilenHoehe).toBe(44.66)
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
    // Kann seit S2.1 nur noch im Uebergang auftreten — die Zeilenzahl kommt
    // immer aus der Messung, aber ein Datenpush kann zwischen Messung und
    // Zeichnung liegen. Ein negativer Takt waere eine negative CSS-Hoehe.
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
