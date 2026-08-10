// tabelleAnsicht — WAS die Tabelle gerade zeigt, als reine Rechnung.
//
// Aus TabelleBlock herausgeloest (2026-08-07), weil die Baustein-Datei am
// 500-Zeilen-Deckel stand (check:regeln) und der Grund dafuer hier lag: der
// Kopf von render() rechnete auf zwei Dutzend Zeilen aus, welche Zeilen diese
// Seite zeigt, ob echte Daten kommen, ob der Leerzustand gilt und wie breit die
// Spalten sind. Das ist keine Baustein-Aufgabe — es ist Arithmetik.
//
// Form wie ./seitengroesse und ./suche: Werte rein, Werte raus. Kein DOM, kein
// Lit, kein Zustand. Der Baustein reicht seine Eigenschaften herein und gibt das
// Ergebnis an ./tabelleKoerper und ./tabelleFuss weiter; entschieden wird hier.

import { spaltenArt, zeilenHoeheFuer } from './spaltenArten'
import {
  linealTakte,
  OHNE_MESSUNG,
  platzhalterZeilen,
  proSeiteAusEinstellung,
  seitenAufteilung,
} from './seitengroesse'
import { sortiereIndizes } from './sortierung'
import type { Spalte } from './spalten'
import { passendeIndizes, zeigtEchteDaten, zeigtLeerzustand } from './suche'

export interface AnsichtFrage {
  spalten: readonly Spalte[]
  // Zeichnet der EDITOR (data-ff-editor am Baustein) oder die Maske?
  imEditor: boolean
  source: string
  datenGeliefert: boolean
  datenzeilen: readonly string[][]
  suchtext: string
  // -1 = unsortiert.
  sortSpalte: number
  sortAuf: boolean
  // Auf welcher Seite der Bediener stehen WILL (kann veraltet sein).
  wunschSeite: number
  // Zeilen pro Seite, wie sie gerade gilt (Bauplan oder Sitzungswahl).
  einstellung: string
  // Gemessene Zeilenzahl, null = (noch) nicht messbar.
  gemessen: number | null
}

export interface TabelleAnsicht {
  // Die Rasterbreiten — EINE Rechnung, drei Leser (Kopf, Zeilen, Lineal).
  cols: Record<string, string>
  zeilenHoehe: number
  hatQuelle: boolean
  leer: boolean
  // Wie viele Zeilen es insgesamt zu sehen gibt (nach Suche, vor Blaettern).
  gesamt: number
  seiten: number
  seite: number
  // Was diese Seite zeichnet: Rohindex in datenzeilen, oder null fuer eine
  // Platzhalter-Zeile im Editor.
  zeilen: readonly (number | null)[]
  // Wie viele GANZE Zeilentakte das Lineal unter diesen Zeilen noch zeichnet
  // (./seitengroesse). 0 = keins mehr, null = nicht messbar.
  linealTakte: number | null
}

// Die Zeilen, die der Bediener gerade sehen soll — als ROHINDIZES in
// datenzeilen: ERST suchen, DANN sortieren. Indizes statt Werte, weil die
// Auswahl-Markierung an der ZEILE kleben muss, egal wie gefiltert oder sortiert
// wird. Beides sind eigene, getestete Stellen (./suche, ./sortierung).
function sichtbareIndizes(frage: AnsichtFrage): number[] {
  const gefiltert = passendeIndizes(frage.datenzeilen, frage.suchtext)
  if (frage.sortSpalte < 0) return gefiltert
  const rows = gefiltert.map((i) => frage.datenzeilen[i])
  return sortiereIndizes(rows, frage.sortSpalte, frage.sortAuf).map((k) => gefiltert[k])
}

export function tabelleAnsicht(frage: AnsichtFrage): TabelleAnsicht {
  // Breite nach ART, nie nach Inhalt — sonst springt eine Spalte beim
  // Blaettern, weil die naechste Seite kuerzere Werte traegt.
  const cols = {
    gridTemplateColumns: frage.spalten.map((s) => spaltenArt(s.art).spur).join(' '),
  }
  // Der Zeilentakt: die anspruchsvollste Spalten-Art bestimmt ihn
  // (./spaltenArten). EINE Zahl, drei Leser — das Aussehen (als CSS-Variable),
  // die Messung und die Seitenrechnung.
  const zeilenHoehe = zeilenHoeheFuer(frage.spalten)
  // „Hat Quelle" heisst: es KOMMEN Daten — nicht, dass gerade welche da sind.
  // Bis 2026-07-28 stand hier `datenzeilen.length > 0`, und damit fiel die
  // LAUFENDE Maske auf die Editor-Platzhalter zurueck, sobald der Tagesfilter
  // einen Tag ohne Saetze traf: vier Striche „—" und „— Datensaetze", als warte
  // man noch auf Daten. Ein leerer Tag ist aber der Normalfall, und erfundene
  // Striche in der echten Maske brechen Regel 7 (der Editor erfindet nie
  // Daten — die Maske erst recht nicht).
  //
  // Unterschieden wird ueber `data-ff-editor`: der BlockHost setzt es an JEDEM
  // Editor-Element, der Export nie — dieselbe Marke, an der auch datenAnschluss
  // Editor-Elemente von der Daten-Mechanik fernhaelt. `editable` taugt dafuer
  // NICHT: das ist im Editor nur am AUSGEWAEHLTEN Baustein true, ein nicht
  // ausgewaehlter saehe sonst aus wie Laufzeit. Die Entscheidung selbst wohnt
  // pruefbar in ./suche (zeigtEchteDaten).
  const hatQuelle = zeigtEchteDaten(frage.imEditor, frage.source)
  // Leerzustand? Die Bedingungen wohnen pruefbar in ./suche.
  const leer = zeigtLeerzustand(hatQuelle, frage.datenGeliefert, frage.datenzeilen.length)
  // Paginierung: die Rechnung wohnt in ./seitengroesse (rein + getestet).
  // In der Maske wird NICHT aufgefuellt — ein Satz ist eine Zeile; den leeren
  // Rest zeichnet das Lineal weiter. Im Editor stehen stattdessen
  // Platzhalter-Zeilen mit „—" (Regel 7: hier kommt spaeter ein Wert hin),
  // und zwar so viele, wie wirklich hineinpassen (platzhalterZeilen).
  const alleSichtbar = sichtbareIndizes(frage)
  // Reihenfolge fuer echte Daten: eine feste Zahl gewinnt, sonst die Messung,
  // sonst der Rueckfall. Ohne Messung (kein ResizeObserver, oder kein Raster mit
  // vorgegebener Hoehe) laeuft die Tabelle wie bis 2026-08-06.
  const proSeite = proSeiteAusEinstellung(frage.einstellung) ?? frage.gemessen ?? OHNE_MESSUNG
  const { seiten, seite, zeilen } = seitenAufteilung({
    sichtbar: alleSichtbar,
    hatQuelle,
    proSeite,
    wunschSeite: frage.wunschSeite,
    platzhalterZeilen: platzhalterZeilen(frage.einstellung, frage.gemessen),
  })
  return {
    cols,
    zeilenHoehe,
    hatQuelle,
    leer,
    gesamt: alleSichtbar.length,
    seiten,
    seite,
    zeilen,
    // Das Lineal fuellt den Rest unter den Zeilen nur noch in GANZEN Takten.
    // Gerechnet wird gegen die GEMESSENE Zahl, nicht gegen `proSeite`: bei
    // einer festen Einstellung (10 pro Seite in einer Tabelle, in die 25
    // passen) bleibt unter der zehnten Zeile echter Platz, den das Lineal
    // weiter zeichnen soll — nur eben nicht bis in den angebrochenen Takt.
    linealTakte: linealTakte(frage.gemessen, zeilen.length),
  }
}
