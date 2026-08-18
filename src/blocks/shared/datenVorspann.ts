import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, rowsFor, type RuntimeDataSource } from '../../softengine/data'
import { macheFeldLeser, type FeldLeser } from './fremdeQuellen'
import { gewaehlterTag } from './gewaehlterTag'
import { zeilenAmTag } from './tagFilter'

export interface DatenVorspann {
  quelle: RuntimeDataSource

  // Die Zeilen der Quelle, Tagesfilter bereits angewandt.
  zeilen: unknown[]

  lies: FeldLeser
}

// Der EINE Einstieg jeder Datenanzeige (Tabelle, Kanban, kuenftige):
// die am Baustein angeschlossene Quelle finden, ihre Zeilen holen, den
// Tagesfilter anwenden und den Feldleser bauen. null = keine (oder eine
// in der Maske unbekannte) Quelle angeschlossen.
export function holeDatenVorspann(el: HTMLElement): DatenVorspann | null {
  const sourceId = el.getAttribute('source') ?? ''
  if (sourceId === '') return null
  const quelle = findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, sourceId)
  if (!quelle) return null
  const zeilen = zeilenAmTag(
    rowsFor(seGlobal().SEDATA, quelle.name, quelle.tableId),
    el.getAttribute('tagfield') ?? '',
    gewaehlterTag(),
  )
  return { quelle, zeilen, lies: macheFeldLeser(el) }
}
