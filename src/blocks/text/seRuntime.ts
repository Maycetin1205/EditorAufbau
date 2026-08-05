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
//   - Quelle -> Zeile -> Wert in einem Zug: leseGebundeneStelle
//     (shared/gebundeneStelle), dieselbe Leseleitung wie beim Formularfeld.
//
// Editor-Elemente melden sich nie an (datenAnschluss prueft data-ff-editor):
// im Editor zeigt die Stelle den Feld-Klarnamen als Vorschau.

import { bindingAttr } from '../../core/blocks/BlockDefinition'
import { macheDatenAnschluss } from '../shared/datenAnschluss'
import { leseGebundeneStelle } from '../shared/gebundeneStelle'

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

function hydriereText(el: RuntimeTextElement): void {
  const stelle = leseGebundeneStelle(el, TEXT_ATTR)
  // Ungebunden: der getippte Text bleibt unangetastet. Gebunden, aber Quelle
  // oder Zeile fehlt: LEER statt getippter Text — die Stelle zeigt Daten, und
  // die gibt es hier nicht.
  if (stelle.art === 'ungebunden') return
  el.text = stelle.art === 'wert' ? stelle.wert : ''
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
