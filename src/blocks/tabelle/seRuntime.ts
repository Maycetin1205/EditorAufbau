// tabelle/seRuntime — das TABELLEN-Datenverhalten in der exportierten Maske.
//
// Jede Zeile der Datenquelle wird EINE Tabellenzeile; jede Spalte zeigt den Wert
// ihres Feldes (getField). Das Ergebnis wird als `datenzeilen` an das Element
// gesetzt — der Baustein (Lit) rendert daraus die Zeilen (EINE Render-Quelle,
// Regel 1). Ohne Quelle bleibt die Tabelle statisch (Platzhalter, WYSIWYG).
//
// Alles Allgemeine — SE-Anmeldung/Daten-Push (bridge), Feld lesen und Zeilen
// (data) — wohnt in src/softengine/ und wird hier nur benutzt (Schicht-Regel:
// die SE-Schicht kennt NIE einen Baustein). Editor-Elemente tragen
// data-ff-editor und melden sich hier nie an — der Editor zeigt Platzhalter.

import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, rowsFor } from '../../softengine/data'
import { macheDatenAnschluss } from '../shared/datenAnschluss'
import { macheFeldLeser } from '../shared/fremdeQuellen'
import { gewaehlterTag } from '../shared/gewaehlterTag'
import { zeilenAmTag } from '../shared/tagFilter'

export interface RuntimeTableElement extends HTMLElement {
  datenzeilen: string[][]
}

// Feldcodes der Spalten aus dem `spalten`-Attribut (JSON {titel,feld}[]) —
// dieselbe Quelle wie der Baustein rendert (Attribut-Form der Spalten). Kaputtes
// JSON / fremde Struktur -> leere Codes (die Spalte bleibt dann leer, nie raten).
function spaltenFelder(el: HTMLElement): string[] {
  const raw = el.getAttribute('spalten') ?? ''
  if (raw === '') return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((x) =>
      x && typeof x === 'object' && typeof (x as Record<string, unknown>).feld === 'string'
        ? ((x as Record<string, unknown>).feld as string)
        : '',
    )
  } catch {
    return []
  }
}

// Exportiert fuer den gezielten Runtime-Test. Baut je Datenzeile ein Wert-Array,
// an die Spaltenreihenfolge ausgerichtet (leeres Feld -> leere Zelle).
export function hydrateTable(el: RuntimeTableElement): void {
  const sourceId = el.getAttribute('source') ?? ''
  if (sourceId === '') {
    el.datenzeilen = []
    return
  }
  const source = findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, sourceId)
  if (!source) {
    el.datenzeilen = []
    return
  }
  const felder = spaltenFelder(el)
  // Tagesfilter (shared/tagFilter): ohne eingestelltes Datumsfeld bzw. ohne
  // gewaehlten Tag bleibt die Liste unveraendert — Tabellen ohne
  // Tageswaehler verhalten sich exakt wie vorher.
  const rows = zeilenAmTag(
    rowsFor(seGlobal().SEDATA, source.name, source.tableId),
    el.getAttribute('tagfield') ?? '',
    gewaehlterTag(),
  )
  // Werte holen ueber den gemeinsamen Feld-Leser: er kennt die weiteren
  // Quellen des Bausteins und loest eine Spalte, die auf eine davon zeigt,
  // ueber die Partnerzeile auf (shared/fremdeQuellen). Fuer Spalten der
  // ersten Quelle ist er schlicht getField.
  const lies = macheFeldLeser(el)
  el.datenzeilen = rows.map((row) => felder.map((wert) => (wert === '' ? '' : lies(row, wert))))
}

// Anmeldung/Abo/Bruecke: die geteilte Mechanik (shared/datenAnschluss).
const anschluss = macheDatenAnschluss<RuntimeTableElement>({ hydriere: hydrateTable })

export const connectTable = anschluss.connect
export const disconnectTable = anschluss.disconnect
