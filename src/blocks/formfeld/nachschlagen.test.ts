// Tests der puren Nachschlage-Logik (Eintraege bauen, suchen) — das Fenster
// selbst ist DOM und liegt beim Nutzer (Klickanleitung); die Datenwege hier.
// Gattung wie feldRuntime.test: Node, keine neue Testart.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { beforeEach, describe, expect, it } from 'vitest'
import { setzeAuswahlZurueck, waehleAuswahl } from '../shared/auswahl'
import {
  einzigenTrefferFinden,
  fensterEintraege,
  nachschlagEintraege,
  nachschlagTreffer,
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
    // 2026-08-06: das Nachschlage-Feld ist Auswahl-Geber. Folger holen sich
    // BELIEBIGE Schluesselfelder aus dem uebernommenen Satz, nicht nur die zwei
    // Spalten, die das Fenster zeigt — ohne die Rohzeile waere davon nichts da.
    const e = nachschlagEintraege(ROHZEILEN, '10_30', '2_8')
    expect(e[0].satz).toBe(ROHZEILEN[0])
  })

  it('laesst nur voellig leere Zeilen weg — halbe bleiben unterscheidbar', () => {
    const e = nachschlagEintraege(ROHZEILEN, '10_30', '2_8')
    expect(e).toHaveLength(3)
    expect(e[2]).toEqual({ anzeige: '', wert: '10048', satz: ROHZEILEN[2] })
  })

  it('liest auch pos_len aus dem SATZ-Rohstring (getField-Weg)', () => {
    // getField trimmt den Rohstring VOR dem Ausschnitt — Positionen zaehlen
    // ab dem ersten Nicht-Leerzeichen ('10077  Vogler').
    const satz = { SATZ: '  10077  Vogler' }
    const e = nachschlagEintraege([satz], '7_6', '0_5')
    expect(e).toEqual([{ anzeige: 'Vogler', wert: '10077', satz }])
  })
})

describe('nachschlagTreffer', () => {
  const eintraege = nachschlagEintraege(ROHZEILEN, '10_30', '2_8')

  it('sucht in BEIDEN Spalten — Name wie Nummer', () => {
    expect(nachschlagTreffer(eintraege, 'berger')).toHaveLength(1)
    expect(nachschlagTreffer(eintraege, '10031')).toHaveLength(1)
  })

  it('leere Suche zeigt alles, kein Treffer zeigt nichts', () => {
    expect(nachschlagTreffer(eintraege, '')).toHaveLength(3)
    expect(nachschlagTreffer(eintraege, 'gibtsnicht')).toHaveLength(0)
  })

  it('mehrere Woerter sind ein UND (dieselbe Regel wie die Tabellen-Suche)', () => {
    expect(nachschlagTreffer(eintraege, 'berger 10024')).toHaveLength(1)
    expect(nachschlagTreffer(eintraege, 'berger 10031')).toHaveLength(0)
  })
})

// Das FENSTER folgt einer Auswahl (2026-08-06). Der Fall des Nutzers:
// Kunde-Feld (Geber) + Haustier-Feld, das ihm folgt — die Lupe zeigt nur die
// Haustiere des gewaehlten Kunden. Element wie in shared/auswahl.test.ts als
// Attribut-Traeger nachgestellt: purer Datenweg, kein DOM.
const elementMit = (attrs: Record<string, string>): HTMLElement =>
  ({ getAttribute: (n: string) => attrs[n] ?? null }) as unknown as HTMLElement

const folgerFeld = elementMit({
  folgtauswahl: JSON.stringify([{
    geberId: 'kunde',
    keyPairs: [{ fromField: '110_10', toField: '2_8' }],
  }]),
})

// Haustiere; '2_8' = Adressnummer des Halters.
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

// „Einzigen Treffer uebernehmen" (Nutzer-Entscheidung 2026-08-05). Hier die
// Kern-Bedingung; dass sie an denselben Anlaessen wie das Leeren geprueft wird,
// steht im Baustein (pruefeEigenenWert) und liegt in der Klickpruefung.
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
    // Zwei Gruende in einem: ein bestaetigter Wert darf nicht heimlich durch
    // einen anderen getauscht werden, und weil ins gefuellte Feld nichts
    // geschrieben wird, kann derselbe Anlass beliebig oft laufen, ohne sich
    // aufzuschaukeln.
    expect(einzigenTrefferFinden(einer, false)).toBeNull()
  })
})

describe('satzPasstZurAuswahl (Geber-Wechsel leert das Feld)', () => {
  it('passt weiter, solange der Halter der gewaehlte Kunde ist', () => {
    waehleAuswahl('kunde', { '110_10': '10024' })
    expect(satzPasstZurAuswahl(folgerFeld, HAUSTIERE[0])).toBe(true)
  })

  it('anderer Kunde gewaehlt: der uebernommene Satz passt NICHT mehr', () => {
    // Genau hier leert sich das Feld — ein Haustier, das zu niemandem mehr
    // gehoert, waere ein falscher Wert, der richtig aussieht.
    waehleAuswahl('kunde', { '110_10': '10031' })
    expect(satzPasstZurAuswahl(folgerFeld, HAUSTIERE[0])).toBe(false)
  })

  it('ohne aktive Auswahl passt er weiter — bestaetigtes verschwindet nicht von allein', () => {
    expect(satzPasstZurAuswahl(folgerFeld, HAUSTIERE[0])).toBe(true)
    waehleAuswahl('kunde', { '110_10': '10024' })
    // Wieder rausgeklickt (Toggle): das Fenster zeigt dann alles, der
    // uebernommene Satz bleibt gueltig.
    waehleAuswahl('kunde', { '110_10': '10024' })
    expect(satzPasstZurAuswahl(folgerFeld, HAUSTIERE[0])).toBe(true)
  })

  it('ohne Folge-Einstellung wird nie geleert', () => {
    waehleAuswahl('kunde', { '110_10': '99999' })
    expect(satzPasstZurAuswahl(elementMit({}), HAUSTIERE[0])).toBe(true)
  })
})
