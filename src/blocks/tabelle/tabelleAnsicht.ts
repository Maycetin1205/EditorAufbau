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

  // Die Erfassungszeile belegt eine der gemessenen Zeilen: ohne das rutscht
  // die letzte Datenzeile aus dem Rumpf und der Rumpf scrollt.
  erfassungAn: boolean

  // Erfasste, noch nicht geschriebene Zeilen (G4) belegen genauso je einen
  // Platz zwischen den Daten und der Erfassungszeile.
  erfassteAnzahl: number
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
  const leer = frage.erfassungAn
    ? false
    : zeigtLeerzustand(hatQuelle, frage.datenGeliefert, frage.datenzeilen.length)

  const alleSichtbar = sichtbareIndizes(frage)

  const belegt = frage.erfassungAn ? 1 + frage.erfassteAnzahl : 0
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
