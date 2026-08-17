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

// `vorsatz` (2026-08-17) ist der Feld-Vorsatz der QUELLE ('LFA_' bei einer
// ERP-Abfrage, s. quellenArten.feldVorsatzMoeglich). Er wird beim Lesen
// abgezogen und beim Schreiben wieder davorgesetzt — der Bediener sieht in
// beiden Faellen nur Position und Laenge.
//
// Faellt der Code nach dem Abziehen nicht als pos_len auseinander, greift der
// rawCode-Weg wie bisher: der bisherige Technikwert bleibt erhalten, statt
// dass ihn eine leere Eingabe still wegwirft.
export function zeileFromField(f: DataSourceField, vorsatz = ''): FeldZeile {
  const ohneVorsatz = vorsatz !== '' && f.code.startsWith(vorsatz)
    ? f.code.slice(vorsatz.length)
    : f.code
  const pl = splitFieldCode(ohneVorsatz)
  return {
    label: f.label,
    pos: pl?.pos ?? '',
    len: pl?.len ?? '',
    rawCode: pl ? '' : f.code,
  }
}

// Feldcode einer Zeile ('' = ungueltig): Eingaben gewinnen, sonst rawCode.
//
// Weil der Vorsatz hier beim SPEICHERN davorkommt, richtet ein spaeter
// geaenderter Vorsatz alle Felder der Quelle in einem Rutsch neu aus — es gibt
// keine halb umgestellte Feldliste, die erst in SoftEngine auffiele.
export function zeilenCode(z: FeldZeile, vorsatz = ''): string {
  if (z.pos.trim() === '' && z.len.trim() === '' && z.rawCode !== '') return z.rawCode
  return fieldCode(z.pos, z.len, vorsatz)
}

// Traegt die Zeile ueberhaupt etwas? Eine frische Maske startet mit EINER
// leeren Zeile — die zaehlt nicht als Inhalt. Der Vorsatz spielt hier keine
// Rolle: er aendert nur die Form des Codes, nie ob einer da ist.
export function zeileGefuellt(z: FeldZeile): boolean {
  return z.label.trim() !== '' || zeilenCode(z) !== ''
}
