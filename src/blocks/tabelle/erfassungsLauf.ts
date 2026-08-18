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
  anzeigeSpalteIn,
  passendeSaetze,
  verknuepfteQuellenIn,
  zellenzielVon,
  zielIn,
  type ErfassungsUmfeld,
} from './erfassungsZellen'

// Der Tastenentscheid der Erfassungszeile: die geteilten Folgen der
// Vorschlagsliste plus die zwei, die nur die Zeile kennt — weiterspringen
// (G3b) und die zweite Escape-Stufe.
export type ErfassungsTaste = TastenFolge | 'weiter' | 'leeren'

// Der Stand EINER Erfassungszeile zur Laufzeit: was in den Zellen steht,
// welcher Satz je Quelle gewählt wurde, welche Zelle gerade tippt. Als eigene
// Klasse, weil er sich so ohne Browser prüfen lässt — und weil der
// Tabellen-Baustein sonst über seinen Zeilen-Deckel liefe.
//
// Die Zeile schreibt NICHT ins ERP und veröffentlicht ihre Wahl NICHT als
// globale Auswahl: die Geber-Kennung der Tabelle gehört ihrer Zeilenauswahl,
// und ein Baustein kann heute Geber für genau EINE Quelle sein. Geschrieben
// wird erst in G4 über einen Knopf.
export class ErfassungsLauf {
  // Getippt je Spalte. Eine Map und kein Array: sie bleibt richtig, wenn
  // Spalten dazukommen oder wegfallen.
  private getippt = new Map<number, string>()

  // Der gewählte Satz JE QUELLE. Eine Zeile kann mehrere tragen: den Artikel
  // aus der Tabellen-Quelle UND die Tierart aus der verknüpften.
  private gewaehlt = new Map<string, unknown>()

  // Welche Wahl der Bediener SELBST getroffen hat (Übernahme per Liste oder
  // Fenster). Nur Hand-Wahlen liefern Schlüsselwerte für andere Quellen —
  // sonst schränkte eine selbstgefüllte Tierart die Artikelwahl ein, aus der
  // sie gerade erst abgeleitet wurde (Kreis).
  private vonHand = new Set<string>()

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

  // Was in der Zelle steht: das Getippte, solange es da ist — sonst der Wert
  // aus dem gewählten Satz ihrer Quelle. Eine freie Zelle hat nur Getipptes.
  wertVon(umfeld: ErfassungsUmfeld, index: number): string {
    const getippt = this.getippt.get(index)
    if (getippt !== undefined) return getippt
    const ziel = zielIn(umfeld, index)
    if (ziel.quelleId === '' || ziel.code === '') return ''
    const satz = this.gewaehlt.get(ziel.quelleId)
    return satz === undefined ? '' : getField(satz, ziel.code)
  }

  tippe(index: number, text: string): void {
    this.getippt.set(index, text)
    this._tippSpalte = index
    this._marke = 0
    this._listeZu = false
  }

  // Der Sprung in eine andere Zelle räumt die offene Liste ab; das Getippte
  // bleibt stehen, damit ein halb getippter Wert nicht beim Fokuswechsel
  // verschwindet.
  verlasse(index: number): void {
    if (this._tippSpalte !== index) return
    this._tippSpalte = -1
    this._listeZu = false
    this._marke = 0
  }

  entscheideTaste(umfeld: ErfassungsUmfeld, index: number, taste: string): ErfassungsTaste {
    const listeOffen = this._tippSpalte === index && this._vorschlaege.length > 0
    // Tab ist die Weiter-Taste: mit offener Liste übernimmt sie wie Enter,
    // sonst springt sie — auch dort, wo Enter absichtlich anhält (Tippfehler).
    if (taste === 'Tab') {
      if (!listeOffen) return 'weiter'
      taste = 'Enter'
    }
    const wert = this.wertVon(umfeld, index)
    // Escape-Stufe 2: keine Liste (mehr) offen → die Zelle leert sich.
    if (taste === 'Escape' && !listeOffen) return wert === '' ? 'nichts' : 'leeren'
    // Eine freie Zelle hat keine Liste und kein Fenster; Enter geht weiter.
    if (zielIn(umfeld, index).art === 'frei') return taste === 'Enter' ? 'weiter' : 'nichts'
    const folge = tastenFolge(taste, { listeOffen, feldLeer: wert === '' })
    if (folge === 'marke-hoch') this._marke = bewegteMarke(this._marke, this._vorschlaege.length, -1)
    else if (folge === 'marke-runter') this._marke = bewegteMarke(this._marke, this._vorschlaege.length, 1)
    else if (folge === 'liste-zu') this._listeZu = true
    // Kein einziger möglicher Satz (kein Partner): Enter bleibt nicht hängen.
    else if (folge === 'fenster' && this.eintraege(umfeld, index).length === 0) return 'weiter'
    // Auf einem gewählten Wert geht Enter weiter. Getipptes ohne Treffer hält
    // dagegen bewusst an (G1: sonst rauscht der Fluss über den Tippfehler) —
    // wer trotzdem weiter will, nimmt Tab.
    else if (folge === 'nichts' && taste === 'Enter' && wert !== '' && this.getippt.get(index) === undefined) return 'weiter'
    return folge
  }

  // Die nächste Zelle, in der noch nichts steht. Selbstgefülltes wird damit
  // automatisch übersprungen (es ist nicht leer). -1 = rechts ist nichts
  // Leeres mehr; was dann passiert, entscheidet der Aufrufer (ab G4: Zeile
  // erfasst).
  naechsteLeere(umfeld: ErfassungsUmfeld, ab: number): number {
    for (let i = ab + 1; i < umfeld.spalten.length; i++) {
      if (this.wertVon(umfeld, i) === '') return i
    }
    return -1
  }

  // Escape-Stufe 2: die Zelle wird wirklich leer. Bei einer gebundenen Zelle
  // muss dafür der gewählte Satz ihrer Quelle gehen — sonst stünde der Wert
  // beim nächsten Rendern wieder da. Mit ihm leeren sich die Schwesterzellen
  // derselben Quelle; das ist gewollt: ein Satz gilt immer ganz.
  leere(umfeld: ErfassungsUmfeld, index: number): void {
    this.getippt.delete(index)
    const ziel = zielIn(umfeld, index)
    if (ziel.quelleId !== '' && this.gewaehlt.has(ziel.quelleId)) {
      this.setze(umfeld, ziel.quelleId, undefined)
    }
    this._listeZu = false
    this._marke = 0
  }

  setzeMarke(marke: number): void {
    this._marke = marke
  }

  // Die Übernahme: der Satz gilt für alle Zellen DIESER Quelle, sie zeigen ihn
  // sofort. Ein Satz der Tabellen-Quelle ist der Anker — die verknüpften
  // Sätze hingen an ihm und werden gelöst. Danach gleicht sich die Zeile ab
  // (G3c): jede Wahl kann Abhängiges neu bestimmen, auch die Wahl in einer
  // verknüpften Spalte.
  uebernimm(umfeld: ErfassungsUmfeld, index: number, satz: unknown): void {
    const ziel = zielIn(umfeld, index)
    if (ziel.quelleId === '') return
    this.setze(umfeld, ziel.quelleId, satz)
    this.vonHand.add(ziel.quelleId)
    if (ziel.art === 'eigen') {
      for (const id of [...this.gewaehlt.keys()]) {
        if (id !== ziel.quelleId) this.setze(umfeld, id, undefined)
      }
    }
    this.gleicheAb(umfeld)
    this._tippSpalte = -1
    this._marke = 0
    this._listeZu = false
  }

  // Ein Satz gilt immer für die ganze Quelle. Das Getippte ihrer Zellen fällt
  // dabei weg: sonst stünde dort das Suchwort und nicht der übernommene Wert.
  private setze(umfeld: ErfassungsUmfeld, quelleId: string, satz: unknown): void {
    if (satz === undefined) {
      this.gewaehlt.delete(quelleId)
      this.vonHand.delete(quelleId)
    } else this.gewaehlt.set(quelleId, satz)
    for (let i = 0; i < umfeld.spalten.length; i++) {
      if (zellenzielVon(umfeld.spalten[i], umfeld.quelleId).quelleId === quelleId) {
        this.getippt.delete(i)
      }
    }
  }

  // Der Schlüsselwert der WERDENDEN Zeile — hier hängt das Messlatten-
  // Szenario (G3c): Gibt es den Satz der Tabellen-Quelle, trägt ER die Felder
  // (so liest ihn auch die Datenzeile). Beim Erfassen einer NEUEN Zeile gibt
  // es ihn nicht — dann liefern die von Hand gewählten verknüpften Sätze den
  // Wert über ihre Paare: der gewählte Artikel liefert die Artikelnummer der
  // Position, bevor es die Position gibt. Selbstgefülltes liefert nichts
  // (s. vonHand), und `ausser` nimmt die fragende Quelle aus der Suche —
  // ein Satz rechtfertigt sich nicht mit den eigenen Schlüsseln.
  private schluesselWert(umfeld: ErfassungsUmfeld, feld: string, ausser: string): string | undefined {
    const basis = this.gewaehlt.get(umfeld.quelleId)
    if (basis !== undefined) return getField(basis, feld)
    for (const quelleId of verknuepfteQuellenIn(umfeld)) {
      if (quelleId === ausser || !this.vonHand.has(quelleId)) continue
      const satz = this.gewaehlt.get(quelleId)
      if (satz === undefined) continue
      for (const paar of umfeld.paareZu(quelleId)) {
        if (paar.fromField !== feld) continue
        const wert = getField(satz, paar.toField)
        if (wert !== '') return wert
      }
    }
    return undefined
  }

  // Die möglichen Sätze einer verknüpften Quelle, eingeschränkt über die
  // bekannten Schlüsselwerte der werdenden Zeile.
  private moegliche(umfeld: ErfassungsUmfeld, quelleId: string, rows: readonly unknown[]): unknown[] {
    return passendeSaetze(
      umfeld.paareZu(quelleId),
      (feld) => this.schluesselWert(umfeld, feld, quelleId),
      rows,
    )
  }

  // Nach jeder Übernahme gleicht sich die Zeile ab, bis Ruhe ist: Gewähltes,
  // dessen Schlüssel nicht mehr passen, fällt (ein neuer Artikel löst die
  // alte Gabe) — und wo die bekannten Schlüssel genau EINEN Satz übrig
  // lassen, wählt er sich selbst (Ein-Treffer-Automatik). Die Automatik
  // greift nur, wenn mindestens ein Schlüsselwert bekannt ist: sonst wählte
  // sich in einem Ein-Satz-Stamm der Satz ungefragt von selbst.
  private gleicheAb(umfeld: ErfassungsUmfeld): void {
    const quellen = verknuepfteQuellenIn(umfeld)
    for (let runde = 0; runde <= quellen.length; runde++) {
      let bewegt = false
      for (const quelleId of quellen) {
        const paare = umfeld.paareZu(quelleId)
        if (paare.length === 0) continue
        const satz = this.gewaehlt.get(quelleId)
        if (satz !== undefined) {
          const passt = paare.every((p) => {
            const soll = this.schluesselWert(umfeld, p.fromField, quelleId)
            return soll === undefined || (soll !== '' && soll === getField(satz, p.toField))
          })
          if (!passt) {
            this.setze(umfeld, quelleId, undefined)
            bewegt = true
          }
          continue
        }
        if (!paare.some((p) => this.schluesselWert(umfeld, p.fromField, quelleId) !== undefined)) continue
        const rows = quellenZeilen(quelleId)
        if (rows === null) continue
        const passend = this.moegliche(umfeld, quelleId, rows)
        if (passend.length === 1) {
          this.setze(umfeld, quelleId, passend[0])
          this.vonHand.delete(quelleId)
          bewegt = true
        }
      }
      if (!bewegt) break
    }
  }

  zuruecksetzen(): void {
    this.getippt.clear()
    this.gewaehlt.clear()
    this.vonHand.clear()
    this._tippSpalte = -1
    this._marke = 0
    this._listeZu = false
    this._vorschlaege = []
  }

  // Wie in G1 einmal je Darstellung berechnet: Tastatur und Anzeige müssen
  // DENSELBEN Stand sehen, zwei Berechnungen liefen auseinander.
  aktualisiereVorschlaege(umfeld: ErfassungsUmfeld): void {
    this._vorschlaege = this.berechne(umfeld)
    this._marke = gueltigeMarke(this._marke, this._vorschlaege.length)
  }

  private berechne(umfeld: ErfassungsUmfeld): Eintrag[] {
    const index = this._tippSpalte
    if (this._listeZu || zielIn(umfeld, index).art === 'frei') return []
    const getippt = this.getippt.get(index) ?? ''
    if (getippt === '') return []
    return passendeVorschlaege(this.eintraege(umfeld, index), getippt)
  }

  // Dieselben Einträge für die Liste UND das große Fenster: eine zweite
  // Quelle wäre eine zweite Wahrheit. Eine verknüpfte Zelle bekommt nur die
  // Sätze, deren Schlüssel zu den bekannten Werten der werdenden Zeile passen.
  eintraege(umfeld: ErfassungsUmfeld, index: number): Eintrag[] {
    const ziel = zielIn(umfeld, index)
    if (ziel.quelleId === '' || ziel.code === '') return []
    const rows = quellenZeilen(ziel.quelleId)
    if (rows === null) return []
    const saetze = ziel.art === 'verknuepft'
      ? this.moegliche(umfeld, ziel.quelleId, rows)
      : rows
    return nachschlagEintraege(saetze, anzeigeSpalteIn(umfeld, index)?.code ?? '', ziel.code)
  }
}
