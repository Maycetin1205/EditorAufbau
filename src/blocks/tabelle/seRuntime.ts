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
}

// Die Spalten aus dem `spalten`-Attribut (JSON).
// Gelesen wird ueber GENAU DIESELBE Wandlung wie im Attribut-Wandler des
// Bausteins (tryCoerceSpalten, s. TabelleBlock) — sonst laufen Kopfzeile und
// Zellen auseinander: fehlendes/kaputtes Attribut ergab hier bisher NULL
// Spalten, waehrend der Baustein daraus die Standardspalten rendert. Seit der
// Export Standardwerte weglaesst (2026-08-06), ist der fehlende Fall echt —
// eine nie angefasste Tabelle traegt kein spalten-Attribut mehr.
// Kaputtes JSON / fremde Struktur -> Standardspalten mit leeren Codes (die
// Zelle bleibt leer, nie raten).
function spaltenVon(el: HTMLElement): Spalte[] {
  return tryCoerceSpalten(el.getAttribute('spalten') ?? '')
}

// Die WERTE der Zusatzfelder einer Spalte in EINER Zeile.
//
// Generisch ueber die Arten-Liste (./spaltenArten, zusatzFelder): hier steht
// kein „wenn Bild-Spalte, dann lies Bild und Unterzeile" — die Art sagt, welche
// Schluessel sie kennt, die Spalte sagt, an welches Feld jeder gebunden ist.
// Ungebunden = Schluessel fehlt, und die Zelle zeichnet die Stelle gar nicht
// (Nutzer-Ansage 2026-08-06: kein Bild ohne verknuepftes Feld).
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

// Baut je Datenzeile ein Wert-Array, an die Spaltenreihenfolge ausgerichtet
// (leeres Feld -> leere Zelle).
function hydrateTable(el: RuntimeTableElement): void {
  // Leeren heisst BEIDE leeren: blieben die Zusatzwerte einer frueheren
  // Hydrierung stehen, zeigte eine Bild-Spalte weiter Bilder zu Namen, die
  // laengst weg sind.
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
  // Ist DIESE Tabelle ein Geber mit gemerkter Auswahl, die gewaehlte Zeile in
  // den NEUEN Zeilen wiederfinden (shared/auswahl — dieselbe Hilfe wie beim
  // Kanban-Board, samt Aufheben einer verschwundenen Auswahl).
  const auswahlIndex = auswahlWiederfinden(geberIdVon(el), rows, (r) => r)[0] ?? -1
  // Werte holen ueber den gemeinsamen Feld-Leser: er kennt die weiteren
  // Quellen des Bausteins und loest eine Spalte, die auf eine davon zeigt,
  // ueber die Partnerzeile auf (shared/fremdeQuellen). Fuer Spalten der
  // ersten Quelle ist er schlicht getField.
  const lies = macheFeldLeser(el)
  el.rohzeilen = rows
  el.auswahlIndex = auswahlIndex
  el.durchAuswahlGefiltert = gefiltert
  el.datenzeilen = rows.map((row) => spalten.map((s) => (s.feld === '' ? '' : lies(row, s.feld))))
  // Die Zusatzwerte reisen GETRENNT, an denselben Indizes: in datenzeilen steht
  // genau ein Wert je Spalte, und daran haengen Suche und Sortierung. Wanderte
  // das Beiwerk dort mit hinein, faende die Suche Zeilen ueber Werte, die als
  // Spaltenwert gar nicht dastehen.
  el.zusatzzeilen = rows.map((row) => spalten.map((s) => zusatzWerte(s, row, lies)))
}

// Anmeldung/Abo/Bruecke: die geteilte Mechanik (shared/datenAnschluss).
const anschluss = macheDatenAnschluss<RuntimeTableElement>({ hydriere: hydrateTable })

export const connectTable = anschluss.connect
export const disconnectTable = anschluss.disconnect
