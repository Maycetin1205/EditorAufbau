import { beforeEach, describe, expect, it } from 'vitest'
import type { SchluesselPaar } from '../../core/data/sourceLinks'
import { seGlobal } from '../../softengine/bridge'
import { ErfassungsLauf } from './erfassungsLauf'
import { anzeigeSpalteIn, fensterSpaltenIn, zielIn, type ErfassungsUmfeld } from './erfassungsZellen'
import type { Spalte } from './spalten'

const spalte = (teil: Partial<Spalte>): Spalte => ({
  titel: 'Spalte', feld: '', art: 'text', ...teil,
})

// Eine Belegposition aus ZWEI Quellen: der Artikel kommt aus der Quelle der
// Tabelle, die Gabe aus einer verknuepften. Eingestellt wird an der
// Erfassungszeile nichts — was eine Zelle tut, steht schon in der Bindung der
// Spalte und in der Verknuepfung des Bausteins.
const ARTIKEL = spalte({ titel: 'Artikel', feld: '3_18' })
const BEZEICHNUNG = spalte({ titel: 'Bezeichnung', feld: '30_40' })
const MENGE = spalte({ titel: 'Menge', art: 'zahl' })
const GABE = spalte({ titel: 'Gabe', feld: 'q-gabe::5_4' })
const GABE_TEXT = spalte({ titel: 'Gabe im Klartext', feld: 'q-gabe::9_20' })

const ZEILE = [ARTIKEL, BEZEICHNUNG, MENGE, GABE, GABE_TEXT]

// „Woran erkennt man die zusammengehoerige Zeile?" — dieselbe Angabe, die die
// Datenzeile laengst benutzt (weitereQuellen am Baustein): die Tierart des
// Artikels trifft die Tierart der Gabe.
const PAARE: SchluesselPaar[] = [{ fromField: '40_4', toField: '2_4' }]

function umfeldMit(
  spalten: readonly Spalte[] = ZEILE,
  paare: readonly SchluesselPaar[] = PAARE,
): ErfassungsUmfeld {
  return {
    spalten,
    quelleId: 'q-art',
    paareZu: (quelleId) => (quelleId === 'q-gabe' ? paare : []),
  }
}

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
  it('leitet die Art der Zelle aus der Bindung der Spalte ab', () => {
    const u = umfeldMit()
    // Kein Feld gebunden: frei tippen — das ist der Weg fuer die Menge.
    expect(zielIn(u, 2)).toEqual({ art: 'frei', quelleId: '', code: '' })
    // Nackter Feldcode: das Feld der Tabellen-Quelle.
    expect(zielIn(u, 0)).toEqual({ art: 'eigen', quelleId: 'q-art', code: '3_18' })
    // Mit Quelle davor: das Feld einer verknuepften Quelle.
    expect(zielIn(u, 3)).toEqual({ art: 'verknuepft', quelleId: 'q-gabe', code: '5_4' })
  })

  it('angezeigt und mitdurchsucht wird die erste ANDERE Spalte derselben Quelle', () => {
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
    expect(lauf.wertVon(u, 2)).toBe('')
    lauf.tippe(2, '3')
    expect(lauf.wertVon(u, 2)).toBe('3')

    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege).toEqual([])
  })

  it('sucht in Nummer UND Bezeichnung der eigenen Quelle', () => {
    const u = umfeldMit()
    lauf.tippe(0, 'bay')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege.map((v) => v.wert)).toEqual(['ART03045'])
    expect(lauf.vorschlaege[0].anzeige).toBe('Baytril 25mg')

    lauf.tippe(0, '00112')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege.map((v) => v.wert)).toEqual(['ART00112'])
  })

  it('die Uebernahme fuellt ALLE Spalten derselben Quelle', () => {
    waehle(0, 'bay')
    const u = umfeldMit()
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

  it('eine verknuepfte Spalte bietet nur die passenden Saetze an', () => {
    waehle(0, 'bay')

    // Baytril ist ein Hunde-Artikel: die Katzen-Salbe steht nicht zur Wahl.
    expect(lauf.eintraege(umfeldMit(), 3).map((e) => e.wert)).toEqual(['ORAL', 'INJ'])
  })

  it('genau EIN Treffer fuellt sich selbst, samt der uebrigen Felder', () => {
    waehle(0, 'Verband')
    const u = umfeldMit()
    expect(lauf.wertVon(u, 3)).toBe('SALB')
    expect(lauf.wertVon(u, 4)).toBe('Salbe')
  })

  it('ohne gewaehlten Basissatz wird NICHT eingeschraenkt', () => {
    const u = umfeldMit()
    expect(lauf.eintraege(u, 3).map((e) => e.wert)).toEqual(['ORAL', 'INJ', 'SALB'])

    // Und ohne eingestellte Verknuepfung ebenso wenig: dann gibt es nichts,
    // wogegen man einschraenken koennte.
    waehle(0, 'bay')
    expect(lauf.eintraege(umfeldMit(ZEILE, []), 3).map((e) => e.wert))
      .toEqual(['ORAL', 'INJ', 'SALB'])
  })

  it('kein Partner: die Zelle bleibt leer, nichts verschwindet', () => {
    waehle(0, 'Spritze')
    const u = umfeldMit()
    expect(lauf.wertVon(u, 0)).toBe('ART00999')
    expect(lauf.wertVon(u, 1)).toBe('Spritze 5ml')
    expect(lauf.wertVon(u, 3)).toBe('')
    expect(lauf.eintraege(u, 3)).toEqual([])
  })

  it('ein neuer Satz der Tabellen-Quelle bestimmt die verknuepften neu', () => {
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

  it('Tasten: Pfeile markieren, Enter uebernimmt, Escape macht nur die Liste zu', () => {
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
    // Das Getippte bleibt stehen.
    expect(lauf.wertVon(u, 0)).toBe('ART0')
  })

  it('Enter in der LEEREN Zelle oeffnet das grosse Fenster, in der freien nie', () => {
    const u = umfeldMit()
    expect(lauf.entscheideTaste(u, 0, 'Enter')).toBe('fenster')
    expect(lauf.entscheideTaste(u, 3, 'Enter')).toBe('fenster')

    // Die freie Zelle hat weder Liste noch Fenster — dort ist jede Taste Text.
    expect(lauf.entscheideTaste(u, 2, 'Enter')).toBe('nichts')
    expect(lauf.entscheideTaste(u, 2, 'ArrowDown')).toBe('nichts')

    // Getippt ohne Treffer tut Enter absichtlich nichts: sonst spraenge das
    // Fenster ueber den Tippfehler und verdeckte ihn.
    lauf.tippe(0, 'gibtsnicht')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.entscheideTaste(u, 0, 'Enter')).toBe('nichts')
  })

  it('ohne Quelle oder ohne Feld bleibt die Liste still leer', () => {
    lauf.tippe(0, 'bay')

    // Die Tabelle hat (noch) keine Quelle.
    lauf.aktualisiereVorschlaege({ ...umfeldMit(), quelleId: '' })
    expect(lauf.vorschlaege).toEqual([])

    // Die gebundene Quelle steht nicht in der Maske.
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
})
