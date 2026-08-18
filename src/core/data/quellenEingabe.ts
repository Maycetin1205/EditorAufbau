import { QUELLEN_TRENNER } from '../blocks/BlockDefinition'
import { artFuer, type DataSourceKind } from './quellenArten'

export function fieldCode(pos: string, len: string, vorsatz = ''): string {
  const p = pos.trim()
  const l = len.trim()
  if (!/^\d+$/.test(p) || !/^\d+$/.test(l) || Number(l) < 1) return ''
  return `${feldVorsatzFromInput(vorsatz)}${p}_${l}`
}

const VORSATZ_FORM = /^[A-Za-z0-9_]+$/

export function feldVorsatzFromInput(raw: string): string {
  const t = raw.trim()
  return t !== '' && VORSATZ_FORM.test(t) ? t : ''
}

const KENNUNG_IDB_KURZ = /^(?:IDB)?ID(\d{1,4})$/i
const KENNUNG_FREI = /^[A-Za-z][A-Za-z0-9.]*$/

// idbKurzform=false laesst 'ID0001' stehen: bei einem DataSet IST das die
// Kennung, waehrend eine IDB-Tabelle ausgeschrieben 'IDBID0001' heisst.
export function kennungFromInput(raw: string, idbKurzform = true): string {
  const t = raw.trim()
  const kurz = idbKurzform ? KENNUNG_IDB_KURZ.exec(t) : null
  if (kurz) return `IDBID${kurz[1].padStart(4, '0')}`
  return KENNUNG_FREI.test(t) ? t : ''
}

const KOPFSATZ_FORM = /^[A-Za-z][A-Za-z0-9]*_\d+_\d+$/

export function kopfsatzFromInput(raw: string): string {
  const t = raw.trim()
  return KOPFSATZ_FORM.test(t) ? t : ''
}

export function kennungAnzeige(kennung: string | undefined): string {
  const m = /^IDB(ID\d{4})$/.exec(kennung ?? '')
  return m ? m[1] : (kennung ?? '')
}

export function quellenKennung(source: { kind: DataSourceKind; idbId?: string }): string {
  const feste = artFuer(source.kind).tabellenId
  return feste !== '' ? feste : kennungAnzeige(source.idbId)
}

// Ein DataSet spricht seine Spalten mit der BEZEICHNUNG an. Erlaubt ist
// darum fast alles (Leerzeichen, Umlaute) — nur kein Komma, denn FELDER
// ist eine Komma-Liste, und nicht der Quellen-Trenner, weil die Bindung
// „quelle::feld" damit mehrdeutig wuerde (pruefeDatenquellen wirft sie raus).
export function spaltenNameFromInput(raw: string): string {
  const t = raw.trim()
  if (t === '' || t.includes(',') || t.includes(QUELLEN_TRENNER)) return ''
  return t
}
