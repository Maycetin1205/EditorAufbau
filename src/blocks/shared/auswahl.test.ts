// Tests des gemeinsamen Auswahl-Zustands (Zeile anklicken -> Folger filtern).
// Pur in Node: das Element wird als Attribut-Traeger nachgestellt (dasselbe
// Muster wie die uebrigen seRuntime-Helfer-Tests, kein DOM noetig).

import { beforeEach, describe, expect, it } from 'vitest'
import {
  einzigenTrefferFinden,
  fensterEintraege,
  satzPasstZurAuswahl,
} from '../formfeld/nachschlagen'
import {
  aufAuswahlHoeren,
  auswahlFuer,
  auswahlMerkmal,
  auswahlWiederfinden,
  ersteZeileNachAuswahl,
  folgenAusAttribut,
  klareAuswahl,
  merkmalVon,
  setzeAuswahl,
  setzeAuswahlZurueck,
  waehleAuswahl,
  zeilenNachAuswahl,
} from './auswahl'

const elementMit = (attrs: Record<string, string>): HTMLElement =>
  ({ getAttribute: (n: string) => attrs[n] ?? null }) as unknown as HTMLElement

beforeEach(() => setzeAuswahlZurueck())

describe('waehleAuswahl (Toggle, Nutzer 2026-08-05: „rausklicken")', () => {
  const zeile = { '2_8': '10001', name: 'Meier' }

  it('waehlt eine Zeile und findet sie wieder', () => {
    waehleAuswahl('t1', zeile)
    expect(auswahlFuer('t1')).toBe(zeile)
    expect(auswahlMerkmal('t1')).toBe(merkmalVon(zeile))
  })

  it('dieselbe Zeile noch einmal = abgewaehlt — auch als NEUES Objekt gleichen Inhalts', () => {
    waehleAuswahl('t1', zeile)
    // Nach einem SE-Push sind die Zeilen NEUE Objekte: die Identitaet ist
    // der Inhalt (JSON-Abdruck), nie die Referenz.
    waehleAuswahl('t1', { '2_8': '10001', name: 'Meier' })
    expect(auswahlFuer('t1')).toBeUndefined()
  })

  it('eine ANDERE Zeile ersetzt die Auswahl statt sie aufzuheben', () => {
    waehleAuswahl('t1', zeile)
    waehleAuswahl('t1', { '2_8': '20002', name: 'Schmidt' })
    expect(auswahlFuer('t1')).toEqual({ '2_8': '20002', name: 'Schmidt' })
  })

  it('zwei Geber halten getrennte Auswahlen', () => {
    waehleAuswahl('t1', zeile)
    waehleAuswahl('k1', { '2_8': '30003' })
    expect(auswahlFuer('t1')).toBe(zeile)
    expect(auswahlFuer('k1')).toEqual({ '2_8': '30003' })
  })

  it('ohne Geber-id oder ohne brauchbare Zeile passiert nichts', () => {
    waehleAuswahl('', zeile)
    waehleAuswahl('t1', null)
    expect(auswahlFuer('t1')).toBeUndefined()
  })

  it('meldet jede Aenderung an die Hoerer (Neu-Hydrierung)', () => {
    let rufe = 0
    aufAuswahlHoeren(() => { rufe++ })
    waehleAuswahl('t1', zeile)
    klareAuswahl('t1')
    klareAuswahl('t1') // schon leer -> keine Meldung
    expect(rufe).toBe(2)
  })
})

describe('setzeAuswahl (Uebernehmen-Geste, 2026-08-06)', () => {
  const zeile = { '2_8': '10024', name: 'Berger' }

  it('setzt die Zeile — und DERSELBE Satz noch einmal hebt sie NICHT auf', () => {
    // Der Unterschied zum Anklicken: wer im Nachschlage-Fenster denselben
    // Kunden ein zweites Mal bestaetigt, meint „ja, den" — ein Toggle machte
    // aus der Bestaetigung ein Loeschen.
    setzeAuswahl('feld', zeile)
    setzeAuswahl('feld', { '2_8': '10024', name: 'Berger' })
    expect(auswahlFuer('feld')).toEqual(zeile)
  })

  it('ein anderer Satz ersetzt, und nur echte Aenderungen melden', () => {
    let rufe = 0
    aufAuswahlHoeren(() => { rufe++ })
    setzeAuswahl('feld', zeile)
    setzeAuswahl('feld', zeile) // schon gesetzt -> keine Meldung, kein Neuzeichnen
    setzeAuswahl('feld', { '2_8': '10031' })
    expect(auswahlFuer('feld')).toEqual({ '2_8': '10031' })
    expect(rufe).toBe(2)
  })

  it('ohne Geber-id oder ohne brauchbaren Satz passiert nichts', () => {
    setzeAuswahl('', zeile)
    setzeAuswahl('feld', null)
    expect(auswahlFuer('feld')).toBeUndefined()
  })
})

describe('folgenAusAttribut (Laufzeit-Leser des Export-Attributs)', () => {
  const folge = [{ geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '3_8' }] }]

  it('liest eine gueltige Folge', () => {
    const el = elementMit({ folgtauswahl: JSON.stringify(folge) })
    expect(folgenAusAttribut(el)).toEqual(folge)
  })

  it('fehlendes/kaputtes Attribut = keine Folge, nie ein Wurf', () => {
    expect(folgenAusAttribut(elementMit({}))).toEqual([])
    expect(folgenAusAttribut(elementMit({ folgtauswahl: '{kaputt' }))).toEqual([])
    expect(folgenAusAttribut(elementMit({ folgtauswahl: '"nur-text"' }))).toEqual([])
  })

  it('laesst halbe Feldpaare und Eintraege ohne Geber weg (streng wie fremdeQuellen)', () => {
    const roh = JSON.stringify([
      { geberId: '', keyPairs: [{ fromField: '2_8', toField: '3_8' }] },
      { geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: ' ' }] },
      { geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '3_8' }, { fromField: '', toField: 'x' }] },
    ])
    expect(folgenAusAttribut(elementMit({ folgtauswahl: roh }))).toEqual([
      { geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '3_8' }] },
    ])
  })
})

// Der Filter wohnte bis 2026-08-06 in tabelle/seRuntime (samt dieser Tests).
// Er ist hierher gezogen, weil die Einzelwert-Bausteine der zweite Folger
// sind und beide DIESELBE Regel brauchen. LEITPLANKE: Tests niemals
// loeschen/abschwaechen — sie sind unveraendert mitgezogen.
const folger = (keyPairs: { fromField: string; toField: string }[]): HTMLElement =>
  elementMit({ folgtauswahl: JSON.stringify([{ geberId: 'kunden', keyPairs }]) })

const ohneFolge = elementMit({})

const belege = [
  { '3_8': '10001', beleg: 'RE-1' },
  { '3_8': '20002', beleg: 'RE-2' },
  { '3_8': '10001', beleg: 'RE-3' },
]

describe('zeilenNachAuswahl', () => {
  it('ohne Folge-Attribut bleibt alles wie es ist', () => {
    const { rows, gefiltert } = zeilenNachAuswahl(ohneFolge, belege)
    expect(rows).toBe(belege)
    expect(gefiltert).toBe(false)
  })

  it('ohne aktive Auswahl filtert NICHTS — nichts passiert automatisch', () => {
    const { rows, gefiltert } = zeilenNachAuswahl(
      folger([{ fromField: '2_8', toField: '3_8' }]),
      belege,
    )
    expect(rows).toBe(belege)
    expect(gefiltert).toBe(false)
  })

  it('mit Auswahl bleiben nur die passenden Zeilen (Kunde -> seine Belege)', () => {
    waehleAuswahl('kunden', { '2_8': '10001', name: 'Meier' })
    const { rows, gefiltert } = zeilenNachAuswahl(
      folger([{ fromField: '2_8', toField: '3_8' }]),
      belege,
    )
    expect(rows.map((r) => (r as { beleg: string }).beleg)).toEqual(['RE-1', 'RE-3'])
    expect(gefiltert).toBe(true)
  })

  it('kein Treffer = leere Liste, aber ehrlich als gefiltert markiert', () => {
    waehleAuswahl('kunden', { '2_8': '99999' })
    const { rows, gefiltert } = zeilenNachAuswahl(
      folger([{ fromField: '2_8', toField: '3_8' }]),
      belege,
    )
    expect(rows).toEqual([])
    expect(gefiltert).toBe(true)
  })

  it('mehrere Feldpaare sind ein UND', () => {
    waehleAuswahl('kunden', { '2_8': '10001', '9_2': 'A' })
    const zeilen = [
      { '3_8': '10001', '7_2': 'A', beleg: 'passt' },
      { '3_8': '10001', '7_2': 'B', beleg: 'falsche-art' },
    ]
    const { rows } = zeilenNachAuswahl(
      folger([
        { fromField: '2_8', toField: '3_8' },
        { fromField: '9_2', toField: '7_2' },
      ]),
      zeilen,
    )
    expect(rows.map((r) => (r as { beleg: string }).beleg)).toEqual(['passt'])
  })

  it('LEERER Schluesselwert beim Geber trifft NICHTS (Regel wie schluesselAus)', () => {
    // Der gewaehlte Kunde hat keine Adressnummer: „alle Belege" waere
    // geraten, „die mit ebenfalls leerem Feld" auch — also keine.
    waehleAuswahl('kunden', { '2_8': '   ' })
    const { rows, gefiltert } = zeilenNachAuswahl(
      folger([{ fromField: '2_8', toField: '3_8' }]),
      [...belege, { '3_8': '', beleg: 'auch-leer' }],
    )
    expect(rows).toEqual([])
    expect(gefiltert).toBe(true)
  })

  it('die Auswahl eines FREMDEN Gebers filtert hier nicht', () => {
    waehleAuswahl('andere-tabelle', { '2_8': '10001' })
    const { gefiltert } = zeilenNachAuswahl(
      folger([{ fromField: '2_8', toField: '3_8' }]),
      belege,
    )
    expect(gefiltert).toBe(false)
  })
})

describe('ersteZeileNachAuswahl (Einzelwert-Bausteine, 2026-08-06)', () => {
  const paar = [{ fromField: '2_8', toField: '3_8' }]

  it('ohne Folge die ERSTE Zeile — der Grundzustand bleibt', () => {
    expect(ersteZeileNachAuswahl(ohneFolge, belege)).toBe(belege[0])
  })

  it('mit Auswahl die erste PASSENDE Zeile', () => {
    waehleAuswahl('kunden', { '2_8': '20002' })
    expect(ersteZeileNachAuswahl(folger(paar), belege)).toBe(belege[1])
  })

  // Strenge Leer-Regel (Nutzer-Entscheidung 2026-08-06 nach dem SE-Echttest):
  // wer der Auswahl folgt, zeigt NUR, was die Auswahl liefert. „Die erste
  // Zeile" waere ein konkreter Datensatz, den der Bediener fuer den
  // ausgewaehlten haelt.
  it('mit Folge, aber ohne Auswahl: LEER — nicht die erste Zeile', () => {
    expect(ersteZeileNachAuswahl(folger(paar), belege)).toBeUndefined()
  })

  it('wieder rausgeklickt: LEER', () => {
    const el = folger(paar)
    waehleAuswahl('kunden', { '2_8': '20002' })
    expect(ersteZeileNachAuswahl(el, belege)).toBe(belege[1])
    // Dieselbe Zeile noch einmal = abgewaehlt (Toggle).
    waehleAuswahl('kunden', { '2_8': '20002' })
    expect(ersteZeileNachAuswahl(el, belege)).toBeUndefined()
  })

  it('gewaehlt, aber kein Partner in der eigenen Quelle: LEER', () => {
    waehleAuswahl('kunden', { '2_8': '99999' })
    expect(ersteZeileNachAuswahl(folger(paar), belege)).toBeUndefined()
  })

  it('HALBES Feldpaar zaehlt nicht: Grundzustand, kein Leer-Blinken beim Einstellen', () => {
    // Der Bediener hat den Geber gewaehlt und tippt gerade am Feldpaar.
    const halb = folger([{ fromField: '2_8', toField: '' }])
    expect(ersteZeileNachAuswahl(halb, belege)).toBe(belege[0])
    waehleAuswahl('kunden', { '2_8': '20002' })
    expect(ersteZeileNachAuswahl(halb, belege)).toBe(belege[0])
  })

  it('leere Quelle bleibt leer — nichts wird erfunden', () => {
    waehleAuswahl('kunden', { '2_8': '10001' })
    expect(ersteZeileNachAuswahl(folger(paar), [])).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// A7.3 (2026-08-11): Was macht ein KREIS in den Auswahl-Folgen?
//
// „A folgt B, B folgt A" ist im Editor einstellbar. Die Frage des Plans war
// nicht, ob man das verbieten soll, sondern erst einmal: endet die Nachmeldung
// in `melde()` dann ueberhaupt? Sie laeuft `do { hoerer } while (nachmeldung)`,
// und jeder Hoerer darf die Auswahl waehrend des Laufs erneut aendern.
//
// Die Faelle unten stellen die Hydrierung der Maske nach — nicht mit Bausteinen
// (die sind DOM), sondern mit DENSELBEN puren Funktionen, die die Bausteine
// dafuer rufen. Ein Kommentar je Fall nennt die Stelle, die er nachstellt.
//
// Der Rundenzaehler mit Deckel ist die Notbremse: laeuft eine Runde nicht aus,
// soll der Test das BEHAUPTEN und nicht den Lauf haengen lassen.
const RUNDEN_DECKEL = 12
let hydriere: (() => void) | null = null
let runden = 0

// `aufAuswahlHoeren` hat bewusst kein Gegenstueck (die Bausteine der laufenden
// Maske melden sich einmal an und bleiben). Darum EIN Hoerer, den jeder Fall
// selbst ein- und wieder ausschaltet — sonst wirkte er in die folgenden hinein.
aufAuswahlHoeren(() => {
  if (!hydriere) return
  runden++
  if (runden > RUNDEN_DECKEL) return
  hydriere()
})

function mitHydrierung(lauf: () => void, tun: () => void): number {
  runden = 0
  hydriere = lauf
  try {
    tun()
  } finally {
    hydriere = null
  }
  return runden
}

describe('Auswahl-Folge im Kreis (A7.3)', () => {
  // Nachstellung von tabelle/seRuntime.ts:103 bzw. kanban/seRuntime.ts:206:
  // sichtbare Zeilen ausrechnen, dann die eigene Auswahl darin wiederfinden —
  // ist sie weg, hebt `auswahlWiederfinden` sie auf.
  const hydriereTabelle = (id: string, el: HTMLElement, zeilen: unknown[]): void => {
    auswahlWiederfinden(id, zeilenNachAuswahl(el, zeilen).rows, (r) => r)
  }

  const kunden = [{ '2_8': '10001' }, { '2_8': '20002' }]
  const belege = [{ '3_8': '10001' }, { '3_8': '20002' }]

  it('zwei Tabellen im Kreis: die Nachmeldung endet', () => {
    // kunden folgt belege UND belege folgt kunden — der direkte Kreis.
    const elKunden = elementMit({ folgtauswahl: JSON.stringify([
      { geberId: 'belege', keyPairs: [{ fromField: '3_8', toField: '2_8' }] },
    ]) })
    const elBelege = elementMit({ folgtauswahl: JSON.stringify([
      { geberId: 'kunden', keyPairs: [{ fromField: '2_8', toField: '3_8' }] },
    ]) })

    const gelaufen = mitHydrierung(() => {
      hydriereTabelle('kunden', elKunden, kunden)
      hydriereTabelle('belege', elBelege, belege)
    }, () => {
      waehleAuswahl('belege', belege[1]) // erst ein Beleg …
      waehleAuswahl('kunden', kunden[0]) // … dann ein Kunde, der dazu nicht passt
    })

    expect(gelaufen).toBeLessThanOrEqual(RUNDEN_DECKEL)
    // Die zweite Wahl haelt nicht: der gewaehlte Kunde ist in der (durch den
    // Beleg eingeengten) Liste gar nicht sichtbar, und eine Auswahl auf einer
    // unsichtbaren Zeile hebt `auswahlWiederfinden` bewusst auf — sonst filterte
    // die Maske nach etwas, was niemand markiert sieht.
    expect(auswahlFuer('kunden')).toBeUndefined()
    expect(auswahlFuer('belege')).toEqual(belege[1])
  })

  it('drei Tabellen im Kreis (a folgt c, b folgt a, c folgt b): endet ebenfalls', () => {
    const el = (geberId: string, fromField: string, toField: string): HTMLElement =>
      elementMit({ folgtauswahl: JSON.stringify([{ geberId, keyPairs: [{ fromField, toField }] }]) })
    const a = [{ '1_8': 'X' }, { '1_8': 'Y' }]
    const b = [{ '2_8': 'X' }, { '2_8': 'Y' }]
    const c = [{ '3_8': 'X' }, { '3_8': 'Y' }]

    const gelaufen = mitHydrierung(() => {
      hydriereTabelle('a', el('c', '3_8', '1_8'), a)
      hydriereTabelle('b', el('a', '1_8', '2_8'), b)
      hydriereTabelle('c', el('b', '2_8', '3_8'), c)
    }, () => {
      waehleAuswahl('c', c[1])
      waehleAuswahl('a', a[0])
    })

    expect(gelaufen).toBeLessThanOrEqual(RUNDEN_DECKEL)
    expect(auswahlFuer('a')).toBeUndefined()
    expect(auswahlFuer('b')).toBeUndefined()
    expect(auswahlFuer('c')).toEqual(c[1])
  })

  // Warum die zwei Faelle oben enden: die Tabellen-Hydrierung kann eine Auswahl
  // nur AUFHEBEN. Der Zustand schrumpft also, und was leer ist, meldet nicht
  // erneut — hoechstens so viele Runden, wie es Geber gibt.
  //
  // Zwei NACHSCHLAGE-Felder koennen mehr: ihre Hydrierung
  // (FormFeldBlock.pruefeEigenenWert, formfeld/FormFeldBlock.ts:420) leert bei
  // Nichtpassen UND uebernimmt danach den einzigen uebrigen Satz. Sie kann also
  // auch SETZEN — und damit ist der Zustand nicht mehr monoton.
  it('zwei Nachschlage-Felder im Kreis mit „einziger Treffer": die Nachmeldung endet NICHT', () => {
    // Die Schluesselfelder zeigen in BEIDE Richtungen auf verschiedene Felder.
    // Genau das nimmt der Vergleichbarkeit die Symmetrie: „a passt zu b" heisst
    // dann nicht mehr „b passt zu a", und beide Felder koennen sich abwechselnd
    // gegenseitig fuer unpassend erklaeren.
    const elA = elementMit({ folgtauswahl: JSON.stringify([
      { geberId: 'b', keyPairs: [{ fromField: '9_8', toField: '5_8' }] },
    ]) })
    const elB = elementMit({ folgtauswahl: JSON.stringify([
      { geberId: 'a', keyPairs: [{ fromField: '7_2', toField: '11_2' }] },
    ]) })
    const zeilenA = [{ '5_8': '1', '7_2': 'P' }, { '5_8': '2', '7_2': 'Q' }]
    const zeilenB = [{ '11_2': 'Q', '9_8': '1' }, { '11_2': 'P', '9_8': '2' }]
    // Der gemerkte Satz je Feld (`this.satz` im Baustein) — er wandert mit der
    // abgegebenen Auswahl, genau wie leereNachschlagen/uebernimmSatz es tun.
    const satz: Record<string, unknown> = { a: zeilenA[0], b: zeilenB[1] }

    const feld = (id: string, el: HTMLElement, zeilen: unknown[], anzeige: string, wert: string): void => {
      if (satz[id] !== undefined && !satzPasstZurAuswahl(el, satz[id])) {
        satz[id] = undefined
        klareAuswahl(id)
      }
      const treffer = einzigenTrefferFinden(
        fensterEintraege(el, zeilen, anzeige, wert),
        satz[id] === undefined,
      )
      if (treffer) {
        satz[id] = treffer.satz
        setzeAuswahl(id, treffer.satz)
      }
    }

    const gelaufen = mitHydrierung(() => {
      feld('a', elA, zeilenA, '7_2', '5_8')
      feld('b', elB, zeilenB, '11_2', '9_8')
    }, () => {
      setzeAuswahl('a', zeilenA[0])
      setzeAuswahl('b', zeilenB[1])
    })

    // Ohne die Notbremse oben liefe das endlos: jede Runde raeumt das eine Feld
    // ab, uebernimmt den einzigen uebrigen Satz, macht damit den Satz des
    // anderen unpassend — und der tut dasselbe zurueck. In der Maske friert der
    // Reiter ein. Was daraus folgt, ist eine Nutzerentscheidung (A7.3): dieser
    // Test BELEGT nur, dass der Fall existiert.
    expect(gelaufen).toBeGreaterThan(RUNDEN_DECKEL)
  })
})
