import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, rowsFor, satzIndexVon } from '../../softengine/data'
import {
  auswahlWiederfinden,
  geberIdVon,
  zeilenNachAuswahl,
} from '../shared/auswahl'
import { macheDatenAnschluss } from '../shared/datenAnschluss'
import { macheFeldLeser } from '../shared/fremdeQuellen'
import { gewaehlterTag } from '../shared/gewaehlterTag'
import { zeilenAmTag } from '../shared/tagFilter'
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
  const leeren = (): void => {
    el.datenzeilen = []
    el.zusatzzeilen = []
  }
  const sourceId = el.getAttribute('source') ?? ''
  if (sourceId === '') {
    leeren()
    return
  }
  const source = findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, sourceId)
  if (!source) {
    leeren()
    return
  }
  const spalten = spaltenVon(el)

  const amTag = zeilenAmTag(
    rowsFor(seGlobal().SEDATA, source.name, source.tableId),
    el.getAttribute('tagfield') ?? '',
    gewaehlterTag(),
  )

  const { rows, gefiltert } = zeilenNachAuswahl(el, amTag)

  const auswahlIndex = auswahlWiederfinden(geberIdVon(el), rows, (r) => r)[0] ?? -1

  const lies = macheFeldLeser(el)

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
