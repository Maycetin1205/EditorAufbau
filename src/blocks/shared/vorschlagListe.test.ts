import { describe, expect, it } from 'vitest'
import {
  bewegteMarke,
  gueltigeMarke,
  passendeVorschlaege,
  tastenFolge,
  VORSCHLAEGE_MAX,
} from './vorschlagListe'

const ARTIKEL = [
  { anzeige: 'Baytril 25 mg', wert: 'ART03045' },
  { anzeige: 'Baytril 50 mg', wert: 'ART03046' },
  { anzeige: 'Metacam 5 mg/ml', wert: 'ART01120' },
  { anzeige: 'Verbandwatte', wert: 'ART00812' },
]

describe('passendeVorschlaege', () => {
  it('findet ueber die Bezeichnung — Geuebte tippen „bay" fuer Baytril', () => {
    expect(passendeVorschlaege(ARTIKEL, 'bay').map((e) => e.wert))
      .toEqual(['ART03045', 'ART03046'])
  })

  it('findet ueber die NUMMER genauso — beide Wege, eine Liste', () => {
    expect(passendeVorschlaege(ARTIKEL, '01120').map((e) => e.anzeige))
      .toEqual(['Metacam 5 mg/ml'])
  })

  it('leer getippt: KEINE Liste — dort ist Enter der Weg ins grosse Fenster', () => {
    expect(passendeVorschlaege(ARTIKEL, '')).toEqual([])
    expect(passendeVorschlaege(ARTIKEL, '   ')).toEqual([])
  })

  it('mehrere Woerter muessen alle passen (dieselbe Regel wie die Tabellensuche)', () => {
    expect(passendeVorschlaege(ARTIKEL, 'bay 50').map((e) => e.wert)).toEqual(['ART03046'])
  })

  it('kein Treffer bleibt kein Treffer — nichts wird ersatzweise angeboten', () => {
    expect(passendeVorschlaege(ARTIKEL, 'xyz')).toEqual([])
  })

  it('hoert beim Deckel auf: acht Treffer, nicht die ganze Kartei', () => {
    const viele = Array.from({ length: 30 }, (_, i) => ({
      anzeige: `Wattestaebchen ${i}`,
      wert: `ART${i}`,
    }))
    expect(passendeVorschlaege(viele, 'watte')).toHaveLength(VORSCHLAEGE_MAX)
    expect(passendeVorschlaege(viele, 'watte', 3)).toHaveLength(3)
  })

  it('gibt die ganzen Eintraege zurueck — der Satz dahinter geht nicht verloren', () => {
    const mitSatz = [{ anzeige: 'Rex', wert: '10024', satz: { '2_8': '10024' } }]
    expect(passendeVorschlaege(mitSatz, 'rex')[0].satz).toBe(mitSatz[0].satz)
  })
})

describe('bewegteMarke', () => {
  it('laeuft nach unten und oben um', () => {
    expect(bewegteMarke(0, 3, 1)).toBe(1)
    expect(bewegteMarke(2, 3, 1)).toBe(0)
    expect(bewegteMarke(0, 3, -1)).toBe(2)
  })

  it('ohne Treffer gibt es nichts zu markieren', () => {
    expect(bewegteMarke(0, 0, 1)).toBe(0)
  })
})

describe('gueltigeMarke', () => {
  it('eine Marke hinter dem Ende faellt auf den ersten Treffer — nie ins Leere', () => {
    expect(gueltigeMarke(5, 2)).toBe(0)
    expect(gueltigeMarke(-1, 2)).toBe(0)
  })

  it('eine gueltige Marke bleibt stehen', () => {
    expect(gueltigeMarke(1, 2)).toBe(1)
  })
})

describe('tastenFolge', () => {
  const offen = { listeOffen: true, feldLeer: false }
  const zu = { listeOffen: false, feldLeer: false }

  it('bei offener Liste waehlen die Pfeile und Enter uebernimmt', () => {
    expect(tastenFolge('ArrowDown', offen)).toBe('marke-runter')
    expect(tastenFolge('ArrowUp', offen)).toBe('marke-hoch')
    expect(tastenFolge('Enter', offen)).toBe('uebernehmen')
    expect(tastenFolge('Escape', offen)).toBe('liste-zu')
  })

  it('Enter im LEEREN Feld oeffnet das grosse Fenster', () => {
    expect(tastenFolge('Enter', { listeOffen: false, feldLeer: true })).toBe('fenster')
  })

  it('Enter bei offener Liste uebernimmt, auch wenn das Feld leer waere', () => {
    expect(tastenFolge('Enter', { listeOffen: true, feldLeer: true })).toBe('uebernehmen')
  })

  it('getippter Text ohne Treffer: Enter tut NICHTS — kein Fenster ueber dem Tippfehler', () => {
    expect(tastenFolge('Enter', zu)).toBe('nichts')
  })

  it('ohne Liste greifen Pfeile und Escape nicht in die Bedienung ein', () => {
    expect(tastenFolge('ArrowDown', zu)).toBe('nichts')
    expect(tastenFolge('Escape', zu)).toBe('nichts')
  })

  it('jede andere Taste tippt normal weiter', () => {
    expect(tastenFolge('a', offen)).toBe('nichts')
    expect(tastenFolge('Tab', offen)).toBe('nichts')
    expect(tastenFolge('Backspace', offen)).toBe('nichts')
  })
})
