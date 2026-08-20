import { beforeEach, describe, expect, it } from 'vitest'
import {
  ARTIKEL,
  GABE_TEXT,
  MENGE,
  quellenStellen,
  spalte,
  umfeldMit,
  ZEILE,
} from '../../test/erfassungsBogen'
import { ErfassungsAnschluss } from './erfassungsAnschluss'
import { ErfassungsLauf } from './erfassungsLauf'
import { anzeigeSpalteIn, fensterSpaltenIn, zielIn } from './erfassungsZellen'

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
    // Ganz ohne Verknüpfung sucht dieselbe Spalte trotzdem dort: eine
    // Hilfstabelle ist eine Nachschlage-Liste. Nur den Zellwert liefert dann
    // kein Schlüsselpaar mehr — die Zelle behält ihr eigenes Feld.
    expect(zielIn(umfeldMit(ZEILE, []), 0))
      .toEqual({ art: 'eigen', quelleId: '', code: '10_8', suchQuelleId: 'q-art' })
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

  it('sucht auch, wo kein Schluesselpaar den Wert liefert', () => {
    // Die Menge ist ein eigenes Feld OHNE Paar zu den Gaben — sucht aber laut
    // Spaltenkopf dort. Dann liefert die Liste keinen Zellwert; sie waehlt den
    // Satz fuer die ZEILE, und die Anzeige-Spalte zeigt ihn. Das Getippte der
    // Zelle bleibt stehen, weil es ihr eigener Wert ist.
    const u = umfeldMit([
      spalte({ titel: 'Menge', feld: '11_6', art: 'zahl', suchtIn: 'q-gabe' }),
      GABE_TEXT,
    ])
    expect(zielIn(u, 0))
      .toEqual({ art: 'eigen', quelleId: '', code: '11_6', suchQuelleId: 'q-gabe' })
    expect(lauf.eintraege(u, 0).map((e) => e.anzeige)).toEqual(['oral', 'Injektion', 'Salbe'])

    lauf.tippe(0, 'inj')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege).toHaveLength(1)
    lauf.uebernimm(u, 0, lauf.vorschlaege[0].satz)
    expect(lauf.wertVon(u, 0)).toBe('inj')
    expect(lauf.wertVon(u, 1)).toBe('Injektion')
  })

  it('eine Sucht-in-Wahl ohne Verknuepfung sucht trotzdem — die ganze Liste', () => {
    // Die Wahl am Spaltenkopf zeigt auf eine Quelle, die am Baustein NICHT
    // verknuepft ist. Genau das ist der Normalfall einer Hilfstabelle: sie ist
    // eine Nachschlage-Liste, keine Verknuepfung. Bis 2026-08-20 blieb die
    // Liste hier leer, und der Nutzer sah eine eingestellte Quelle ohne einen
    // einzigen Satz. Ohne Schluesselpaar schraenkt der gewaehlte Artikel sie
    // nur nicht mehr ein — sie steht vollstaendig da.
    waehle(0, 'bay')
    const ohne = umfeldMit(ZEILE, [])
    expect(lauf.eintraege(ohne, 3).map((e) => e.wert)).toEqual(['ORAL', 'INJ', 'SALB'])
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

  it('ohne Schluesselpaar landet in der Zelle, WAS IN DER LISTE STAND', () => {
    // Der Nutzer-Fall 2026-08-20: die Spalte zeigt ein Feld der Belegposition
    // (20_4), sucht aber im Artikelstamm — und fuer 20_4 gibt es KEIN
    // Schluesselpaar. Vorher blieb nach dem Waehlen das Suchwort stehen, und
    // genau das lief in den Beleg.
    const TIERART = spalte({
      titel: 'Tierart',
      feld: '20_4',
      suchtIn: 'q-art',
      suchFelder: [{ feld: '40_4', titel: 'Tierart' }],
    })
    const u = umfeldMit([TIERART, MENGE])
    expect(zielIn(u, 0).art).toBe('eigen')

    lauf.tippe(0, 'HUN')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege.map((v) => v.anzeige)).toEqual(['HUND'])
    lauf.uebernimm(u, 0, lauf.vorschlaege[0].satz)
    expect(lauf.wertVon(u, 0)).toBe('HUND')
  })

  it('genau EIN Treffer beim Tippen fuellt sich selbst — ab dem zweiten Zeichen', () => {
    const u = umfeldMit()
    // Ein Zeichen: „y" trifft nur den Baytril, aber die Automatik haelt sich
    // zurueck — beim ersten Buchstaben ist ein Alleintreffer Zufall.
    lauf.tippe(0, 'y')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.vorschlaege).toHaveLength(1)
    expect(lauf.nimmEinzigenTreffer(u)).toBe(false)
    expect(lauf.wertVon(u, 0)).toBe('y')

    // Ab dem zweiten Zeichen nimmt die Zeile den Alleintreffer von selbst —
    // samt der gekoppelten Bezeichnung, ohne Enter.
    lauf.tippe(0, 'bay')
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.nimmEinzigenTreffer(u)).toBe(true)
    expect(lauf.wertVon(u, 0)).toBe('ART03045')
    expect(lauf.wertVon(u, 1)).toBe('Baytril 25mg')

    // Und nicht zweimal: was schon da steht, uebernimmt sich nicht neu.
    lauf.aktualisiereVorschlaege(u)
    expect(lauf.nimmEinzigenTreffer(u)).toBe(false)
  })

  it('die erfasste Zeile traegt Getipptes UND Gekoppeltes — das liest der Knopf', () => {
    const anschluss = new ErfassungsAnschluss()
    const u = umfeldMit()
    const l = anschluss.lauf(0)
    l.tippe(0, 'bay')
    l.aktualisiereVorschlaege(u)
    l.uebernimm(u, 0, l.vorschlaege[0].satz)
    l.tippe(2, '2')
    // Artikelnummer aus der Kopplung, Menge von Hand; die Gabe blieb offen
    // (zwei Treffer), Notiz leer.
    expect(anschluss.werte(u, 0)).toEqual(['ART03045', 'Baytril 25mg', '2', '', '', ''])
    const saetze = anschluss.saetze(u)
    expect(saetze).toHaveLength(1)
    expect(saetze[0]['q-pos']).toEqual({ '10_8': 'ART03045', '11_6': '2' })
  })

  it('die Erfassungszeile bleibt OBEN — Enter schiebt die fertige Zeile nach unten', () => {
    const anschluss = new ErfassungsAnschluss()
    const u = umfeldMit()
    const erste = anschluss.lauf(0)
    erste.tippe(0, 'bay')
    erste.aktualisiereVorschlaege(u)
    erste.uebernimm(u, 0, erste.vorschlaege[0].satz)
    erste.tippe(2, '2')

    // Enter am Zeilenende: die Tippstelle bleibt Zeile 0, die fertige Zeile
    // steht darunter — sie wandert, nicht der Cursor.
    expect(anschluss.anzahl).toBe(1)
    expect(anschluss.weiter(u, 0)).toBe(0)
    expect(anschluss.anzahl).toBe(2)
    expect(anschluss.aktiv).toBe(0)
    expect(anschluss.istLeer(u, 0)).toBe(true)
    expect(anschluss.werte(u, 1)[2]).toBe('2')

    // Die erfasste Zeile ist nicht tot: sie laesst sich weiter aendern.
    anschluss.lauf(1).tippe(2, '5')
    expect(anschluss.werte(u, 1)[2]).toBe('5')

    // Eine leere Erfassungszeile legt nichts an: sonst wuechse der Stapel beim
    // Enter-Halten.
    expect(anschluss.weiter(u, 0)).toBe(null)
    expect(anschluss.anzahl).toBe(2)

    // Aus einer erfassten Zeile fuehrt Enter zurueck nach oben.
    expect(anschluss.weiter(u, 1)).toBe(0)

    // Duplizieren traegt den gewaehlten Satz mit, nicht nur den Text.
    expect(anschluss.doppelt(1)).toBe(2)
    expect(anschluss.anzahl).toBe(3)
    expect(anschluss.werte(u, 2)).toEqual(anschluss.werte(u, 1))

    // Es faellt genau EINE Zeile, nicht die ganze Erfassung.
    anschluss.loesche(2)
    expect(anschluss.anzahl).toBe(2)
    expect(anschluss.werte(u, 1)[0]).toBe('ART03045')

    // Die Erfassungszeile selbst faellt nie weg — sie wird nur leer.
    anschluss.lauf(0).tippe(2, '9')
    expect(anschluss.loesche(0)).toBe(true)
    expect(anschluss.anzahl).toBe(2)
    expect(anschluss.istLeer(u, 0)).toBe(true)

    // Leere Zeilen sind keine Positionen — der Knopf sieht nur die gefuellte.
    expect(anschluss.saetze(u)).toHaveLength(1)

    // Nach dem Ketten-Lauf bleibt eine leere Zeile stehen, in der es weitergeht.
    expect(anschluss.leeren()).toBe(true)
    expect(anschluss.anzahl).toBe(1)
    expect(anschluss.saetze(u)).toEqual([])
    expect(anschluss.leeren()).toBe(false)
  })
})
