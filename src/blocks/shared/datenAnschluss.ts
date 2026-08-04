// datenAnschluss — die EINE Anmelde-Mechanik fuer datengetriebene Bausteine.
//
// Jeder Baustein, der SoftEngine-Daten anzeigt (Kanban-Board, Formularfeld,
// Tabelle), brauchte bisher denselben Rumpf: Element merken, einmal je Maske
// beim Daten-Push anmelden, Bruecke starten, beim Abhaengen wieder vergessen.
// Dreimal abgeschrieben, dreimal pflegbar — bis 2026-07-24 (Nutzer-Frage
// „kann man das nicht kuerzen? also DRY?"). Jetzt steht er hier einmal.
//
// Der Gewinn ist nicht die Zeilenzahl, sondern: ein Fehler im Anmelde-Ablauf
// ist ab jetzt EIN Fehler an EINER Stelle. Vorher konnte er an zwei von drei
// Stellen behoben sein und an der dritten weiterleben.
//
// Kennt keinen einzelnen Baustein (Regel 2) — nur „ein Element, das man
// befuellen kann". Was befuellt wird, gibt der Baustein herein.

import { bootSe, hasSeData, onSeDaten } from '../../softengine/bridge'
import { aufAuswahlHoeren } from './auswahl'
import { aufTagHoeren } from './gewaehlterTag'

export interface DatenAnschluss<T extends HTMLElement> {
  // Vom Baustein in connectedCallback rufen.
  connect: (el: T) => void
  // Vom Baustein in disconnectedCallback rufen.
  disconnect: (el: T) => void
  // Alle angemeldeten Elemente neu befuellen (fuer gezielte Laufzeit-Tests).
  hydriereAlle: () => void
}

export function macheDatenAnschluss<T extends HTMLElement>(opts: {
  // Ein Element mit den aktuellen SE-Daten befuellen.
  hydriere: (el: T) => void
  // Einmalige Verdrahtung beim ersten Anmelden (Ziehen, Eingabe-Ereignisse).
  // Muss selbst gegen Doppelanmeldung schuetzen, falls noetig.
  verdrahte?: (el: T) => void
}): DatenAnschluss<T> {
  const elemente = new Set<T>()
  let angemeldet = false

  const hydriereAlle = (): void => {
    // Ohne Daten nichts anfassen — sonst leert ein frueher Aufruf die Anzeige.
    if (!hasSeData()) return
    elemente.forEach(opts.hydriere)
  }

  const connect = (el: T): void => {
    // Editor-Elemente (BlockHost setzt data-ff-editor VOR dem Einhaengen)
    // melden sich NIE an: im Editor existiert die Daten-Mechanik schlicht
    // nicht, dort stehen Platzhalter (Regel 7).
    if (el.hasAttribute('data-ff-editor')) return
    elemente.add(el)
    opts.verdrahte?.(el)
    // Nur EINE Anmeldung je Maske an der Bruecke, egal wie viele Bausteine.
    if (!angemeldet) {
      angemeldet = true
      onSeDaten(hydriereAlle)
      // Zweiter Anlass zum Neuzeichnen: der Bediener waehlt einen anderen
      // Tag (shared/gewaehlterTag). Hier statt in jedem Baustein, damit
      // Kanban und Tabelle den Tagesfilter geschenkt bekommen und keiner
      // von ihnen den Tageswaehler kennen muss (Regel 2).
      aufTagHoeren(hydriereAlle)
      // Dritter Anlass: eine Zeile/Karte wurde gewaehlt oder abgewaehlt
      // (shared/auswahl) — Geber zeichnen ihre Markierung, Folger filtern.
      aufAuswahlHoeren(hydriereAlle)
    }
    bootSe()
    // Kommen die Daten schon vor diesem Baustein an, sofort nachziehen.
    if (hasSeData()) opts.hydriere(el)
  }

  const disconnect = (el: T): void => {
    elemente.delete(el)
  }

  return { connect, disconnect, hydriereAlle }
}
