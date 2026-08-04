// seRuntime (Text) — Datenverhalten des Text-Bausteins in der EXPORTIERTEN
// Maske. Muster: formfeld/feldRuntime, nur ohne Schreibweg (der Text nimmt
// keine Eingabe an, und geschrieben wird ausschliesslich ueber sichtbare
// Ketten).
//
// Alles Geteilte kommt aus den geteilten Stellen, nichts davon steht hier ein
// zweites Mal:
//   - WELCHE Zeile gilt: ersteZeileNachAuswahl (shared/auswahl) — dieselbe
//     Regel wie beim Formularfeld und bei der Tabelle. Ohne eingestellte Folge
//     die ERSTE Zeile der Quelle; mit Folge nur die zur angeklickten Zeile
//     passende, und ohne Auswahl gar keine.
//   - Anmeldung/Neuzeichnen bei Daten-Push, Tageswechsel, Auswahl:
//     macheDatenAnschluss (shared/datenAnschluss).
//   - Wert eines Feldcodes: getField bzw. macheFeldLeser (shared/fremdeQuellen)
//     fuer eine Bindung an eine WEITERE Quelle des Bausteins.
//
// Editor-Elemente melden sich nie an (datenAnschluss prueft data-ff-editor):
// im Editor zeigt die Stelle den Feld-Klarnamen als Vorschau.

import { bindingAttr, zerlegeBindung } from '../../core/blocks/BlockDefinition'
import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, getField, rowsFor } from '../../softengine/data'
import { ersteZeileNachAuswahl } from '../shared/auswahl'
import { macheDatenAnschluss } from '../shared/datenAnschluss'
import { macheFeldLeser } from '../shared/fremdeQuellen'

export interface RuntimeTextElement extends HTMLElement {
  text: string
}

// Attribute sind absichtlich kleingeschrieben: HTML normalisiert textField
// beim Export zu textfield (bindingAttr = die eine Stelle dieser Form).
const TEXT_ATTR = bindingAttr('text')

// Gebunden = Quelle UND Feld genannt. Halbes bleibt ungebunden: dann zeigt der
// Baustein weiter seinen getippten Text, statt still leer zu bleiben.
function gebunden(el: RuntimeTextElement): { sourceId: string; code: string } | undefined {
  const sourceId = el.getAttribute('source') ?? ''
  const code = el.getAttribute(TEXT_ATTR) ?? ''
  return sourceId === '' || code === '' ? undefined : { sourceId, code }
}

// Exportiert fuer den gezielten Runtime-Test.
export function hydriereText(el: RuntimeTextElement): void {
  const bindung = gebunden(el)
  if (!bindung) return // ungebunden: der getippte Text bleibt unangetastet

  const source = findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, bindung.sourceId)
  // Quelle nicht in der Maske (geloescht, nie mitexportiert): leer statt
  // getippter Text — die Stelle zeigt Daten, und die gibt es hier nicht.
  // Der Preflight hat das beim Export im Klartext gemeldet.
  if (!source) {
    el.text = ''
    return
  }

  const zeile = ersteZeileNachAuswahl(
    el,
    rowsFor(seGlobal().SEDATA, source.name, source.tableId),
  )
  if (zeile === undefined) {
    el.text = ''
    return
  }
  const { quelleId, code: reinerCode } = zerlegeBindung(bindung.code)
  // Der Fremd-Leser baut einen Zeilen-Index ueber die weitere Quelle. Fuer eine
  // Bindung an die ERSTE Quelle waere das Arbeit ohne Ertrag (dieselbe
  // Abwaegung wie in feldRuntime).
  el.text = quelleId === ''
    ? getField(zeile, reinerCode)
    : macheFeldLeser(el)(zeile, bindung.code)
}

// Ein GEBUNDENER Text zeigt in der Maske nie seinen getippten Text: bis zum
// ersten Daten-Push stuende dort sonst „Text" oder ein alter Entwurfssatz,
// waehrend der Editor an derselben Stelle den Feld-Klarnamen zeigt (WYSIWYG-
// Bruch). Leer ist die ehrliche Anzeige — genau wie bei Karte und
// Formularfeld, deren gebundene Stellen ebenfalls leer starten. Laeuft nur in
// der Maske: datenAnschluss ruft `verdrahte` fuer Editor-Elemente nicht.
function verdrahteText(el: RuntimeTextElement): void {
  if (gebunden(el)) el.text = ''
}

const anschluss = macheDatenAnschluss<RuntimeTextElement>({
  hydriere: hydriereText,
  verdrahte: verdrahteText,
})

export const connectText = anschluss.connect
export const disconnectText = anschluss.disconnect
