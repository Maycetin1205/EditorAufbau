import { beforeEach, describe, expect, it } from 'vitest'
import { setzeAuswahlZurueck, waehleAuswahl } from '../shared/auswahl'
import {
  einzigenTrefferFinden,
  fensterEintraege,
  folgeBeimVerlassen,
  nachschlagEintraege,
  nurEineSpalte,
  satzPasstZurAuswahl,
} from './nachschlagen'

const ROHZEILEN = [
  { '2_8': '10024', '10_30': 'Berger, Anna' },
  { '2_8': '10031', '10_30': 'Hofmann, Peter' },
  { '2_8': '10048', '10_30': '' },
  { '2_8': '', '10_30': '' },
]

describe('nachschlagEintraege', () => {
  it('baut Anzeige + Wert je Zeile aus den zwei Feldcodes', () => {
    const e = nachschlagEintraege(ROHZEILEN, '10_30', '2_8')
    expect(e[0]).toEqual({ anzeige: 'Berger, Anna', wert: '10024', satz: ROHZEILEN[0] })
    expect(e[1]).toEqual({ anzeige: 'Hofmann, Peter', wert: '10031', satz: ROHZEILEN[1] })
  })

  it('traegt die ROHZEILE mit — das Feld gibt den ganzen Satz als Auswahl ab', () => {
    const e = nachschlagEintraege(ROHZEILEN, '10_30', '2_8')
    expect(e[0].satz).toBe(ROHZEILEN[0])
  })

  it('laesst nur voellig leere Zeilen weg — halbe bleiben unterscheidbar', () => {
    const e = nachschlagEintraege(ROHZEILEN, '10_30', '2_8')
    expect(e).toHaveLength(3)
    expect(e[2]).toEqual({ anzeige: '', wert: '10048', satz: ROHZEILEN[2] })
  })

  it('liest auch pos_len aus dem SATZ-Rohstring (getField-Weg)', () => {
    const satz = { SATZ: '  10077  Vogler' }
    const e = nachschlagEintraege([satz], '9_6', '2_5')
    expect(e).toEqual([{ anzeige: 'Vogler', wert: '10077', satz }])
  })

  it('ohne "Angezeigt wird" ist der gespeicherte Wert selbst die Anzeige', () => {
    const e = nachschlagEintraege(ROHZEILEN, '', '2_8')
    expect(e.map((x) => x.wert)).toEqual(['10024', '10031', '10048'])
    expect(e.every((x) => x.anzeige === x.wert)).toBe(true)
  })

  it('ohne "Angezeigt wird" steht jeder Wert einmal da', () => {
    const rows = [{ '2_8': '4' }, { '2_8': '4' }, { '2_8': '11' }]
    expect(nachschlagEintraege(rows, '', '2_8').map((x) => x.wert)).toEqual(['4', '11'])
  })
})

describe('nurEineSpalte', () => {
  it('kein Anzeigefeld oder dasselbe Feld: eine Spalte', () => {
    expect(nurEineSpalte('', '2_8')).toBe(true)
    expect(nurEineSpalte('2_8', '2_8')).toBe(true)
    expect(nurEineSpalte(' 2_8 ', '2_8')).toBe(true)
  })

  it('zwei verschiedene Felder: zwei Spalten', () => {
    expect(nurEineSpalte('10_30', '2_8')).toBe(false)
  })
})


const elementMit = (attrs: Record<string, string>): HTMLElement =>
  ({ getAttribute: (n: string) => attrs[n] ?? null }) as unknown as HTMLElement

const folgerFeld = elementMit({
  folgtauswahl: JSON.stringify([{
    geberId: 'kunde',
    keyPairs: [{ fromField: '110_10', toField: '2_8' }],
  }]),
})

const HAUSTIERE = [
  { '2_8': '10024', '18_30': 'Rex' },
  { '2_8': '10031', '18_30': 'Minka' },
  { '2_8': '10024', '18_30': 'Bello' },
]

beforeEach(() => setzeAuswahlZurueck())

describe('fensterEintraege (das Fenster folgt der Auswahl)', () => {
  it('OHNE Auswahl beim Geber: alle Saetze — nichts passiert automatisch', () => {
    const e = fensterEintraege(folgerFeld, [...HAUSTIERE], '18_30', '2_8')
    expect(e.map((x) => x.anzeige)).toEqual(['Rex', 'Minka', 'Bello'])
  })

  it('MIT Auswahl nur die passenden Saetze (die Haustiere DIESES Kunden)', () => {
    waehleAuswahl('kunde', { '110_10': '10024', '10_30': 'Berger, Anna' })
    const e = fensterEintraege(folgerFeld, [...HAUSTIERE], '18_30', '2_8')
    expect(e.map((x) => x.anzeige)).toEqual(['Rex', 'Bello'])
  })

  it('ohne Folge-Einstellung bleibt alles wie bisher', () => {
    waehleAuswahl('kunde', { '110_10': '10024' })
    const e = fensterEintraege(elementMit({}), [...HAUSTIERE], '18_30', '2_8')
    expect(e).toHaveLength(3)
  })

  it('kein Partner: das Fenster ist ehrlich leer statt falsch gefuellt', () => {
    waehleAuswahl('kunde', { '110_10': '99999' })
    expect(fensterEintraege(folgerFeld, [...HAUSTIERE], '18_30', '2_8')).toEqual([])
  })
})

describe('einzigenTrefferFinden', () => {
  const einer = nachschlagEintraege([HAUSTIERE[1]], '18_30', '2_8')
  const zwei = nachschlagEintraege(HAUSTIERE, '18_30', '2_8')

  it('genau ein Eintrag ins LEERE Feld: das ist der Satz', () => {
    expect(einzigenTrefferFinden(einer, true)?.anzeige).toBe('Minka')
  })

  it('mehrere Eintraege: der Bediener waehlt selbst', () => {
    expect(einzigenTrefferFinden(zwei, true)).toBeNull()
  })

  it('gar kein Eintrag: nichts zu uebernehmen', () => {
    expect(einzigenTrefferFinden([], true)).toBeNull()
  })

  it('Feld schon gefuellt: NIE still ersetzen', () => {
    expect(einzigenTrefferFinden(einer, false)).toBeNull()
  })
})

describe('satzPasstZurAuswahl (Geber-Wechsel leert das Feld)', () => {
  it('passt weiter, solange der Halter der gewaehlte Kunde ist', () => {
    waehleAuswahl('kunde', { '110_10': '10024' })
    expect(satzPasstZurAuswahl(folgerFeld, HAUSTIERE[0])).toBe(true)
  })

  it('anderer Kunde gewaehlt: der uebernommene Satz passt NICHT mehr', () => {
    waehleAuswahl('kunde', { '110_10': '10031' })
    expect(satzPasstZurAuswahl(folgerFeld, HAUSTIERE[0])).toBe(false)
  })

  it('ohne aktive Auswahl passt er weiter — bestaetigtes verschwindet nicht von allein', () => {
    expect(satzPasstZurAuswahl(folgerFeld, HAUSTIERE[0])).toBe(true)
    waehleAuswahl('kunde', { '110_10': '10024' })

    waehleAuswahl('kunde', { '110_10': '10024' })
    expect(satzPasstZurAuswahl(folgerFeld, HAUSTIERE[0])).toBe(true)
  })

  it('ohne Folge-Einstellung wird nie geleert', () => {
    waehleAuswahl('kunde', { '110_10': '99999' })
    expect(satzPasstZurAuswahl(elementMit({}), HAUSTIERE[0])).toBe(true)
  })
})

describe('folgeBeimVerlassen (2026-08-07, das × ist raus)', () => {
  it('leer getippt = loeschen — die Bedienerhandlung, die vorher das × war', () => {
    expect(folgeBeimVerlassen('', 'Berger, Anna', '10024')).toBe('leeren')

    expect(folgeBeimVerlassen('', '10024', '10024')).toBe('leeren')
  })

  it('war schon leer = nichts — sonst faellt beim Durchtabben eine Kette an', () => {
    expect(folgeBeimVerlassen('', '', '')).toBe('nichts')
  })

  it('halb getippt = zurueck auf den bestaetigten Text', () => {
    expect(folgeBeimVerlassen('Berg', 'Berger, Anna', '10024')).toBe('zurueck')

    expect(folgeBeimVerlassen('Berger', '', '')).toBe('zurueck')
  })

  it('unveraendert = nichts', () => {
    expect(folgeBeimVerlassen('Berger, Anna', 'Berger, Anna', '10024')).toBe('nichts')
  })

  it('vergleicht zeichengenau — ein Leerzeichen loescht nicht', () => {
    expect(folgeBeimVerlassen(' ', 'Berger, Anna', '10024')).toBe('zurueck')
    expect(folgeBeimVerlassen('   ', '   ', '10024')).toBe('nichts')
  })
})
