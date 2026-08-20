import { spaltenArt, zeilenHoeheFuer } from './spaltenArten'
import {
  linealTakte,
  OHNE_MESSUNG,
  platzhalterZeilen,
  seitenAufteilung,
  type Zeilenmass,
} from './seitengroesse'
import { sortiereIndizes } from './sortierung'
import type { Spalte } from './spalten'
import { passendeIndizes, zeigtLeerzustand } from './suche'

export interface AnsichtFrage {
  spalten: readonly Spalte[]

  hatQuelle: boolean
  datenGeliefert: boolean
  datenzeilen: readonly string[][]
  suchtext: string

  sortSpalte: number
  sortAuf: boolean

  wunschSeite: number

  gemessen: Zeilenmass | null

  // Wie viele tippbare Zeilen es gibt (0 = Erfassung aus). Jede belegt eine
  // der gemessenen Zeilen: ohne das rutscht die letzte Datenzeile aus dem
  // Rumpf und der Rumpf scrollt.
  erfassungsZeilen: number
}

export interface TabelleAnsicht {
  cols: Record<string, string>

  takt: number

  zeilenHoehe: number
  hatQuelle: boolean
  leer: boolean

  gesamt: number
  seiten: number
  seite: number

  zeilen: readonly (number | null)[]

  linealTakte: number | null
}

function sichtbareIndizes(frage: AnsichtFrage): number[] {
  const gefiltert = passendeIndizes(frage.datenzeilen, frage.suchtext)
  if (frage.sortSpalte < 0) return gefiltert
  const rows = gefiltert.map((i) => frage.datenzeilen[i])
  return sortiereIndizes(rows, frage.sortSpalte, frage.sortAuf).map((k) => gefiltert[k])
}

export function tabelleAnsicht(frage: AnsichtFrage): TabelleAnsicht {
  const cols = {
    gridTemplateColumns: frage.spalten.map((s) => spaltenArt(s.art).spur).join(' '),
  }

  const takt = zeilenHoeheFuer(frage.spalten)
  const zeilenHoehe = frage.gemessen?.zeilenHoehe ?? takt

  const hatQuelle = frage.hatQuelle

  // Mit Erfassungszeile gibt es keinen Leerzustand: die Zeile IST der Inhalt,
  // und die zentrierte Tafel schoebe sie an den Rumpf-Rand.
  const leer = frage.erfassungsZeilen > 0
    ? false
    : zeigtLeerzustand(hatQuelle, frage.datenGeliefert, frage.datenzeilen.length)

  const alleSichtbar = sichtbareIndizes(frage)

  const belegt = frage.erfassungsZeilen
  const gemessenPassen = frage.gemessen === null
    ? null
    : Math.max(1, frage.gemessen.passen - belegt)
  const proSeite = gemessenPassen ?? Math.max(1, OHNE_MESSUNG - belegt)
  const { seiten, seite, zeilen } = seitenAufteilung({
    sichtbar: alleSichtbar,
    hatQuelle,
    proSeite,
    wunschSeite: frage.wunschSeite,
    platzhalterZeilen: platzhalterZeilen(gemessenPassen),
  })
  return {
    cols,
    takt,
    zeilenHoehe,
    hatQuelle,
    leer,
    gesamt: alleSichtbar.length,
    seiten,
    seite,
    zeilen,

    linealTakte: linealTakte(gemessenPassen, zeilen.length),
  }
}

// Zeigt die Tabelle eine Kopfzeile? Das entscheidet „Schlank“ (Nutzer-Ansage
// 2026-08-20). Den eigenen Schalter „Kopfzeile“ gab es bis dahin daneben — er
// tat bei eingeschaltetem Schlank nichts mehr und ist deshalb GELOESCHT, nicht
// nur versteckt.
//
// Schlank nimmt den Kopf IMMER — er darf nicht davon abhaengen, ob die
// Erfassungszeile an ist. Genau das war er kurzzeitig, und eine frisch
// gezogene Tabelle (Erfassung aus) behielt ihren Kopf: derselbe Schalter tat
// zwei verschiedene Dinge, je nach einem zweiten (Nutzer-Befund 2026-08-20).
//
// Die Namen sind trotzdem nie ALLE weg: im Editor traegt sie die erste Zeile
// blass (dort stehen ohnehin nur Striche, s. tabelleKoerper), in der Maske die
// leeren Erfassungszellen — wie der Platzhalter am Formularfeld.
export function zeigtKopfzeile(schlank: string): boolean {
  return schlank !== 'ja'
}

// Ein Klick auf einen Spaltenkopf: dieselbe Spalte dreht die Richtung um, eine
// andere sortiert neu und faengt aufsteigend an.
export function naechsteSortierung(
  spalteJetzt: number,
  aufJetzt: boolean,
  geklickt: number,
): { spalte: number; auf: boolean } {
  return spalteJetzt === geklickt
    ? { spalte: geklickt, auf: !aufJetzt }
    : { spalte: geklickt, auf: true }
}
