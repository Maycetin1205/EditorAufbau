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
    expect(passendeZeilen(300, ZEILEN_HOEHE, ZEILEN_HOEHE)).toBe(8)

    expect(passendeZeilen(ZEILEN_HOEHE * 11, ZEILEN_HOEHE, ZEILEN_HOEHE)).toBe(10)
  })

  it('rechnet mit dem UEBERGEBENEN Takt, nicht mit dem Grundtakt', () => {
    expect(passendeZeilen(300, ZEILEN_HOEHE, 44)).toBe(6)
  })

  it('rundet ab — eine halb sichtbare Zeile ist keine Zeile', () => {
    expect(passendeZeilen(ZEILEN_HOEHE * 5 + ZEILEN_HOEHE - 1, ZEILEN_HOEHE, ZEILEN_HOEHE)).toBe(4)
  })

  it('liefert nie weniger als eine Zeile', () => {
    expect(passendeZeilen(40, ZEILEN_HOEHE, ZEILEN_HOEHE)).toBe(1)
    expect(passendeZeilen(0, ZEILEN_HOEHE, ZEILEN_HOEHE)).toBe(1)
    expect(passendeZeilen(-100, ZEILEN_HOEHE, ZEILEN_HOEHE)).toBe(1)
  })
})

describe('zeilenmass', () => {
  it('verteilt den Rest auf die Zeilen, sodass sie den Rumpf genau ausfuellen', () => {
    const mass = zeilenmass(300, ZEILEN_HOEHE, ZEILEN_HOEHE)
    expect(mass.passen).toBe(8)
    expect(mass.zeilenHoehe).toBe(33.5)
    expect(mass.passen * mass.zeilenHoehe).toBe(268)
  })

  it('aendert die ANZAHL nicht — gezaehlt wird weiter mit dem Takt', () => {
    for (const rumpf of [300, 301, 320, 331]) {
      expect(zeilenmass(rumpf, ZEILEN_HOEHE, ZEILEN_HOEHE).passen)
        .toBe(passendeZeilen(rumpf, ZEILEN_HOEHE, ZEILEN_HOEHE))
    }
  })

  it('laesst eine genau aufgehende Tabelle unberuehrt', () => {
    expect(zeilenmass(ZEILEN_HOEHE * 11, ZEILEN_HOEHE, ZEILEN_HOEHE))
      .toEqual({ passen: 10, zeilenHoehe: ZEILEN_HOEHE })
  })

  it('verteilt nichts, wenn nicht einmal ein ganzer Takt hineinpasst', () => {
    expect(zeilenmass(40, ZEILEN_HOEHE, ZEILEN_HOEHE))
      .toEqual({ passen: 1, zeilenHoehe: ZEILEN_HOEHE })
    expect(zeilenmass(0, ZEILEN_HOEHE, ZEILEN_HOEHE))
      .toEqual({ passen: 1, zeilenHoehe: ZEILEN_HOEHE })
  })

  it('rundet die Zeilenhoehe ab, nie auf', () => {
    const mass = zeilenmass(297, ZEILEN_HOEHE, ZEILEN_HOEHE)
    expect(mass.zeilenHoehe).toBe(33.12)
    expect(mass.passen * mass.zeilenHoehe).toBeLessThanOrEqual(265)
  })

  it('rechnet mit dem uebergebenen Takt (Bild-Spalte erhoeht ihn)', () => {
    const mass = zeilenmass(300, ZEILEN_HOEHE, 44)
    expect(mass.passen).toBe(6)

    expect(mass.zeilenHoehe).toBe(44.66)
  })
})

describe('linealTakte', () => {
  it('fuellt den Platz unter den Zeilen mit ganzen Takten', () => {
    expect(linealTakte(12, 3)).toBe(9)
  })

  it('zeichnet unter einer VOLLEN Seite gar kein Lineal mehr', () => {
    expect(linealTakte(12, 12)).toBe(0)
  })

  it('geht nie ins Minus (mehr Zeilen als gemessen passen)', () => {
    expect(linealTakte(12, 25)).toBe(0)
  })

  it('haelt sich ohne Messung heraus', () => {
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
    expect(frage({ wunschSeite: 2 }).zeilen).toEqual([4])

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

    expect(frage({ sichtbar: [] }).seiten).toBe(1)
  })
})
