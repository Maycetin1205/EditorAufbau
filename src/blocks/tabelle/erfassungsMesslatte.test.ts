import { beforeEach, describe, expect, it } from 'vitest'
import type { BausteinQuelle } from '../../core/data/sourceLinks'
import { seGlobal } from '../../softengine/bridge'
import { ErfassungsLauf } from './erfassungsLauf'
import { anzeigeSpalteIn, fensterSpaltenIn, type ErfassungsUmfeld } from './erfassungsZellen'
import type { Spalte } from './spalten'

const spalte = (teil: Partial<Spalte>): Spalte => ({
  titel: 'Spalte', feld: '', art: 'text', ...teil,
})

// Das Messlatten-Szenario aus dem Wellen-Kopf G (G3c), im Nutzer-Modell
// (2026-08-19): die Artikel-Spalte ist das POSITIONS-Feld 10_8; Artikel und
// Tierart sind verknuepfte Quellen, beide haengen an diesem Feld. Gesucht wird
// dort, wo die Spalte es sagt (Sucht-in-Wahl am Spaltenkopf) — die Bezeichnung
// zeigt nur an und gibt der Liste ihren Suchtext.
describe('Messlatte: die Tabelle zeigt Belegpositionen (G3c)', () => {
  const POS_SPALTEN = [
    spalte({ titel: 'Artikel', feld: '10_8', suchtIn: 'q-art' }),
    spalte({ titel: 'Bezeichnung', feld: 'q-art::30_40' }),
    spalte({ titel: 'Tierart', feld: 'q-tier::2_10', suchtIn: 'q-tier' }),
    spalte({ titel: 'Menge', feld: '11_6', art: 'zahl' }),
  ]

  const POS_VERKNUEPFUNGEN: BausteinQuelle[] = [
    { quelleId: 'q-art', keyPairs: [{ fromField: '10_8', toField: '3_18' }] },
    { quelleId: 'q-tier', keyPairs: [{ fromField: '10_8', toField: '1_8' }] },
  ]

  const posUmfeld = (): ErfassungsUmfeld => ({
    spalten: POS_SPALTEN,
    quelleId: 'q-pos',
    verknuepfungen: POS_VERKNUEPFUNGEN,
  })

  let lauf: ErfassungsLauf

  beforeEach(() => {
    const g = seGlobal()
    g.FF_DATA_SOURCES = [
      { id: 'q-art', name: 'Artikel', tableId: 'ART', kind: 'art' },
      { id: 'q-tier', name: 'Tierarten', tableId: 'IDBID0007', kind: 'idb' },
    ]
    g.SEDATA = {
      Daten: {
        SEFileLoop: [
          {
            ALIAS: 'Artikel',
            Zeilen: [
              { '3_18': 'ART03045', '30_40': 'Baytril 25mg' },
              { '3_18': 'ART00778', '30_40': 'Felimazol 5mg' },
            ],
          },
          {
            ALIAS: 'Tierarten',
            Zeilen: [
              { '1_8': 'ART03045', '2_10': 'Hund' },
              { '1_8': 'ART03045', '2_10': 'Katze' },
              { '1_8': 'ART00778', '2_10': 'Katze' },
            ],
          },
        ],
      },
    }
    lauf = new ErfassungsLauf()
  })

  const waehleIn = (index: number, getippt: string): void => {
    lauf.tippe(index, getippt)
    lauf.aktualisiereVorschlaege(posUmfeld())
    lauf.uebernimm(posUmfeld(), index, lauf.vorschlaege[0].satz)
  }

  it('die Positions-Spalte Artikel schlaegt im ganzen Stamm nach', () => {
    expect(lauf.eintraege(posUmfeld(), 0)).toHaveLength(2)
  })

  it('die Artikelwahl liefert den Schluessel der werdenden Zeile — Tierart schraenkt sich ein', () => {
    const u = posUmfeld()
    waehleIn(0, 'bay')
    expect(lauf.wertVon(u, 0)).toBe('ART03045')
    expect(lauf.wertVon(u, 1)).toBe('Baytril 25mg')
    // Zwei Tierarten passen — angeboten werden NUR sie, gefuellt wird nichts.
    expect(lauf.eintraege(u, 2).map((e) => e.wert)).toEqual(['Hund', 'Katze'])
    expect(lauf.wertVon(u, 2)).toBe('')
  })

  it('genau eine Tierart fuellt sich selbst', () => {
    const u = posUmfeld()
    waehleIn(0, 'fel')
    expect(lauf.wertVon(u, 2)).toBe('Katze')
    // Selbstgefuelltes ist nicht leer — der Sprung landet auf der Menge.
    expect(lauf.naechsteLeere(u, 0)).toBe(3)
  })

  it('ein neuer Artikel bestimmt die Tierart neu', () => {
    const u = posUmfeld()
    waehleIn(0, 'fel')
    expect(lauf.wertVon(u, 2)).toBe('Katze')
    waehleIn(0, 'bay')
    // Baytril hat zwei Tierarten: die alte Wahl faellt, gefuellt wird nichts.
    expect(lauf.wertVon(u, 2)).toBe('')
  })

  it('Selbstgefuelltes schraenkt die Wahl nicht ein, aus der es kam', () => {
    waehleIn(0, 'fel')
    // Die selbstgefuellte Tierart liefert KEINE Schluessel — sonst zeigte die
    // Artikel-Spalte beim Umentscheiden nur noch den alten Artikel (Kreis).
    expect(lauf.eintraege(posUmfeld(), 0)).toHaveLength(2)
  })

  it('eine von Hand gewaehlte Tierart bestimmt den Artikel', () => {
    const u = posUmfeld()
    waehleIn(2, 'Hund')
    // Nur Baytril kennt den Hund — genau EIN Treffer, er fuellt sich selbst
    // und traegt seine Nummer in die Positions-Spalte.
    expect(lauf.wertVon(u, 0)).toBe('ART03045')
    expect(lauf.wertVon(u, 1)).toBe('Baytril 25mg')
  })
})

// Der Nutzer-Fall vom 2026-08-20: der gemeinsame Schluessel der Tierart steht
// NICHT in der Belegposition, sondern nur im ARTIKELSTAMM (hier: die
// Artikelgruppe). Bis dahin liess sich das gar nicht ausdruecken — jede
// Verknuepfung haengte zwangslaeufig an der eigenen Quelle, die Tierart fiel
// durch `quelleBrauchbar` und tauchte nirgends auf.
describe('zweite Stufe: die Tierart haengt am Artikelstamm', () => {
  const SPALTEN = [
    spalte({ titel: 'Artikel', feld: '10_8', suchtIn: 'q-art' }),
    spalte({ titel: 'Bezeichnung', feld: 'q-art::30_40' }),
    spalte({ titel: 'Tierart', feld: 'q-tier::2_10' }),
  ]

  const VERKNUEPFUNGEN: BausteinQuelle[] = [
    { quelleId: 'q-art', keyPairs: [{ fromField: '10_8', toField: '3_18' }] },
    // Haengt am Artikelstamm: `fromField` ist ein Feld VON q-art.
    { quelleId: 'q-tier', vonQuelleId: 'q-art', keyPairs: [{ fromField: '90_6', toField: '5_6' }] },
  ]

  const umfeld = (): ErfassungsUmfeld => ({
    spalten: SPALTEN, quelleId: 'q-pos', verknuepfungen: VERKNUEPFUNGEN,
  })

  let lauf: ErfassungsLauf

  beforeEach(() => {
    const g = seGlobal()
    g.FF_DATA_SOURCES = [
      { id: 'q-art', name: 'Artikel', tableId: 'ART', kind: 'art' },
      { id: 'q-tier', name: 'Tierarten', tableId: 'IDBID0007', kind: 'idb' },
    ]
    g.SEDATA = {
      Daten: {
        SEFileLoop: [
          {
            ALIAS: 'Artikel',
            Zeilen: [
              { '3_18': 'ART03045', '30_40': 'Baytril 25mg', '90_6': 'RIND' },
              { '3_18': 'ART00778', '30_40': 'Felimazol 5mg', '90_6': 'KATZE' },
            ],
          },
          {
            ALIAS: 'Tierarten',
            Zeilen: [
              { '5_6': 'RIND', '2_10': 'Kuh' },
              { '5_6': 'KATZE', '2_10': 'Katze' },
            ],
          },
        ],
      },
    }
    lauf = new ErfassungsLauf()
  })

  it('die Artikelwahl zieht die Tierart ueber den Stamm nach', () => {
    const u = umfeld()
    lauf.tippe(0, 'bay')
    lauf.aktualisiereVorschlaege(u)
    lauf.uebernimm(umfeld(), 0, lauf.vorschlaege[0].satz)
    expect(lauf.wertVon(u, 0)).toBe('ART03045')
    // Der Schluessel RIND steht nur im Artikelstamm — er fuehrt zur Kuh.
    expect(lauf.wertVon(u, 2)).toBe('Kuh')
  })

  it('ein anderer Artikel bestimmt die Tierart neu', () => {
    const u = umfeld()
    lauf.tippe(0, 'bay')
    lauf.aktualisiereVorschlaege(u)
    lauf.uebernimm(umfeld(), 0, lauf.vorschlaege[0].satz)
    expect(lauf.wertVon(u, 2)).toBe('Kuh')
    lauf.tippe(0, 'fel')
    lauf.aktualisiereVorschlaege(umfeld())
    lauf.uebernimm(umfeld(), 0, lauf.vorschlaege[0].satz)
    expect(lauf.wertVon(u, 2)).toBe('Katze')
  })

  it('ohne gewaehlten Artikel ist der Schluessel unbekannt — nichts fuellt sich', () => {
    expect(lauf.wertVon(umfeld(), 2)).toBe('')
  })
})

// „Zeigt beim Suchen" (Nutzer 2026-08-20): welche Felder der Hilfstabelle die
// Vorschlagsliste und das Fenster zeigen, waehlt der Nutzer je Spalte. Vorher
// leitete die Liste ihre Anzeige ab (Wert + erste Nachbarspalte) — waehlbar
// war nichts, und in einer Spalte ohne Nachbarn blieb nur der Wert.
describe('Zeigt beim Suchen: gewaehlte Felder schlagen die Automatik', () => {
  const umfeldMit = (suchFelder?: { feld: string; titel: string }[]): ErfassungsUmfeld => ({
    spalten: [
      spalte({ titel: 'Artikel', feld: '10_8', suchtIn: 'q-art', ...(suchFelder ? { suchFelder } : {}) }),
      spalte({ titel: 'Bezeichnung', feld: 'q-art::30_40' }),
    ],
    quelleId: 'q-pos',
    verknuepfungen: [{ quelleId: 'q-art', keyPairs: [{ fromField: '10_8', toField: '3_18' }] }],
  })

  it('ohne Wahl bleibt die Automatik: Nachbarspalte + Wert', () => {
    const raus = fensterSpaltenIn(umfeldMit(), 0)
    expect(raus.map((s) => s.feld)).toEqual(['30_40', '3_18'])
  })

  it('mit Wahl zeigt das Fenster GENAU die gewaehlten Felder, mit Klarnamen', () => {
    const raus = fensterSpaltenIn(umfeldMit([
      { feld: '3_18', titel: 'Artikelnummer' },
      { feld: '90_6', titel: 'Warengruppe' },
    ]), 0)
    expect(raus.map((s) => s.feld)).toEqual(['3_18', '90_6'])
    expect(raus.map((s) => s.titel)).toEqual(['Artikelnummer', 'Warengruppe'])
  })

  it('das erste gewaehlte Feld ist die Anzeige der Vorschlagsliste', () => {
    const raus = anzeigeSpalteIn(umfeldMit([{ feld: '90_6', titel: 'Warengruppe' }]), 0)
    expect(raus).toEqual({ titel: 'Warengruppe', code: '90_6' })
  })
})
