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
import {
  auswahlMerkmal,
  klareAuswahl,
  merkmalVon,
  zeilenNachAuswahl,
} from '../shared/auswahl'
import { macheDatenAnschluss } from '../shared/datenAnschluss'
import { macheFeldLeser } from '../shared/fremdeQuellen'
import { gewaehlterTag } from '../shared/gewaehlterTag'
import { zeilenAmTag } from '../shared/tagFilter'
import { tryCoerceSpalten } from './spalten'

export interface RuntimeTableElement extends HTMLElement {
  datenzeilen: string[][]
  rohzeilen: unknown[]
  auswahlIndex: number
  durchAuswahlGefiltert: boolean
}

// Feldcodes der Spalten aus dem `spalten`-Attribut (JSON {titel,feld}[]).
// Gelesen wird ueber GENAU DIESELBE Wandlung wie im Attribut-Wandler des
// Bausteins (tryCoerceSpalten, s. TabelleBlock) — sonst laufen Kopfzeile und
// Zellen auseinander: fehlendes/kaputtes Attribut ergab hier bisher NULL
// Spalten, waehrend der Baustein daraus die Standardspalten rendert. Seit der
// Export Standardwerte weglaesst (2026-08-06), ist der fehlende Fall echt —
// eine nie angefasste Tabelle traegt kein spalten-Attribut mehr.
// Kaputtes JSON / fremde Struktur -> Standardspalten mit leeren Codes (die
// Zelle bleibt leer, nie raten).
function spaltenFelder(el: HTMLElement): string[] {
  return tryCoerceSpalten(el.getAttribute('spalten') ?? '').map((s) => s.feld)
}

// Baut je Datenzeile ein Wert-Array, an die Spaltenreihenfolge ausgerichtet
// (leeres Feld -> leere Zelle).
function hydrateTable(el: RuntimeTableElement): void {
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
