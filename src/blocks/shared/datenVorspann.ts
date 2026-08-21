import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, rowsFor, type RuntimeDataSource } from '../../softengine/data'
import { zeilenNachAuswahl } from './auswahl'
import { macheFeldLeser, type FeldLeser } from './fremdeQuellen'
import { gewaehlterTag } from './gewaehlterTag'
import { zeilenAmTag } from './tagFilter'

export interface DatenVorspann {
  quelle: RuntimeDataSource

  // Die Zeilen der Quelle — Tagesfilter UND Auswahl-Folge bereits angewandt.
  zeilen: unknown[]

  // Hat eine Auswahl-Folge wirklich eingeschraenkt? Das ist etwas anderes als
  // „keine Zeilen": ohne Auswahl beim Geber passiert absichtlich nichts, mit
  // Auswahl und ohne Partner bleibt die Liste LEER (feste Zusage in
  // CLAUDE.md). Nur der Baustein kann daraus einen Leertext machen.
  durchAuswahlGefiltert: boolean

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
  const amTag = zeilenAmTag(
    rowsFor(seGlobal().SEDATA, quelle.name, quelle.tableId),
    el.getAttribute('tagfield') ?? '',
    gewaehlterTag(),
  )
  // „Folgt der Auswahl von …" gehoert HIERHIN, nicht in den einzelnen
  // Baustein. Bis 2026-08-21 filterte nur die Tabelle selbst; das
  // Kanban-Brett bekam `vorspann.zeilen` unveraendert und ignorierte die
  // Einstellung damit KOMPLETT — der Inspector bot sie an (seit 2026-08-20
  // darf jeder Baustein mit Daten folgen), der Export schrieb sie, und zur
  // Laufzeit tat sie nichts. Jeder kuenftige Datenbaustein bekommt sie jetzt
  // geschenkt, statt sie erneut zu vergessen.
  const { rows, gefiltert } = zeilenNachAuswahl(el, amTag)
  return {
    quelle,
    zeilen: rows,
    durchAuswahlGefiltert: gefiltert,
    lies: macheFeldLeser(el),
  }
}
