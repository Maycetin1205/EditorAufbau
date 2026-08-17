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

    quelleId: string
    reinerCode: string
  }

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

  const wert = quelleId === ''
    ? getField(zeile, reinerCode)
    : macheFeldLeser(el)(zeile, code)
  return { art: 'wert', wert, zeile, quelle, quelleId, reinerCode }
}
