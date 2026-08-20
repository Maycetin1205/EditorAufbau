import type { TemplateResult } from 'lit'
import {
  FENSTER_BREITE,
  FENSTER_HOEHE,
  oeffneNachschlagen,
} from '../formfeld/nachschlagen'
import type { ErfassungsAnschluss } from './erfassungsAnschluss'
import { fensterSpaltenIn, zielIn, type ErfassungsUmfeld } from './erfassungsZellen'
import { erfassungsZeileTpl } from './erfassungsZeile'

// Was die Zellen der tippbaren Zeilen tun. Getrennt vom Baustein, weil der
// sonst über seinen Zeilen-Deckel liefe — und weil die Bedienung so nur über
// diese schmale Naht an ihn kommt.
export interface ErfassungsWirt {
  baustein: HTMLElement

  // Der ganze Erfassungs-Stand: die Läufe JE ZEILE, welche Zeile aktiv ist,
  // und die Zeilen-Werkzeuge. Ein Bündel und keine sechs Rückrufe — der Stand
  // hat kein DOM und keine Editor-Abhängigkeit.
  anschluss: ErfassungsAnschluss

  umfeld: () => ErfassungsUmfeld

  melde: () => void

  // Setzt den Fokus in eine Zelle — NACH dem nächsten Rendern, denn erst dann
  // zeigt sie den neuen Stand.
  fokussiere: (zeile: number, spalte: number) => void
}

function waehle(wirt: ErfassungsWirt, zeile: number, index: number, listenIndex: number): void {
  const lauf = wirt.anschluss.lauf(zeile)
  const treffer = lauf.vorschlaege[listenIndex]
  if (treffer === undefined) return
  lauf.uebernimm(wirt.umfeld(), index, treffer.satz)
  wirt.melde()
}

// Das große Fenster zeigt GENAU dieselben Sätze wie die Liste daneben: die
// Einträge reisen fertig mit, damit keine zweite Wahrheit entsteht. Ohne sie
// legte das Fenster die Auswahl-Folgen der TABELLE auf diese Sätze und ließe
// keinen übrig.
function fenster(wirt: ErfassungsWirt, zeile: number, index: number): void {
  const umfeld = wirt.umfeld()
  const spalte = umfeld.spalten[index]
  const ziel = zielIn(umfeld, index)
  if (spalte === undefined || ziel.suchQuelleId === '') return
  const lauf = wirt.anschluss.lauf(zeile)
  oeffneNachschlagen({
    el: wirt.baustein,
    // Gesucht wird da, wo die Spalte es sagt — nicht zwangsläufig dort, woher
    // der Zellwert kommt (eine Zelle ohne Schlüsselpaar sucht, ohne zu lesen).
    quelleId: ziel.suchQuelleId,
    speicherFeld: ziel.quelleId === ziel.suchQuelleId ? ziel.code : '',
    speicherTitel: spalte.titel,
    spalten: fensterSpaltenIn(umfeld, index),
    titel: spalte.titel,
    breite: FENSTER_BREITE,
    hoehe: FENSTER_HOEHE,
    eintraege: lauf.eintraege(umfeld, index),
    rueckFokus: null,
    onUebernehmen: (_anzeige, _wert, satz) => {
      lauf.uebernimm(wirt.umfeld(), index, satz)
      wirt.melde()
    },
  })
}

// Wohin die Weiter-Taste springt.
//
// ENTER sucht die nächste LEERE Zelle (G3b: Selbstgefülltes ist schon fertig,
// da hält niemand gern an) und darf am Zeilenende eine neue Zeile anlegen.
// TAB geht stur eine Zelle weiter und legt nichts an: so ist JEDE Zelle
// erreichbar, auch eine selbstgefüllte, die man doch überschreiben will
// (S2.8). Rückwärts bleibt Shift+Tab, das macht der Browser in
// DOM-Reihenfolge von sich aus richtig.
function springe(
  wirt: ErfassungsWirt,
  zeile: number,
  spalte: number,
  taste: 'enter' | 'tab',
): void {
  const umfeld = wirt.umfeld()
  const rechts = taste === 'enter'
    ? wirt.anschluss.lauf(zeile).naechsteLeere(umfeld, spalte)
    : (spalte + 1 < umfeld.spalten.length ? spalte + 1 : -1)
  if (rechts !== -1) {
    wirt.fokussiere(zeile, rechts)
    return
  }
  const naechste = taste === 'enter'
    ? wirt.anschluss.weiter(umfeld, zeile)
    : Math.min(zeile + 1, wirt.anschluss.anzahl - 1)
  if (naechste === zeile) return
  if (taste === 'tab') wirt.anschluss.waehle(naechste)
  // In der neuen Zeile beginnt es wieder bei der ersten LEEREN Zelle — bei
  // einer duplizierten Zeile ist das nicht die erste.
  const leer = wirt.anschluss.lauf(naechste).naechsteLeere(umfeld, -1)
  wirt.fokussiere(naechste, taste === 'enter' && leer !== -1 ? leer : 0)
}

// Die Pfeile hoch/runter, wenn keine Liste offen ist: dieselbe Spalte, eine
// Zeile weiter. Über das Ende hinaus wird NICHTS angelegt — Zeilen entstehen
// nur durch Enter oder das Werkzeug, sonst wächst die Liste beim Umsehen.
function zeilenSprung(
  wirt: ErfassungsWirt,
  zeile: number,
  spalte: number,
  schritt: 1 | -1,
): boolean {
  const ziel = zeile + schritt
  if (ziel < 0 || ziel >= wirt.anschluss.anzahl) return false
  wirt.fokussiere(ziel, spalte)
  return true
}

function taste(wirt: ErfassungsWirt, zeile: number, index: number, e: KeyboardEvent): void {
  // Rückwärts (Shift+Tab) bleibt Browser-Sache — jede Zelle ist erreichbar.
  if (e.key === 'Tab' && e.shiftKey) return
  const weiterTaste = e.key === 'Tab' ? 'tab' : 'enter'
  const folge = wirt.anschluss.lauf(zeile).entscheideTaste(wirt.umfeld(), index, e.key)
  if (folge === 'nichts') {
    // Enter darf trotzdem kein Formular abschicken.
    if (e.key === 'Enter') e.preventDefault()
    // Ohne offene Liste gehören die Pfeile den ZEILEN. Links und rechts
    // bleiben beim Browser: dort läuft der Schreibzeiger im Text.
    else if (e.key === 'ArrowDown' && zeilenSprung(wirt, zeile, index, 1)) e.preventDefault()
    else if (e.key === 'ArrowUp' && zeilenSprung(wirt, zeile, index, -1)) e.preventDefault()
    return
  }
  e.preventDefault()
  if (folge === 'uebernehmen') {
    waehle(wirt, zeile, index, wirt.anschluss.lauf(zeile).marke)
    springe(wirt, zeile, index, weiterTaste)
  } else if (folge === 'fenster') fenster(wirt, zeile, index)
  else if (folge === 'weiter') springe(wirt, zeile, index, weiterTaste)
  else if (folge === 'leeren') wirt.anschluss.lauf(zeile).leere(wirt.umfeld(), index)
  wirt.melde()
}

// Alle tippbaren Zeilen. Die letzte ist die leere, in der es weitergeht; die
// darüber sind erfasste Positionen, die noch niemand geschrieben hat — und
// die deshalb weiter anfassbar bleiben (S2.7).
export function erfassungsZeilenFuer(
  wirt: ErfassungsWirt,
  cols: Readonly<Record<string, string>>,
  listeNachOben: boolean,
  zellenGriff?: (e: MouseEvent, index: number) => void,
): TemplateResult[] {
  const umfeld = wirt.umfeld()
  const imEditor = wirt.baustein.hasAttribute('data-ff-editor')
  const raus: TemplateResult[] = []
  for (let zeile = 0; zeile < wirt.anschluss.anzahl; zeile++) {
    const lauf = wirt.anschluss.lauf(zeile)
    const aktiv = zeile === wirt.anschluss.aktiv
    raus.push(erfassungsZeileTpl({
      umfeld,
      cols,
      imEditor,
      zeile,
      aktiv,
      gefuellt: !imEditor && !wirt.anschluss.istLeer(umfeld, zeile),
      ...(zellenGriff ? { zellenGriff } : {}),
      wert: (i) => lauf.wertVon(umfeld, i),
      // Nur die aktive Zeile kann eine offene Liste haben: in jeder anderen
      // hat das Verlassen der Zelle sie abgeräumt.
      tippSpalte: aktiv ? lauf.tippSpalte : -1,
      vorschlaege: aktiv ? lauf.vorschlaege : [],
      marke: lauf.marke,
      listeNachOben,
      nummer: zeile + 1,
    }, {
      // Was der Bediener tippt, gehört der Zeile — kein Daten-Push räumt es
      // weg (das tut nur ein Zweckwechsel des Bausteins).
      tippen: (i, text) => {
        lauf.tippe(i, text)
        wirt.anschluss.waehle(zeile)
        wirt.melde()
      },
      taste: (i, e) => taste(wirt, zeile, i, e),
      verlassen: (i) => {
        lauf.verlasse(i)
        wirt.melde()
      },
      betreten: () => {
        if (wirt.anschluss.waehle(zeile)) wirt.melde()
      },
      waehleZeile: () => {
        if (wirt.anschluss.waehle(zeile)) wirt.melde()
      },
      waehleVorschlag: (listenIndex) => waehle(wirt, zeile, lauf.tippSpalte, listenIndex),
      setzeMarke: (listenIndex) => {
        lauf.setzeMarke(listenIndex)
        wirt.melde()
      },
    }))
  }
  return raus
}
