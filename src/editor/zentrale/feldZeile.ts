// feldZeile — die Formular-Zeile des Feld-Woerterbuchs (reine Logik).
//
// Getrennt von FeldListe.tsx, weil eine Bauteil-Datei nur Bauteile
// ausliefern darf (eslint react-refresh) — und weil das Umrechnen zwischen
// „Position + Laenge" (was der Bediener sieht) und dem Feldcode 'pos_len'
// (was gespeichert wird) pruefbare Logik ist, kein Bildschirm.

import { fieldCode, type DataSourceField } from '../../core/data/dataSources'
import { splitFieldCode } from '../../core/data/relations'

// `rawCode` traegt den bisherigen Technikwert eines Bestandsfelds, dessen
// Code KEIN pos_len ist (direkter Property-Name): laesst der Bediener
// Position/Laenge leer, bleibt er erhalten — sonst ersetzt die neue Eingabe
// den Code.
export interface FeldZeile {
  label: string
  pos: string
  len: string
  rawCode: string
}

export const LEERE_ZEILE: FeldZeile = { label: '', pos: '', len: '', rawCode: '' }

export function zeileFromField(f: DataSourceField): FeldZeile {
  const pl = splitFieldCode(f.code)
  return {
    label: f.label,
    pos: pl?.pos ?? '',
    len: pl?.len ?? '',
    rawCode: pl ? '' : f.code,
  }
}

// Feldcode einer Zeile ('' = ungueltig): Eingaben gewinnen, sonst rawCode.
export function zeilenCode(z: FeldZeile): string {
  if (z.pos.trim() === '' && z.len.trim() === '' && z.rawCode !== '') return z.rawCode
  return fieldCode(z.pos, z.len)
}

// Traegt die Zeile ueberhaupt etwas? Eine frische Maske startet mit EINER
// leeren Zeile — die zaehlt nicht als Inhalt.
export function zeileGefuellt(z: FeldZeile): boolean {
  return z.label.trim() !== '' || zeilenCode(z) !== ''
}
