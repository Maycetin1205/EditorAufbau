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

import { bootSe, hasSeData, onSeDaten, seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, getField, rowsFor } from '../../softengine/data'

export interface RuntimeTableElement extends HTMLElement {
  datenzeilen: string[][]
}

const tables = new Set<RuntimeTableElement>()

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
  const rows = rowsFor(seGlobal().SEDATA, source.name, source.tableId)
  el.datenzeilen = rows.map((row) => felder.map((code) => (code === '' ? '' : getField(row, code))))
}

function hydrateAll(): void {
  if (!hasSeData()) return
  tables.forEach(hydrateTable)
}

let subscribed = false

export function connectTable(el: RuntimeTableElement): void {
  if (el.hasAttribute('data-ff-editor')) return // Editor: statisch, Platzhalter
  tables.add(el)
  if (!subscribed) {
    subscribed = true
    onSeDaten(hydrateAll)
  }
  bootSe()
  if (hasSeData()) hydrateTable(el)
}

export function disconnectTable(el: RuntimeTableElement): void {
  tables.delete(el)
}
