import type { TemplateResult } from 'lit'
import {
  FENSTER_BREITE,
  FENSTER_HOEHE,
  oeffneNachschlagen,
} from '../formfeld/nachschlagen'
import type { ErfassungsLauf } from './erfassungsLauf'
import {
  ERFASSUNG_STELLE,
  fensterSpaltenFuer,
  ROLLE_FREI,
  rolleVon,
  rollenFeldVon,
  rollenQuelleVon,
} from './erfassungsRollen'
import { erfassungsZeileTpl } from './erfassungsZeile'
import { feldPickerAbbestellen, oeffneFeldPicker, tippeVorbelegung } from './spaltenBearbeiten'
import type { Spalte } from './spalten'

// Was die Zellen der Erfassungszeile tun. Getrennt vom Baustein, weil der
// sonst ueber seinen Zeilen-Deckel liefe — und weil die Bedienung so nur
// ueber diese schmale Naht an ihn kommt.
export interface ErfassungsWirt {
  baustein: HTMLElement & { editable: boolean }

  lauf: ErfassungsLauf

  spalten: () => Spalte[]

  aendere: (spalten: Spalte[]) => void

  melde: () => void

  // Die Eigenschaft, in der die Spalten stehen — der Rollen-Picker schreibt
  // in DIESELBE Liste wie der Spaltenkopf.
  bindungsProp: string
}

function waehle(wirt: ErfassungsWirt, index: number, listenIndex: number): void {
  const treffer = wirt.lauf.vorschlaege[listenIndex]
  const spalte = wirt.spalten()[index]
  if (treffer === undefined || spalte === undefined) return
  wirt.lauf.uebernimm(index, spalte, treffer.satz)
  wirt.melde()
}

// Das grosse Fenster zeigt GENAU dieselben Saetze wie die Liste daneben: die
// Eintraege reisen fertig mit, damit keine zweite Wahrheit entsteht. Ohne sie
// legte das Fenster die Auswahl-Folgen der TABELLEN-Quelle auf die
// Nachschlage-Saetze und liesse keinen uebrig.
function fenster(
  wirt: ErfassungsWirt,
  index: number,
  rueckFokus: HTMLElement | null,
): void {
  const spalten = wirt.spalten()
  const spalte = spalten[index]
  if (spalte === undefined) return
  oeffneNachschlagen({
    el: wirt.baustein,
    // Die Quelle dieser SPALTE, nicht der Tabelle.
    quelleId: rollenQuelleVon(spalte),
    speicherFeld: rollenFeldVon(spalte),
    speicherTitel: spalte.titel,
    spalten: fensterSpaltenFuer(spalten, spalte),
    titel: spalte.titel,
    breite: FENSTER_BREITE,
    hoehe: FENSTER_HOEHE,
    eintraege: wirt.lauf.eintraege(spalten, spalte),
    rueckFokus,
    onUebernehmen: (_anzeige, _wert, satz) => {
      wirt.lauf.uebernimm(index, spalte, satz)
      wirt.melde()
    },
  })
}

function taste(wirt: ErfassungsWirt, index: number, e: KeyboardEvent): void {
  const spalte = wirt.spalten()[index]
  if (spalte === undefined) return
  const folge = wirt.lauf.entscheideTaste(index, e.key, spalte)
  if (folge === 'nichts') {
    // Enter darf trotzdem kein Formular abschicken.
    if (e.key === 'Enter') e.preventDefault()
    return
  }
  e.preventDefault()
  if (folge === 'uebernehmen') waehle(wirt, index, wirt.lauf.marke)
  else if (folge === 'fenster') fenster(wirt, index, null)
  wirt.melde()
}

export function erfassungsZeileFuer(
  wirt: ErfassungsWirt,
  cols: Readonly<Record<string, string>>,
  listeNachOben: boolean,
): TemplateResult {
  const spalten = wirt.spalten()
  return erfassungsZeileTpl({
    spalten,
    cols,
    imEditor: wirt.baustein.hasAttribute('data-ff-editor'),
    wert: (i) => {
      const spalte = spalten[i]
      return spalte === undefined ? '' : wirt.lauf.wertVon(i, spalte)
    },
    tippSpalte: wirt.lauf.tippSpalte,
    vorschlaege: wirt.lauf.vorschlaege,
    marke: wirt.lauf.marke,
    listeNachOben,
  }, {
    // Klick stellt die Rolle, Doppelklick tippt die Vorbelegung — derselbe
    // Griff wie am Spaltenkopf.
    klickZelle: (e, i) => {
      if (!wirt.baustein.editable) return
      oeffneFeldPicker(wirt.baustein, e, {
        prop: wirt.bindungsProp,
        index: i,
        stelle: ERFASSUNG_STELLE,
        liste: () => wirt.spalten(),
      })
    },
    dblklickZelle: (e, i) => {
      if (!wirt.baustein.editable) return
      feldPickerAbbestellen(wirt.baustein)
      const spalte = wirt.spalten()[i]
      // Nur die Frei-Zelle hat eine Vorbelegung; die anderen holen ihren Wert
      // aus dem nachgeschlagenen Satz.
      if (spalte === undefined || rolleVon(spalte) !== ROLLE_FREI) return
      tippeVorbelegung(e, i, () => wirt.spalten(), wirt.aendere)
    },
    // Was der Bediener tippt, gehoert der Zeile — kein Daten-Push raeumt es
    // weg (das tut nur ein Zweckwechsel des Bausteins).
    tippen: (i, text) => {
      wirt.lauf.tippe(i, text)
      wirt.melde()
    },
    taste: (i, e) => taste(wirt, i, e),
    verlassen: (i) => {
      wirt.lauf.verlasse(i)
      wirt.melde()
    },
    lupe: (i, e) => fenster(wirt, i, e.currentTarget as HTMLElement),
    waehleVorschlag: (listenIndex) => waehle(wirt, wirt.lauf.tippSpalte, listenIndex),
    setzeMarke: (listenIndex) => {
      wirt.lauf.setzeMarke(listenIndex)
      wirt.melde()
    },
  })
}
