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
import { passendeIndizes, zeigtEchteDaten, zeigtLeerzustand } from './suche'

export interface AnsichtFrage {
  spalten: readonly Spalte[]

  imEditor: boolean
  source: string
  datenGeliefert: boolean
  datenzeilen: readonly string[][]
  suchtext: string

  sortSpalte: number
  sortAuf: boolean

  wunschSeite: number

  gemessen: Zeilenmass | null
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

  const hatQuelle = zeigtEchteDaten(frage.imEditor, frage.source)

  const leer = zeigtLeerzustand(hatQuelle, frage.datenGeliefert, frage.datenzeilen.length)

  const alleSichtbar = sichtbareIndizes(frage)

  const proSeite = frage.gemessen?.passen ?? OHNE_MESSUNG
  const { seiten, seite, zeilen } = seitenAufteilung({
    sichtbar: alleSichtbar,
    hatQuelle,
    proSeite,
    wunschSeite: frage.wunschSeite,
    platzhalterZeilen: platzhalterZeilen(frage.gemessen?.passen ?? null),
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

    linealTakte: linealTakte(frage.gemessen?.passen ?? null, zeilen.length),
  }
}
