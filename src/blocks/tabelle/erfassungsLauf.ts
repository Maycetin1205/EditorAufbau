import {
  nachschlagEintraege,
  quellenZeilen,
  type Eintrag,
} from '../formfeld/nachschlagen'
import { getField } from '../../softengine/data'
import {
  bewegteMarke,
  gueltigeMarke,
  passendeVorschlaege,
  tastenFolge,
  type TastenFolge,
} from '../shared/vorschlagListe'
import {
  anzeigeFeldDerZeile,
  ROLLE_FOLGT,
  ROLLE_FREI,
  ROLLE_NACHSCHLAGEN,
  rolleVon,
  rollenFeldVon,
  rollenQuelleVon,
} from './erfassungsRollen'
import type { Spalte } from './spalten'

// Der Stand EINER Erfassungszeile zur Laufzeit: was in den Zellen steht,
// welcher Satz je Quelle nachgeschlagen wurde, welche Zelle gerade tippt. Als
// eigene Klasse, weil er sich so ohne Browser pruefen laesst — und weil der
// Tabellen-Baustein sonst ueber seinen Zeilen-Deckel liefe.
//
// In G2 schreibt die Zeile NICHT ins ERP und veroeffentlicht ihre Wahl NICHT
// als globale Auswahl: die Geber-Kennung der Tabelle gehoert ihrer
// Zeilenauswahl, und ein Baustein kann heute Geber fuer genau EINE Quelle
// sein. Die Folgt-Zellen lesen den Satz direkt von hier.
export class ErfassungsLauf {
  // Getippt je Spalte. Eine Map und kein Array: sie bleibt richtig, wenn
  // Spalten dazukommen oder wegfallen.
  private getippt = new Map<number, string>()

  // Der gewaehlte Satz JE QUELLE. Jede Nachschlage-Spalte hat ihre eigene
  // Quelle (Nutzer-Korrektur 2026-08-18), also kann eine Zeile mehrere Saetze
  // tragen: den Artikel UND die Verabreichungsart. Eine Folgt-Zelle findet
  // ueber ihre Quelle den Satz, dem sie folgt.
  private gewaehlt = new Map<string, unknown>()

  private _tippSpalte = -1

  private _marke = 0

  private _listeZu = false

  private _vorschlaege: Eintrag[] = []

  get tippSpalte(): number {
    return this._tippSpalte
  }

  get marke(): number {
    return this._marke
  }

  get vorschlaege(): readonly Eintrag[] {
    return this._vorschlaege
  }

  // Was in der Zelle steht: frei getippt bzw. vorbelegt · nachgeschlagen der
  // uebernommene Wert (bis jemand darin tippt) · gefolgt immer aus dem Satz.
  wertVon(index: number, spalte: Spalte): string {
    const rolle = rolleVon(spalte)
    if (rolle === ROLLE_FOLGT) return this.ausSatz(spalte)
    const getippt = this.getippt.get(index)
    if (getippt !== undefined) return getippt
    if (rolle === ROLLE_FREI) return spalte.vorbelegung ?? ''
    return this.ausSatz(spalte)
  }

  private ausSatz(spalte: Spalte): string {
    const feld = rollenFeldVon(spalte)
    const satz = this.gewaehlt.get(rollenQuelleVon(spalte))
    if (satz === undefined || feld === '') return ''
    return getField(satz, feld)
  }

  tippe(index: number, text: string): void {
    this.getippt.set(index, text)
    this._tippSpalte = index
    this._marke = 0
    this._listeZu = false
  }

  // Der Sprung in eine andere Zelle raeumt die offene Liste ab; das Getippte
  // bleibt stehen, damit ein halb getippter Wert nicht beim Fokuswechsel
  // verschwindet.
  verlasse(index: number): void {
    if (this._tippSpalte !== index) return
    this._tippSpalte = -1
    this._listeZu = false
    this._marke = 0
  }

  entscheideTaste(index: number, taste: string, spalte: Spalte): TastenFolge {
    if (rolleVon(spalte) !== ROLLE_NACHSCHLAGEN) return 'nichts'
    const folge = tastenFolge(taste, {
      listeOffen: this._tippSpalte === index && this._vorschlaege.length > 0,
      feldLeer: this.wertVon(index, spalte) === '',
    })
    if (folge === 'marke-hoch') this._marke = bewegteMarke(this._marke, this._vorschlaege.length, -1)
    else if (folge === 'marke-runter') this._marke = bewegteMarke(this._marke, this._vorschlaege.length, 1)
    else if (folge === 'liste-zu') this._listeZu = true
    return folge
  }

  setzeMarke(marke: number): void {
    this._marke = marke
  }

  // Die Uebernahme: der Satz gilt fuer alle Zellen DIESER Quelle, ihre
  // Folgt-Zellen lesen ihn sofort. Das Getippte der Nachschlage-Zelle faellt
  // weg, damit dort der uebernommene Wert steht und nicht das Suchwort.
  uebernimm(index: number, spalte: Spalte, satz: unknown): void {
    const quelleId = rollenQuelleVon(spalte)
    if (quelleId === '') return
    this.gewaehlt.set(quelleId, satz)
    this.getippt.delete(index)
    this._tippSpalte = -1
    this._marke = 0
    this._listeZu = false
  }

  zuruecksetzen(): void {
    this.getippt.clear()
    this.gewaehlt.clear()
    this._tippSpalte = -1
    this._marke = 0
    this._listeZu = false
    this._vorschlaege = []
  }

  // Wie in G1 einmal je Darstellung berechnet: Tastatur und Anzeige muessen
  // DENSELBEN Stand sehen, zwei Berechnungen liefen auseinander.
  aktualisiereVorschlaege(spalten: readonly Spalte[]): void {
    this._vorschlaege = this.berechne(spalten)
    this._marke = gueltigeMarke(this._marke, this._vorschlaege.length)
  }

  private berechne(spalten: readonly Spalte[]): Eintrag[] {
    const index = this._tippSpalte
    const spalte = spalten[index]
    if (spalte === undefined || this._listeZu) return []
    const getippt = this.getippt.get(index) ?? ''
    if (getippt === '') return []
    return passendeVorschlaege(this.eintraege(spalten, spalte), getippt)
  }

  // Dieselben Eintraege fuer die Liste UND das grosse Fenster: eine zweite
  // Quelle waere eine zweite Wahrheit. Angezeigt wird das Feld der ersten
  // Folgt-Spalte DERSELBEN Quelle, gesucht wird in Anzeige UND Wert.
  eintraege(spalten: readonly Spalte[], spalte: Spalte): Eintrag[] {
    const quelleId = rollenQuelleVon(spalte)
    const wertFeld = rollenFeldVon(spalte)
    if (quelleId === '' || wertFeld === '') return []
    const rows = quellenZeilen(quelleId)
    if (rows === null) return []
    return nachschlagEintraege(rows, anzeigeFeldDerZeile(spalten, quelleId), wertFeld)
  }
}
