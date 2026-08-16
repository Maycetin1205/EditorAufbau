// gebundeneStelle — die EINE Leseleitung von einer gebundenen Stelle zum Wert.
//
// Text-Baustein und Formularfeld liefen dieselben sieben Schritte einzeln
// durch (Quelle + Feldcode lesen, Quelle nachschlagen, Zeilen holen, Zeile
// nach der Auswahl-Regel waehlen, Bindung zerlegen, erste oder weitere Quelle
// unterscheiden, Wert lesen). Hier stehen sie EINMAL; was bei jedem Ausgang
// passiert, entscheidet weiter der Baustein — ein Text laesst seinen
// getippten Inhalt stehen, wo ein Feld seinen Schreib-Eintrag loescht.

import { zerlegeBindung } from '../../core/blocks/BlockDefinition'
import { seGlobal } from '../../softengine/bridge'
import {
  findRuntimeDataSource,
  getField,
  rowsFor,
  type RuntimeDataSource,
} from '../../softengine/data'
import { ersteZeileNachAuswahl } from './auswahl'
import { macheFeldLeser } from './fremdeQuellen'

export type GebundeneStelle =
  // Quelle oder Feldcode fehlt — die Stelle ist gar nicht gebunden.
  | { art: 'ungebunden' }
  // Gebunden, aber die Quelle steckt nicht in der Maske (geloescht, nie
  // mitexportiert). Der Preflight kennt den Fall, blockt den Export aber seit
  // 2026-08-10 nicht mehr — er erreicht also die laufende Maske.
  | { art: 'ohneQuelle' }
  // Quelle da, aber keine Zeile: die Auswahl-Regel (shared/auswahl) liefert
  // keine — nichts gewaehlt oder kein Partner in der eigenen Quelle.
  | { art: 'ohneZeile' }
  | {
    art: 'wert'
    wert: string
    zeile: unknown
    quelle: RuntimeDataSource
    // Leer = Bindung an die ERSTE Quelle. Nur die bekommt einen Schreibweg
    // (mit dem Feldcode einer weiteren Quelle waere es die richtige Nummer
    // in der falschen Tabelle).
    quelleId: string
    reinerCode: string
  }

// `bindungsAttr` ist die Attribut-Form der Bindung (bindingAttr), z. B.
// 'textfield' oder 'valuefield'.
export function leseGebundeneStelle(el: HTMLElement, bindungsAttr: string): GebundeneStelle {
  const sourceId = el.getAttribute('source') ?? ''
  const code = el.getAttribute(bindungsAttr) ?? ''
  if (sourceId === '' || code === '') return { art: 'ungebunden' }

  const quelle = findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, sourceId)
  if (!quelle) return { art: 'ohneQuelle' }

  const zeile = ersteZeileNachAuswahl(
    el,
    rowsFor(seGlobal().SEDATA, quelle.name, quelle.tableId),
  )
  if (zeile === undefined) return { art: 'ohneZeile' }

  const { quelleId, code: reinerCode } = zerlegeBindung(code)
  // Der Fremd-Leser baut einen Zeilen-Index ueber die weitere Quelle. Fuer
  // eine Bindung an die erste Quelle waere das Arbeit ohne Ertrag — ein
  // Formular mit zehn Feldern indizierte die Fremdtabelle sonst zehnmal.
  const wert = quelleId === ''
    ? getField(zeile, reinerCode)
    : macheFeldLeser(el)(zeile, code)
  return { art: 'wert', wert, zeile, quelle, quelleId, reinerCode }
}
