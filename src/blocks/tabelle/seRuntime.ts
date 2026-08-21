import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, satzIndexVon } from '../../softengine/data'
import {
  auswahlWiederfinden,
  geberIdVon,
  zeilenNachAuswahl,
} from '../shared/auswahl'
import { macheDatenAnschluss } from '../shared/datenAnschluss'
import { holeDatenVorspann } from '../shared/datenVorspann'
import { spaltenArt } from './spaltenArten'
import { tryCoerceSpalten, type Spalte } from './spalten'

export interface RuntimeTableElement extends HTMLElement {
  datenzeilen: string[][]
  zusatzzeilen: Record<string, string>[][]
  rohzeilen: unknown[]
  auswahlIndex: number
  durchAuswahlGefiltert: boolean
  datenGeliefert: boolean
}

function spaltenVon(el: HTMLElement): Spalte[] {
  return tryCoerceSpalten(el.getAttribute('spalten') ?? '')
}

function zusatzWerte(
  spalte: Spalte,
  row: unknown,
  lies: (row: unknown, code: string) => string,
): Record<string, string> {
  const werte: Record<string, string> = {}
  for (const zf of spaltenArt(spalte.art).zusatzFelder ?? []) {
    const code = spalte.felder?.[zf.key] ?? ''
    if (code !== '') werte[zf.key] = lies(row, code)
  }
  return werte
}

// Die Satznummer der angeklickten Zeile — was die Kette als {PINDEX}
// weitergibt. Steht hier, weil nur die Laufzeit-Seite die Quellenliste
// kennt; ohne angeschlossene Quelle (geliefertes Fenster) ist sie leer.
export function zeilenIndexVon(el: HTMLElement, rohzeile: unknown): string {
  const source = findRuntimeDataSource(
    seGlobal().FF_DATA_SOURCES,
    el.getAttribute('source') ?? '',
  )
  return source ? satzIndexVon(source, rohzeile) : ''
}

function hydrateTable(el: RuntimeTableElement): void {
  const vorspann = holeDatenVorspann(el)
  if (!vorspann) {
    el.datenzeilen = []
    el.zusatzzeilen = []
    return
  }
  const spalten = spaltenVon(el)

  const { rows, gefiltert } = zeilenNachAuswahl(el, vorspann.zeilen)

  const auswahlIndex = auswahlWiederfinden(geberIdVon(el), rows, (r) => r)[0] ?? -1

  const lies = vorspann.lies

  el.datenGeliefert = true
  el.rohzeilen = rows
  el.auswahlIndex = auswahlIndex
  el.durchAuswahlGefiltert = gefiltert
  el.datenzeilen = rows.map((row) => spalten.map((s) => (s.feld === '' ? '' : lies(row, s.feld))))

  el.zusatzzeilen = rows.map((row) => spalten.map((s) => zusatzWerte(s, row, lies)))
}

const anschluss = macheDatenAnschluss<RuntimeTableElement>({ hydriere: hydrateTable })

export const connectTable = anschluss.connect
export const disconnectTable = anschluss.disconnect
