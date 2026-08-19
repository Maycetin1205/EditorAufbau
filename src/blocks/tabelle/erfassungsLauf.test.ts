import { beforeEach, describe, expect, it } from 'vitest'
import type { BausteinQuelle } from '../../core/data/sourceLinks'
import { seGlobal } from '../../softengine/bridge'
import { ErfassungsAnschluss } from './erfassungsAnschluss'
import { ErfassungsLauf } from './erfassungsLauf'
import { anzeigeSpalteIn, fensterSpaltenIn, zielIn, type ErfassungsUmfeld } from './erfassungsZellen'
import type { Spalte } from './spalten'

const spalte = (teil: Partial<Spalte>): Spalte => ({
  titel: 'Spalte', feld: '', art: 'text', ...teil,
})

// Das Nutzer-Modell (2026-08-19): die Tabelle zeigt die BELEGPOSITIONEN, und
// jede schreibende Spalte ist ein FELD DER POSITION. WO eine Zelle beim
// Erfassen sucht, WÄHLT der Nutzer am Spaltenkopf („Sucht beim Erfassen in") —
// abgeleitet wird das seit dem 19.08. nicht mehr. Welchen Wert der gewählte
// Satz liefert, sagt weiter die Verknüpfung (Schlüsselpaar
// Position.Artikelnummer ↔ Stamm.Artikelnummer).
//
// Der Bogen mischt darum absichtlich beides: Spalten, die suchen (Artikel,
// Bezeichnung, Gabe), und eine reine Anzeige-Spalte, die nur zeigt, was der
// gewählte Satz liefert (Gabe im Klartext).
const ARTIKEL = spalte({ titel: 'Artikel', feld: '10_8', suchtIn: 'q-art' })
const BEZEICHNUNG = spalte({ titel: 'Bezeichnung', feld: 'q-art::30_40', suchtIn: 'q-art' })
const MENGE = spalte({ titel: 'Menge', feld: '11_6', art: 'zahl' })
const GABE = spalte({ titel: 'Gabe', feld: 'q-gabe::5_4', suchtIn: 'q-gabe' })
const GABE_TEXT = spalte({ titel: 'Gabe im Klartext', feld: 'q-gabe::9_20' })
const NOTIZ = spalte({ titel: 'Notiz' })

const ZEILE = [ARTIKEL, BEZEICHNUNG, MENGE, GABE, GABE_TEXT, NOTIZ]

// „Woran erkennt man die zusammengehörige Zeile?" — dieselbe Angabe, die die
// Datenzeile längst benutzt (weitereQuellen am Baustein). Der gewählte
// Artikel liefert der werdenden Position Artikelnummer UND Tierart; an der
// Tierart hängt die Gabe.
const VERKNUEPFUNGEN: BausteinQuelle[] = [
  {
    quelleId: 'q-art',
    keyPairs: [
      { fromField: '10_8', toField: '3_18' },
      { fromField: '12_4', toField: '40_4' },
    ],
  },
  { quelleId: 'q-gabe', keyPairs: [{ fromField: '12_4', toField: '2_4' }] },
]

function umfeldMit(
  spalten: readonly Spalte[] = ZEILE,
  verknuepfungen: readonly BausteinQuelle[] = VERKNUEPFUNGEN,
): ErfassungsUmfeld {
  return { spalten, quelleId: 'q-pos', verknuepfungen }
}

function quellenStellen(): void {
  const g = seGlobal()
  g.FF_DATA_SOURCES = [
    { id: 'q-art', name: 'Artikel', tableId: 'ART', kind: 'art' },
    { id: 'q-gabe', name: 'Gaben', tableId: 'IDBID0001', kind: 'idb' },
  ]
  g.SEDATA = {
    Daten: {
      SEFileLoop: [
        {
          ALIAS: 'Artikel',
          Zeilen: [
            { '3_18': 'ART03045', '30_40': 'Baytril 25mg', '40_4': 'HUND' },
            { '3_18': 'ART00112', '30_40': 'Verband klein', '40_4': 'KATZ' },
            { '3_18': 'ART00999', '30_40': 'Spritze 5ml', '40_4': 'VOGEL' },
          ],
        },
        {
          ALIAS: 'Gaben',
          Zeilen: [
            { '5_4': 'ORAL', '9_20': 'oral', '2_4': 'HUND' },
            { '5_4': 'INJ', '9_20': 'Injektion', '2_4': 'HUND' },
            { '5_4': 'SALB', '9_20': 'Salbe', '2_4': 'KATZ' },
          ],
        },
      ],
    },
  }
}

describe('Zellen der Erfassungszeile', () => {
  it('nimmt Feld UND Sucht-in-Wahl der Spalte, leitet nichts ab', () => {
    const u = umfeldMit()
    // Kein Feld gebunden: frei tippen.
    expect(zielIn(u, 5)).toEqual({ art: 'frei', quelleId: '', code: '', suchQuelleId: '' })
    // Eigenes Feld ohne Sucht-in: frei tippen — die Menge gehört der Position,
    // die Datenzeile zeigt dasselbe Feld.
    expect(zielIn(u, 2))
      .toEqual({ art: 'eigen', quelleId: '', code: '11_6', suchQuelleId: '' })
    // Eigenes Feld MIT Sucht-in: die Zelle sucht dort, und das Schlüsselpaar
    // sagt, welches Feld des gewählten Satzes ihr Wert ist.
    expect(zielIn(u, 0))
      .toEqual({ art: 'auswahl', quelleId: 'q-art', code: '3_18', suchQuelleId: 'q-art' })
    // Feld einer verknüpften Quelle: der Wert kommt aus ihrem gewählten Satz.
    expect(zielIn(u, 3))
      .toEqual({ art: 'auswahl', quelleId: 'q-gabe', code: '5_4', suchQuelleId: 'q-gabe' })
    // Ohne Sucht-in zeigt dieselbe Bindung nur an — sie sucht nicht.
    expect(zielIn(u, 4))
      .toEqual({ art: 'auswahl', quelleId: 'q-gabe', code: '9_20', suchQuelleId: '' })
    // Die eigene Quelle ausdrücklich davor ändert nichts.
    expect(zielIn(umfeldMit([spalte({ feld: 'q-pos::11_6' })]), 0))
      .toEqual({ art: 'eigen', quelleId: '', code: '11_6', suchQuelleId: '' })
    // Eine Sucht-in-Wahl auf eine Quelle, die nicht (mehr) verknüpft ist,
    // hinterlässt keine Geisterliste.
    expect(zielIn(umfeldMit(ZEILE, []), 0))
      .toEqual({ art: 'eigen', quelleId: '', code: '10_8', suchQuelleId: '' })
  })

  it('angezeigt und mitdurchsucht wird die erste ANDERE Spalte derselben Such-Quelle', () => {
    const u = umfeldMit()
    expect(anzeigeSpalteIn(u, 0)).toEqual({ titel: 'Bezeichnung', code: '30_40' })
    expect(anzeigeSpalteIn(u, 3)).toEqual({ titel: 'Gabe im Klartext', code: '9_20' })

    // Ohne zweite Spalte derselben Quelle bleibt es beim Wert selbst — dann
    // macht das Fenster seine eigene Automatik.
    const knapp = umfeldMit([ARTIKEL, MENGE])
    expect(anzeigeSpalteIn(knapp, 0)).toBeUndefined()
    expect(fensterSpaltenIn(knapp, 0)).toEqual([])

    expect(fensterSpaltenIn(u, 3)).toEqual([
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

  const waehle = (index: number, getippt: string, treffer = 0): void => {
    lauf.tippe(index, getippt)
    lauf.aktualisiereVorschlaege(umfeldMit())
    lauf.uebernimm(umfeldMit(), index, lauf.vorschlaege[treffer].satz)
  }

  it('eine freie Zelle nimmt nur Getipptes und zeigt nie eine Liste', () => {
    const u = umfeldMit()
    expect(lauf.wertVon(u, 5)).toBe('')
    lauf.tippe(5, 'nüchtern bringen')
    expect(lauf.wertVon(u, 5)).toBe('nüchtern bringen')

    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege).toEqual([])
  })

  it('ein ungekoppeltes eigenes Feld tippt genauso frei — die Menge', () => {
    const u = umfeldMit()
    lauf.tippe(2, '3')
    expect(lauf.wertVon(u, 2)).toBe('3')

    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege).toEqual([])
  })

  it('die gekoppelte Zelle sucht in Nummer UND Bezeichnung des Stamms', () => {
    const u = umfeldMit()
    lauf.tippe(0, 'bay')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege.map((v) => v.wert)).toEqual(['ART03045'])
    expect(lauf.vorschlaege[0].anzeige).toBe('Baytril 25mg')

    lauf.tippe(0, '00112')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege.map((v) => v.wert)).toEqual(['ART00112'])
  })

  it('die Uebernahme fuellt ALLE Spalten, die in derselben Quelle waehlen', () => {
    waehle(0, 'bay')
    const u = umfeldMit()
    // Die Artikel-Zelle traegt den Wert des PARTNER-Felds: das ist die
    // Artikelnummer der werdenden Position.
    expect(lauf.wertVon(u, 0)).toBe('ART03045')
    expect(lauf.wertVon(u, 1)).toBe('Baytril 25mg')

    // Nach der Uebernahme steht der Wert in der Zelle, nicht das Suchwort.
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege).toEqual([])
    expect(lauf.tippSpalte).toBe(-1)
  })

  it('getippt wird in JEDER Spalte der Quelle — auch in der Bezeichnung', () => {
    const u = umfeldMit()
    // Der Bediener tippt in die BEZEICHNUNG, nicht in die Nummer. Gesucht wird
    // trotzdem in beidem, und die Uebernahme fuellt die Nummer gleich mit.
    lauf.tippe(1, 'bay')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege.map((v) => v.wert)).toEqual(['Baytril 25mg'])
    expect(lauf.vorschlaege[0].anzeige).toBe('ART03045')

    lauf.uebernimm(u, 1, lauf.vorschlaege[0].satz)
    expect(lauf.wertVon(u, 0)).toBe('ART03045')
    expect(lauf.wertVon(u, 1)).toBe('Baytril 25mg')

    // Auch die Artikelnummer laesst sich als Suchwort in die Bezeichnung
    // tippen: gesucht wird in Nummer UND Bezeichnung, egal welche Zelle.
    lauf.zuruecksetzen()
    lauf.tippe(1, 'ART03045')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege.map((v) => v.wert)).toEqual(['Baytril 25mg'])
  })

  it('eine zweite Auswahl-Quelle bietet nur die passenden Saetze an', () => {
    waehle(0, 'bay')

    // Baytril ist ein Hunde-Artikel: die Katzen-Salbe steht nicht zur Wahl.
    // Den Schluessel liefert der gewaehlte Artikel ueber sein zweites Paar
    // (Tierart der werdenden Position).
    expect(lauf.eintraege(umfeldMit(), 3).map((e) => e.wert)).toEqual(['ORAL', 'INJ'])
  })

  it('genau EIN Treffer fuellt sich selbst, samt der uebrigen Felder', () => {
    waehle(0, 'Verband')
    const u = umfeldMit()
    expect(lauf.wertVon(u, 3)).toBe('SALB')
    expect(lauf.wertVon(u, 4)).toBe('Salbe')
  })

  it('ohne gewaehlten Satz wird NICHT eingeschraenkt', () => {
    const u = umfeldMit()
    expect(lauf.eintraege(u, 3).map((e) => e.wert)).toEqual(['ORAL', 'INJ', 'SALB'])
  })

  it('eine Sucht-in-Wahl ohne Verknuepfung sucht nirgends', () => {
    // Die Wahl am Spaltenkopf zeigt auf eine Quelle, die am Baustein nicht
    // (mehr) verknuepft ist. Dann gibt es kein Schluesselpaar, an dem die
    // Zeile haengen koennte — eine Liste waere eine Geisterliste ueber einer
    // Quelle, die mit dieser Tabelle nichts zu tun hat.
    waehle(0, 'bay')
    const ohne = umfeldMit(ZEILE, [])
    expect(lauf.eintraege(ohne, 3)).toEqual([])
    expect(lauf.entscheideTaste(ohne, 3, 'Enter')).toBe('weiter')
  })

  it('kein Partner: die Zelle bleibt leer, nichts verschwindet', () => {
    waehle(0, 'Spritze')
    const u = umfeldMit()
    expect(lauf.wertVon(u, 0)).toBe('ART00999')
    expect(lauf.wertVon(u, 1)).toBe('Spritze 5ml')
    expect(lauf.wertVon(u, 3)).toBe('')
    expect(lauf.eintraege(u, 3)).toEqual([])
  })

  it('ein neuer Artikel bestimmt die abhaengigen Quellen neu', () => {
    waehle(0, 'bay')
    // Zwei moegliche Gaben — der Bediener entscheidet.
    lauf.tippe(3, 'inj')
    lauf.aktualisiereVorschlaege(umfeldMit())
    lauf.uebernimm(umfeldMit(), 3, lauf.vorschlaege[0].satz)
    expect(lauf.wertVon(umfeldMit(), 4)).toBe('Injektion')

    // Der neue Artikel loest die Gabe: sie hing an SEINEM Schluessel.
    waehle(0, 'Verband')
    expect(lauf.wertVon(umfeldMit(), 3)).toBe('SALB')
    expect(lauf.wertVon(umfeldMit(), 4)).toBe('Salbe')
  })

  it('Umentscheiden: eine SPAETERE Wahl haelt den Artikel nicht fest', () => {
    waehle(0, 'bay')
    waehle(3, 'inj')
    // Die Gabe wurde NACH dem Artikel gewaehlt und hing an ihm — beim
    // Neu-Tippen im Artikel darf sie ihn nicht auf Hunde-Artikel
    // einschraenken, sonst kaeme man aus der eigenen Wahl nie wieder heraus.
    lauf.tippe(0, 'Verband')
    lauf.aktualisiereVorschlaege(umfeldMit())
    expect(lauf.vorschlaege.map((v) => v.wert)).toEqual(['ART00112'])
  })

  it('eine FRUEHERE Wahl filtert dagegen: erst die Gabe, dann der Artikel', () => {
    waehle(3, 'inj')
    // Injektion ist eine Hunde-Gabe: die Artikel-Spalte bietet danach nur
    // noch Hunde-Artikel an — genau der gewollte Zeilen-Filter.
    lauf.tippe(0, 'ART0')
    lauf.aktualisiereVorschlaege(umfeldMit())
    expect(lauf.vorschlaege.map((v) => v.wert)).toEqual(['ART03045'])
  })

  it('Tasten: Pfeile markieren, Enter uebernimmt, Escape ist zweistufig', () => {
    const u = umfeldMit()
    lauf.tippe(0, 'ART0')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege).toHaveLength(3)
    expect(lauf.marke).toBe(0)

    expect(lauf.entscheideTaste(u, 0, 'ArrowDown')).toBe('marke-runter')
    expect(lauf.marke).toBe(1)
    expect(lauf.entscheideTaste(u, 0, 'ArrowUp')).toBe('marke-hoch')
    expect(lauf.marke).toBe(0)

    expect(lauf.entscheideTaste(u, 0, 'Enter')).toBe('uebernehmen')

    expect(lauf.entscheideTaste(u, 0, 'Escape')).toBe('liste-zu')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege).toEqual([])
    // Stufe 1: das Getippte bleibt stehen.
    expect(lauf.wertVon(u, 0)).toBe('ART0')

    // Stufe 2: die naechste Escape leert die Zelle.
    expect(lauf.entscheideTaste(u, 0, 'Escape')).toBe('leeren')
    lauf.leere(u, 0)
    expect(lauf.wertVon(u, 0)).toBe('')
    expect(lauf.entscheideTaste(u, 0, 'Escape')).toBe('nichts')
  })

  it('Enter in der LEEREN Auswahl-Zelle oeffnet das grosse Fenster, sonst geht es weiter', () => {
    const u = umfeldMit()
    expect(lauf.entscheideTaste(u, 0, 'Enter')).toBe('fenster')
    expect(lauf.entscheideTaste(u, 3, 'Enter')).toBe('fenster')

    // Menge (eigenes Feld ohne Sucht-in) und Notiz (ungebunden) haben weder
    // Liste noch Fenster — Enter springt weiter, alles andere ist Text.
    expect(lauf.entscheideTaste(u, 2, 'Enter')).toBe('weiter')
    expect(lauf.entscheideTaste(u, 2, 'ArrowDown')).toBe('nichts')
    expect(lauf.entscheideTaste(u, 5, 'Enter')).toBe('weiter')

    // Getippt ohne Treffer haelt Enter absichtlich an: sonst rauscht der
    // Fluss ueber den Tippfehler hinweg.
    lauf.tippe(0, 'gibtsnicht')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.entscheideTaste(u, 0, 'Enter')).toBe('nichts')
  })

  it('Tab uebernimmt bei offener Liste und springt sonst weiter', () => {
    const u = umfeldMit()
    expect(lauf.entscheideTaste(u, 0, 'Tab')).toBe('weiter')

    lauf.tippe(0, 'bay')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.entscheideTaste(u, 0, 'Tab')).toBe('uebernehmen')

    // Ueber den Tippfehler, an dem Enter anhaelt, traegt Tab hinweg.
    lauf.tippe(0, 'gibtsnicht')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.entscheideTaste(u, 0, 'Enter')).toBe('nichts')
    expect(lauf.entscheideTaste(u, 0, 'Tab')).toBe('weiter')
  })

  it('Enter geht auf gewaehlten Werten weiter statt anzuhalten', () => {
    const u = umfeldMit()
    waehle(0, 'bay')
    expect(lauf.entscheideTaste(u, 0, 'Enter')).toBe('weiter')
  })

  it('kein einziger moeglicher Satz: Enter springt weiter statt ins Fenster', () => {
    const u = umfeldMit()
    // Die Spritze traegt Tierart VOGEL — keine Gabe passt zu ihr.
    waehle(0, 'Spritze')
    expect(lauf.eintraege(u, 3)).toEqual([])
    expect(lauf.entscheideTaste(u, 3, 'Enter')).toBe('weiter')
  })

  it('leeren loest den gewaehlten Satz — die Schwesterspalten leeren mit', () => {
    const u = umfeldMit()
    waehle(0, 'bay')
    expect(lauf.wertVon(u, 1)).toBe('Baytril 25mg')
    lauf.leere(u, 0)
    expect(lauf.wertVon(u, 0)).toBe('')
    expect(lauf.wertVon(u, 1)).toBe('')
  })

  it('naechsteLeere ueberspringt Gefuelltes', () => {
    const u = umfeldMit()
    // Verband (KATZ) hat genau eine Gabe: 3 und 4 fuellen sich selbst.
    waehle(0, 'Verband')
    expect(lauf.naechsteLeere(u, 0)).toBe(2)
    expect(lauf.naechsteLeere(u, 2)).toBe(5)
    expect(lauf.naechsteLeere(u, 5)).toBe(-1)
  })

  it('eine unbekannte Quelle laesst die Liste still leer', () => {
    lauf.tippe(0, 'bay')
    lauf.aktualisiereVorschlaege(umfeldMit([spalte({ feld: 'gibt-es-nicht::3_18' })]))
    expect(lauf.vorschlaege).toEqual([])
  })

  it('Zuruecksetzen raeumt Getipptes und alle Saetze weg', () => {
    waehle(0, 'Verband')
    lauf.tippe(2, '7')

    lauf.zuruecksetzen()
    const u = umfeldMit()
    expect(lauf.wertVon(u, 0)).toBe('')
    expect(lauf.wertVon(u, 1)).toBe('')
    expect(lauf.wertVon(u, 2)).toBe('')
    expect(lauf.wertVon(u, 3)).toBe('')
  })

  it('die erfasste Zeile traegt Getipptes UND Gekoppeltes — das liest der Knopf', () => {
    const anschluss = new ErfassungsAnschluss()
    const u = umfeldMit()
    anschluss.lauf.tippe(0, 'bay')
    anschluss.lauf.aktualisiereVorschlaege(u)
    anschluss.lauf.uebernimm(u, 0, anschluss.lauf.vorschlaege[0].satz)
    anschluss.lauf.tippe(2, '2')
    expect(anschluss.erfasse(u)).toBe(true)
    // Artikelnummer aus der Kopplung, Menge von Hand; die Gabe blieb offen
    // (zwei Treffer), Notiz leer.
    expect(anschluss.zeilen[0]).toEqual(['ART03045', 'Baytril 25mg', '2', '', '', ''])
  })
})

