// Tests der puren Nachschlage-Logik (Eintraege bauen, suchen) — das Fenster
// selbst ist DOM und liegt beim Nutzer (Klickanleitung); die Datenwege hier.
// Gattung wie feldRuntime.test: Node, keine neue Testart.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import { nachschlagEintraege, nachschlagTreffer } from './nachschlagen'

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
