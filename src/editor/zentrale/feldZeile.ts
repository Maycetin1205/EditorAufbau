// Eigene Datei, weil eine Komponenten-Datei nur Komponenten ausliefern
// darf (eslint react-refresh) — und weil das Umrechnen zwischen der
// Eingabezeile (Klarname + Position + Laenge) und dem Feldcode der
// Quelle an EINER Stelle wohnen soll: hier.

import { fieldCode, type DataSourceField } from '../../core/data/dataSources'
import { splitFieldCode } from '../../core/data/relations'

export interface FeldZeile {
  label: string
  pos: string
  len: string
  rawCode: string
}

export const LEERE_ZEILE: FeldZeile = { label: '', pos: '', len: '', rawCode: '' }

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

export function zeilenCode(z: FeldZeile, vorsatz = ''): string {
  if (z.pos.trim() === '' && z.len.trim() === '' && z.rawCode !== '') return z.rawCode
  return fieldCode(z.pos, z.len, vorsatz)
}

export function zeileGefuellt(z: FeldZeile): boolean {
  return z.label.trim() !== '' || zeilenCode(z) !== ''
}
