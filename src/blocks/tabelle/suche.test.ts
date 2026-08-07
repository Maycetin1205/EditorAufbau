// Tests der Tabellen-Inhaltssuche.
// Der Bediener tippt und erwartet Windows-Verhalten: Gross/Klein egal,
// mehrere Woerter sind ein UND, leere Eingabe blendet nie etwas aus.

import { describe, expect, it } from 'vitest'
import {
  datensatzText,
  filtereZeilen,
  passendeIndizes,
  zeigtEchteDaten,
  zeigtLeerzustand,
  zeilePasst,
} from './suche'

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

describe('passendeIndizes (Zeilen-Identitaet fuer die Auswahl, 2026-08-05)', () => {
  it('liefert die ROHINDIZES der Treffer — dieselben Zeilen wie filtereZeilen', () => {
    expect(passendeIndizes(zeilen, 'katze')).toEqual([1, 2])
    expect(passendeIndizes(zeilen, '')).toEqual([0, 1, 2, 3])
    expect(passendeIndizes(zeilen, 'gibtsnicht')).toEqual([])
  })

  it('filtereZeilen ist exakt die Werte-Form derselben Logik', () => {
    expect(filtereZeilen(zeilen, 'meier'))
      .toEqual(passendeIndizes(zeilen, 'meier').map((i) => zeilen[i]))
  })
})

describe('datensatzText (Fusszeile)', () => {
  const t = (o: Partial<Parameters<typeof datensatzText>[0]>): string =>
    datensatzText({ hatQuelle: true, sichtbar: 0, gesamt: 0, suchtAktiv: false, ...o })

  it('zeigt ohne Quelle einen Strich statt einer erfundenen Zahl', () => {
    expect(t({ hatQuelle: false })).toBe('— Datensätze')
  })

  it('schreibt die Einzahl richtig', () => {
    expect(t({ gesamt: 1, sichtbar: 1 })).toBe('1 Datensatz')
    expect(t({ gesamt: 2, sichtbar: 2 })).toBe('2 Datensätze')
  })

  it('zeigt ohne Suche die schlichte Anzahl', () => {
    expect(t({ gesamt: 250, sichtbar: 10 })).toBe('250 Datensätze')
    expect(t({ gesamt: 0, sichtbar: 0 })).toBe('Keine Datensätze')
  })

  it('zeigt MIT Suche „X von Y" — sonst verschweigt die Zahl den Bestand', () => {
    expect(t({ gesamt: 250, sichtbar: 1, suchtAktiv: true })).toBe('1 von 250 Datensätzen')
    expect(t({ gesamt: 250, sichtbar: 12, suchtAktiv: true })).toBe('12 von 250 Datensätzen')
  })

  it('sagt bei einer Suche ohne Treffer, wovon nichts uebrig blieb', () => {
    expect(t({ gesamt: 250, sichtbar: 0, suchtAktiv: true })).toBe('Kein Treffer von 250 Datensätzen')
  })

  it('sagt dazu, wenn die Auswahl eines anderen Bausteins filtert (Regel 4)', () => {
    expect(t({ gesamt: 12, sichtbar: 12, auswahlAktiv: true }))
      .toBe('12 Datensätze · durch Auswahl gefiltert')
    expect(t({ gesamt: 0, sichtbar: 0, auswahlAktiv: true }))
      .toBe('Keine Datensätze · durch Auswahl gefiltert')
    // Auch in Kombination mit der Suche bleibt der Zusatz dran.
    expect(t({ gesamt: 12, sichtbar: 3, suchtAktiv: true, auswahlAktiv: true }))
      .toBe('3 von 12 Datensätzen · durch Auswahl gefiltert')
    // Ohne Quelle bleibt der Strich ein Strich — nichts wird angehaengt.
    expect(t({ hatQuelle: false, auswahlAktiv: true })).toBe('— Datensätze')
  })
})

describe('zeigtLeerzustand (2026-08-07)', () => {
  it('erst wenn die Quelle wirklich geliefert hat — und dann nichts', () => {
    expect(zeigtLeerzustand(true, true, 0)).toBe(true)
    expect(zeigtLeerzustand(true, true, 3)).toBe(false)
  })

  it('vor dem ersten SoftEngine-Push NICHT — sonst luegt die Maske beim Laden', () => {
    // Die Anmeldung darf bis zu 10 Sekunden dauern (Retry 25 ms x 400). Stuende
    // in dieser Zeit „Keine Eintraege" da, behauptete die Maske etwas ueber
    // Daten, nach denen noch niemand gefragt hat (Regel 4).
    expect(zeigtLeerzustand(true, false, 0)).toBe(false)
  })

  it('im Editor nie — dort stehen die Platzhalter-Striche', () => {
    // Sonst naehme der Leerzustand dem Bauer die Sicht auf sein Layout.
    expect(zeigtLeerzustand(false, true, 0)).toBe(false)
  })
})

describe('zeigtEchteDaten (Leerzustand — B1, 2026-07-28)', () => {
  // Der Fehler, den diese Faelle festnageln: bis 2026-07-28 entschied die
  // Tabelle ueber `datenzeilen.length > 0`. Ein Tag ohne Saetze sah damit in
  // der ECHTEN Maske aus wie der leere Editor — vier Striche „—" und
  // „— Datensaetze", als wuerde noch geladen. Erfundene Werte in der Maske
  // sind genau das, was Regel 7 verbietet.

  it('Laufzeit mit Quelle zeigt echte Daten — AUCH wenn gerade keine Zeile passt', () => {
    expect(zeigtEchteDaten(false, 'q-termine')).toBe(true)
  })

  it('Editor zeigt Platzhalter — auch mit angehaengter Quelle', () => {
    // Im Editor darf nie ein echter Wert stehen, sonst waere die Vorschau
    // eine Behauptung ueber Daten, die der Editor gar nicht hat.
    expect(zeigtEchteDaten(true, 'q-termine')).toBe(false)
  })

  it('ohne Quelle immer Platzhalter — im Editor wie in der Maske', () => {
    expect(zeigtEchteDaten(true, '')).toBe(false)
    expect(zeigtEchteDaten(false, '')).toBe(false)
    expect(zeigtEchteDaten(false, '   ')).toBe(false)
  })

  it('zusammen mit der Fusszeile: leerer Tag sagt „Keine Datensaetze", nicht „—"', () => {
    // Das ist der Fall des Bedieners: Quelle dran, Tagesfilter auf einen Tag
    // ohne Termine. Vorher unerreichbar — der Zweig war getestet, aber der
    // Baustein kam nie dort an.
    const hatQuelle = zeigtEchteDaten(false, 'q-termine')
    expect(datensatzText({ hatQuelle, sichtbar: 0, gesamt: 0, suchtAktiv: false }))
      .toBe('Keine Datensätze')
  })

  it('und im Editor bleibt es beim Strich', () => {
    const hatQuelle = zeigtEchteDaten(true, 'q-termine')
    expect(datensatzText({ hatQuelle, sichtbar: 0, gesamt: 0, suchtAktiv: false }))
      .toBe('— Datensätze')
  })
})
