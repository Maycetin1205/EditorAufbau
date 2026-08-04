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
import { findRuntimeDataSource, getField, rowsFor } from '../../softengine/data'
import {
  auswahlFuer,
  auswahlMerkmal,
  folgenAusAttribut,
  klareAuswahl,
  merkmalVon,
} from '../shared/auswahl'
import { macheDatenAnschluss } from '../shared/datenAnschluss'
import { macheFeldLeser } from '../shared/fremdeQuellen'
import { gewaehlterTag } from '../shared/gewaehlterTag'
import { zeilenAmTag } from '../shared/tagFilter'

export interface RuntimeTableElement extends HTMLElement {
  datenzeilen: string[][]
  rohzeilen: unknown[]
  auswahlIndex: number
  durchAuswahlGefiltert: boolean
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

// Zeilen nach der Auswahl eines GEBERS filtern (Attribut `folgtauswahl`,
// geschrieben aus core/data/auswahlFolge). Ohne aktive Auswahl bleibt die
// Liste unveraendert — nichts passiert automatisch (Nutzer 2026-08-05).
// Mit Auswahl bleiben nur Zeilen, deren Schluesselfelder zur gewaehlten
// Zeile passen (alle Paare, UND). Ein LEERER Schluesselwert beim Geber
// trifft NICHTS — dieselbe Regel wie schluesselAus in fremdeQuellen: ein
// halber Schluessel traefe sonst jede Zeile mit derselben Luecke.
// Exportiert fuer den gezielten Runtime-Test.
export function zeilenNachAuswahl(
  el: HTMLElement,
  rows: unknown[],
): { rows: unknown[]; gefiltert: boolean } {
  let raus = rows
  let gefiltert = false
  for (const folge of folgenAusAttribut(el)) {
    const auswahl = auswahlFuer(folge.geberId)
    if (auswahl === undefined) continue
    gefiltert = true
    raus = raus.filter((row) =>
      folge.keyPairs.every((p) => {
        const soll = getField(auswahl, p.fromField)
        return soll !== '' && soll === getField(row, p.toField)
      }),
    )
  }
  return { rows: raus, gefiltert }
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
  const amTag = zeilenAmTag(
    rowsFor(seGlobal().SEDATA, source.name, source.tableId),
    el.getAttribute('tagfield') ?? '',
    gewaehlterTag(),
  )
  // Auswahl-Folge NACH dem Tagesfilter: beide engen nur ein.
  const { rows, gefiltert } = zeilenNachAuswahl(el, amTag)
  // Ist DIESE Tabelle ein Geber mit gemerkter Auswahl, die gewaehlte Zeile
  // in den NEUEN Zeilen wiederfinden (Identitaet = JSON-Abdruck). Ist sie
  // verschwunden (anderer Tag, geloescht), wird die Auswahl AUFGEHOBEN —
  // sonst filterten Folger nach einer Zeile, die niemand mehr sieht, und
  // der Bediener koennte nie wieder rausklicken (Regel 4).
  const geberId = el.getAttribute('data-ff-id') ?? ''
  let auswahlIndex = -1
  if (geberId !== '') {
    const merkmal = auswahlMerkmal(geberId)
    if (merkmal !== '') {
      auswahlIndex = rows.findIndex((r) => merkmalVon(r) === merkmal)
      if (auswahlIndex < 0) klareAuswahl(geberId)
    }
  }
  // Werte holen ueber den gemeinsamen Feld-Leser: er kennt die weiteren
  // Quellen des Bausteins und loest eine Spalte, die auf eine davon zeigt,
  // ueber die Partnerzeile auf (shared/fremdeQuellen). Fuer Spalten der
  // ersten Quelle ist er schlicht getField.
  const lies = macheFeldLeser(el)
  el.rohzeilen = rows
  el.auswahlIndex = auswahlIndex
  el.durchAuswahlGefiltert = gefiltert
  el.datenzeilen = rows.map((row) => felder.map((wert) => (wert === '' ? '' : lies(row, wert))))
}

// Anmeldung/Abo/Bruecke: die geteilte Mechanik (shared/datenAnschluss).
const anschluss = macheDatenAnschluss<RuntimeTableElement>({ hydriere: hydrateTable })

export const connectTable = anschluss.connect
export const disconnectTable = anschluss.disconnect
