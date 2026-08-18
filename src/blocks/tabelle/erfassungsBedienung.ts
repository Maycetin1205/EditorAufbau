import type { TemplateResult } from 'lit'
import {
  FENSTER_BREITE,
  FENSTER_HOEHE,
  oeffneNachschlagen,
} from '../formfeld/nachschlagen'
import type { ErfassungsLauf } from './erfassungsLauf'
import { fensterSpaltenIn, zielIn, type ErfassungsUmfeld } from './erfassungsZellen'
import { erfassungsZeileTpl } from './erfassungsZeile'

// Was die Zellen der Erfassungszeile tun. Getrennt vom Baustein, weil der
// sonst über seinen Zeilen-Deckel liefe — und weil die Bedienung so nur über
// diese schmale Naht an ihn kommt.
export interface ErfassungsWirt {
  baustein: HTMLElement

  lauf: ErfassungsLauf

  umfeld: () => ErfassungsUmfeld

  melde: () => void

  // Setzt den Fokus in die Erfassungszelle der Spalte — NACH dem nächsten
  // Rendern, denn erst dann zeigt die Zelle den neuen Stand.
  fokussiere: (index: number) => void

  // Enter am Zeilenende: die Zeile bleibt stehen, die Erfassung rückt eine
  // Zeile tiefer (G4). Der Baustein hält die erfassten Zeilen.
  erfasseZeile: () => void
}

function waehle(wirt: ErfassungsWirt, index: number, listenIndex: number): void {
  const treffer = wirt.lauf.vorschlaege[listenIndex]
  if (treffer === undefined) return
  wirt.lauf.uebernimm(wirt.umfeld(), index, treffer.satz)
  wirt.melde()
}

// Das große Fenster zeigt GENAU dieselben Sätze wie die Liste daneben: die
// Einträge reisen fertig mit, damit keine zweite Wahrheit entsteht. Ohne sie
// legte das Fenster die Auswahl-Folgen der TABELLE auf diese Sätze und ließe
// keinen übrig.
function fenster(wirt: ErfassungsWirt, index: number): void {
  const umfeld = wirt.umfeld()
  const spalte = umfeld.spalten[index]
  const ziel = zielIn(umfeld, index)
  if (spalte === undefined || ziel.quelleId === '' || ziel.code === '') return
  oeffneNachschlagen({
    el: wirt.baustein,
    // Die Quelle DIESER Spalte: die der Tabelle oder eine verknüpfte.
    quelleId: ziel.quelleId,
    speicherFeld: ziel.code,
    speicherTitel: spalte.titel,
    spalten: fensterSpaltenIn(umfeld, index),
    titel: spalte.titel,
    breite: FENSTER_BREITE,
    hoehe: FENSTER_HOEHE,
    eintraege: wirt.lauf.eintraege(umfeld, index),
    rueckFokus: null,
    onUebernehmen: (_anzeige, _wert, satz) => {
      wirt.lauf.uebernimm(wirt.umfeld(), index, satz)
      wirt.melde()
    },
  })
}

// Der Sprung zur nächsten leeren Zelle (G3b). Rechts nichts Leeres mehr:
// Enter erfasst die Zeile (G4, `abschliessen`); Tab lässt den Fokus stehen —
// eine Taste zum Weiterrücken, EINE zum Abschließen.
function springe(wirt: ErfassungsWirt, index: number, abschliessen: boolean): void {
  const ziel = wirt.lauf.naechsteLeere(wirt.umfeld(), index)
  if (ziel !== -1) wirt.fokussiere(ziel)
  else if (abschliessen) wirt.erfasseZeile()
}

function taste(wirt: ErfassungsWirt, index: number, e: KeyboardEvent): void {
  // Rückwärts (Shift+Tab) bleibt Browser-Sache — jede Zelle ist erreichbar.
  if (e.key === 'Tab' && e.shiftKey) return
  const folge = wirt.lauf.entscheideTaste(wirt.umfeld(), index, e.key)
  if (folge === 'nichts') {
    // Enter darf trotzdem kein Formular abschicken.
    if (e.key === 'Enter') e.preventDefault()
    return
  }
  e.preventDefault()
  const abschliessen = e.key === 'Enter'
  if (folge === 'uebernehmen') {
    waehle(wirt, index, wirt.lauf.marke)
    springe(wirt, index, abschliessen)
  } else if (folge === 'fenster') fenster(wirt, index)
  else if (folge === 'weiter') springe(wirt, index, abschliessen)
  else if (folge === 'leeren') wirt.lauf.leere(wirt.umfeld(), index)
  wirt.melde()
}

export function erfassungsZeileFuer(
  wirt: ErfassungsWirt,
  cols: Readonly<Record<string, string>>,
  listeNachOben: boolean,
): TemplateResult {
  const umfeld = wirt.umfeld()
  return erfassungsZeileTpl({
    spalten: umfeld.spalten,
    quelleId: umfeld.quelleId,
    cols,
    imEditor: wirt.baustein.hasAttribute('data-ff-editor'),
    wert: (i) => wirt.lauf.wertVon(umfeld, i),
    tippSpalte: wirt.lauf.tippSpalte,
    vorschlaege: wirt.lauf.vorschlaege,
    marke: wirt.lauf.marke,
    listeNachOben,
  }, {
    // Was der Bediener tippt, gehört der Zeile — kein Daten-Push räumt es weg
    // (das tut nur ein Zweckwechsel des Bausteins).
    tippen: (i, text) => {
      wirt.lauf.tippe(i, text)
      wirt.melde()
    },
    taste: (i, e) => taste(wirt, i, e),
    verlassen: (i) => {
      wirt.lauf.verlasse(i)
      wirt.melde()
    },
    waehleVorschlag: (listenIndex) => waehle(wirt, wirt.lauf.tippSpalte, listenIndex),
    setzeMarke: (listenIndex) => {
      wirt.lauf.setzeMarke(listenIndex)
      wirt.melde()
    },
  })
}
