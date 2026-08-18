import { beforeEach, describe, expect, it } from 'vitest'
import { seGlobal } from '../../softengine/bridge'
import { ErfassungsLauf } from './erfassungsLauf'
import {
  anzeigeFeldDerZeile,
  fensterSpaltenFuer,
  ROLLE_FOLGT,
  ROLLE_FREI,
  ROLLE_NACHSCHLAGEN,
  rolleVon,
  rollenFeldVon,
  rollenQuelleVon,
} from './erfassungsRollen'
import type { Spalte } from './spalten'

const spalte = (teil: Partial<Spalte>): Spalte => ({
  titel: 'Spalte', feld: '', art: 'text', ...teil,
})

// Eine Belegposition mit ZWEI Nachschlage-Quellen: Artikel und
// Verabreichungsart. Genau darum haengt die Quelle an der Spalte und nicht an
// der Tabelle (Nutzer-Korrektur 2026-08-18).
const ARTIKEL = spalte({
  titel: 'Artikel',
  rolle: ROLLE_NACHSCHLAGEN, rollenQuelle: 'q-art', erfassung: { feld: '3_18' },
})
const BEZEICHNUNG = spalte({
  titel: 'Bezeichnung',
  rolle: ROLLE_FOLGT, rollenQuelle: 'q-art', erfassung: { feld: '30_40' },
})
const MENGE = spalte({ titel: 'Menge', art: 'zahl', rolle: ROLLE_FREI, vorbelegung: '1' })
const GABE = spalte({
  titel: 'Gabe',
  rolle: ROLLE_NACHSCHLAGEN, rollenQuelle: 'q-gabe', erfassung: { feld: '5_4' },
})
const GABE_TEXT = spalte({
  titel: 'Gabe im Klartext',
  rolle: ROLLE_FOLGT, rollenQuelle: 'q-gabe', erfassung: { feld: '9_20' },
})

const ZEILE = [ARTIKEL, BEZEICHNUNG, MENGE, GABE, GABE_TEXT]

function quellenStellen(): void {
  const g = seGlobal()
  g.FF_DATA_SOURCES = [
    { id: 'q-art', name: 'Artikel', tableId: 'IDBID0003', kind: 'idb' },
    { id: 'q-gabe', name: 'Gaben', tableId: 'IDBID0001', kind: 'idb' },
  ]
  g.SEDATA = {
    Daten: {
      SEFileLoop: [
        {
          ALIAS: 'Artikel',
          Zeilen: [
            { '3_18': 'ART03045', '30_40': 'Baytril 25mg' },
            { '3_18': 'ART00112', '30_40': 'Verband klein' },
          ],
        },
        {
          ALIAS: 'Gaben',
          Zeilen: [
            { '5_4': 'ORAL', '9_20': 'oral' },
            { '5_4': 'INJ', '9_20': 'Injektion' },
          ],
        },
      ],
    },
  }
}

describe('Rollen der Erfassungszeile', () => {
  it('ohne Angabe ist eine Zelle frei, kaputte Rollen fallen auf frei zurueck', () => {
    expect(rolleVon(spalte({}))).toBe(ROLLE_FREI)
    expect(rolleVon(spalte({ rolle: 'gibt-es-nicht' }))).toBe(ROLLE_FREI)
    expect(rolleVon(ARTIKEL)).toBe(ROLLE_NACHSCHLAGEN)
  })

  it('jede Spalte nennt ihre EIGENE Quelle; die freie Zelle hat keine', () => {
    expect(rollenQuelleVon(ARTIKEL)).toBe('q-art')
    expect(rollenQuelleVon(GABE)).toBe('q-gabe')
    expect(rollenQuelleVon(BEZEICHNUNG)).toBe('q-art')

    // An einer freien Zelle zaehlt eine stehengebliebene Quelle nicht mit.
    expect(rollenQuelleVon(spalte({ rolle: ROLLE_FREI, rollenQuelle: 'q-art' }))).toBe('')
    expect(rollenFeldVon(MENGE)).toBe('')
  })

  it('angezeigt und mitdurchsucht wird die erste Folgt-Spalte DERSELBEN Quelle', () => {
    expect(anzeigeFeldDerZeile(ZEILE, 'q-art')).toBe('30_40')
    expect(anzeigeFeldDerZeile(ZEILE, 'q-gabe')).toBe('9_20')

    // Ohne passende Folgt-Spalte bleibt nur die Nummer — dann macht das
    // Fenster seine eigene Automatik.
    expect(anzeigeFeldDerZeile([ARTIKEL, MENGE], 'q-art')).toBe('')
    expect(fensterSpaltenFuer([ARTIKEL, MENGE], ARTIKEL)).toEqual([])

    expect(fensterSpaltenFuer(ZEILE, GABE)).toEqual([
      { titel: 'Gabe im Klartext', feld: '9_20', art: 'text' },
      { titel: 'Gabe', feld: '5_4', art: 'text' },
    ])
  })
})

describe('ErfassungsLauf', () => {
  let lauf: ErfassungsLauf

  beforeEach(() => {
    quellenStellen()
    lauf = new ErfassungsLauf()
  })

  it('zeigt die Vorbelegung, bis jemand darin tippt', () => {
    expect(lauf.wertVon(2, MENGE)).toBe('1')
    lauf.tippe(2, '3')
    expect(lauf.wertVon(2, MENGE)).toBe('3')

    // Leer getippt bleibt leer — sonst spraenge die Vorbelegung zurueck und
    // ueberschriebe, was der Bediener gerade weggeloescht hat.
    lauf.tippe(2, '')
    expect(lauf.wertVon(2, MENGE)).toBe('')
  })

  it('sucht in Nummer UND Bezeichnung der eigenen Quelle', () => {
    lauf.tippe(0, 'bay')
    lauf.aktualisiereVorschlaege(ZEILE)
    expect(lauf.vorschlaege.map((v) => v.wert)).toEqual(['ART03045'])
    expect(lauf.vorschlaege[0].anzeige).toBe('Baytril 25mg')

    lauf.tippe(0, '00112')
    lauf.aktualisiereVorschlaege(ZEILE)
    expect(lauf.vorschlaege.map((v) => v.wert)).toEqual(['ART00112'])

    // Dieselbe Zeile, andere Spalte: die Treffer kommen aus DEREN Quelle.
    lauf.tippe(3, 'inj')
    lauf.aktualisiereVorschlaege(ZEILE)
    expect(lauf.vorschlaege.map((v) => v.wert)).toEqual(['INJ'])
  })

  it('jede Quelle traegt ihren eigenen Satz — zwei Wahlen stehen nebeneinander', () => {
    lauf.tippe(0, 'bay')
    lauf.aktualisiereVorschlaege(ZEILE)
    lauf.uebernimm(0, ARTIKEL, lauf.vorschlaege[0].satz)

    expect(lauf.wertVon(0, ARTIKEL)).toBe('ART03045')
    expect(lauf.wertVon(1, BEZEICHNUNG)).toBe('Baytril 25mg')
    // Die Zellen der ANDEREN Quelle bleiben unberuehrt.
    expect(lauf.wertVon(4, GABE_TEXT)).toBe('')

    lauf.tippe(3, 'inj')
    lauf.aktualisiereVorschlaege(ZEILE)
    lauf.uebernimm(3, GABE, lauf.vorschlaege[0].satz)

    expect(lauf.wertVon(3, GABE)).toBe('INJ')
    expect(lauf.wertVon(4, GABE_TEXT)).toBe('Injektion')
    // Und der Artikel steht weiterhin.
    expect(lauf.wertVon(1, BEZEICHNUNG)).toBe('Baytril 25mg')
  })

  it('nach der Uebernahme steht der Wert in der Zelle, nicht das Suchwort', () => {
    lauf.tippe(0, 'bay')
    lauf.aktualisiereVorschlaege(ZEILE)
    lauf.uebernimm(0, ARTIKEL, lauf.vorschlaege[0].satz)

    lauf.aktualisiereVorschlaege(ZEILE)
    expect(lauf.vorschlaege).toEqual([])
    expect(lauf.tippSpalte).toBe(-1)
    expect(lauf.wertVon(0, ARTIKEL)).toBe('ART03045')
  })

  it('Tasten: Pfeile markieren, Enter uebernimmt, Escape macht nur die Liste zu', () => {
    lauf.tippe(0, 'ART')
    lauf.aktualisiereVorschlaege(ZEILE)
    expect(lauf.vorschlaege).toHaveLength(2)
    expect(lauf.marke).toBe(0)

    expect(lauf.entscheideTaste(0, 'ArrowDown', ARTIKEL)).toBe('marke-runter')
    expect(lauf.marke).toBe(1)
    // Die Marke laeuft um.
    expect(lauf.entscheideTaste(0, 'ArrowDown', ARTIKEL)).toBe('marke-runter')
    expect(lauf.marke).toBe(0)

    expect(lauf.entscheideTaste(0, 'Enter', ARTIKEL)).toBe('uebernehmen')

    expect(lauf.entscheideTaste(0, 'Escape', ARTIKEL)).toBe('liste-zu')
    lauf.aktualisiereVorschlaege(ZEILE)
    expect(lauf.vorschlaege).toEqual([])
    // Das Getippte bleibt stehen.
    expect(lauf.wertVon(0, ARTIKEL)).toBe('ART')
  })

  it('Enter in der LEEREN Zelle oeffnet das grosse Fenster', () => {
    expect(lauf.entscheideTaste(0, 'Enter', ARTIKEL)).toBe('fenster')

    // Getippt ohne Treffer tut Enter absichtlich nichts: sonst spraenge das
    // Fenster ueber den Tippfehler und verdeckte ihn.
    lauf.tippe(0, 'gibtsnicht')
    lauf.aktualisiereVorschlaege(ZEILE)
    expect(lauf.entscheideTaste(0, 'Enter', ARTIKEL)).toBe('nichts')
  })

  it('Frei- und Folgt-Zellen kennen keine Tasten der Liste', () => {
    expect(lauf.entscheideTaste(2, 'Enter', MENGE)).toBe('nichts')
    expect(lauf.entscheideTaste(1, 'ArrowDown', BEZEICHNUNG)).toBe('nichts')
  })

  it('ohne Quelle oder ohne Feld bleibt die Liste still leer', () => {
    lauf.tippe(0, 'bay')

    lauf.aktualisiereVorschlaege([
      spalte({ rolle: ROLLE_NACHSCHLAGEN, erfassung: { feld: '3_18' } }),
    ])
    expect(lauf.vorschlaege).toEqual([])

    lauf.aktualisiereVorschlaege([spalte({ rolle: ROLLE_NACHSCHLAGEN, rollenQuelle: 'q-art' })])
    expect(lauf.vorschlaege).toEqual([])

    lauf.aktualisiereVorschlaege([spalte({
      rolle: ROLLE_NACHSCHLAGEN, rollenQuelle: 'gibt-es-nicht', erfassung: { feld: '3_18' },
    })])
    expect(lauf.vorschlaege).toEqual([])
  })

  it('Zuruecksetzen raeumt Getipptes und alle Saetze weg', () => {
    lauf.tippe(0, 'bay')
    lauf.aktualisiereVorschlaege(ZEILE)
    lauf.uebernimm(0, ARTIKEL, lauf.vorschlaege[0].satz)
    lauf.tippe(2, '7')

    lauf.zuruecksetzen()
    expect(lauf.wertVon(0, ARTIKEL)).toBe('')
    expect(lauf.wertVon(1, BEZEICHNUNG)).toBe('')
    expect(lauf.wertVon(2, MENGE)).toBe('1')
  })
})
