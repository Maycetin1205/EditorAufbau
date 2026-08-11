// tabelleFuss — die Bedienleiste unter der Tabelle.
//
// Zwei Dinge, ein Streifen: wie viele Saetze zu sehen sind, und das Blaettern.
// Der Waehler „Zeilen pro Seite" stand bis 2026-08-11 dazwischen (S2.1,
// Nutzer-Entscheidung): es gilt jetzt immer „so viele, wie hineinpassen".
// Damit ist die Fusszeile in Editor und Maske dieselbe — vorher zeigte der
// Editor den Waehler immer, die Maske nur auf Wunsch, und eine Fusszeile
// unterschiedlicher Hoehe haette die Zeilenzahl auseinanderlaufen lassen
// (dagegen stand eine feste Hoehe fuer Waehler und Knoepfe im Stylesheet).
//
// Aus TabelleBlock herausgeloest (2026-08-06): die Datei ueberschritt mit der
// gemessenen Seitengroesse den 500-Zeilen-Deckel (check:regeln). Der Schnitt
// liegt am Thema — hier die BEDIENUNG der Seitengroesse, drueben das Zeichnen
// der Daten und die Messung.
//
// Die Fusszeile erscheint IMMER, auch im Editor ohne Daten: sie gehoert zum
// Aufbau der Tabelle, also muss der Editor sie zeigen (Regel 1 — was zu sehen
// ist, IST der Export). Vorher erschien sie nur mit Daten; im Editor fehlte
// sie damit komplett, und der Bediener suchte vergeblich nach der
// Seiteneinstellung. Ohne Daten steht statt einer erfundenen Zahl ein Strich
// (Regel 7) — das entscheidet datensatzText in ./suche.

import { html, type TemplateResult } from 'lit'
import { datensatzText } from './suche'

export interface FussLage {
  // Kommen echte Daten? (Editor ohne Quelle -> Striche statt Zahlen.)
  hatQuelle: boolean
  // Wie viele Saetze gerade sichtbar sind bzw. es insgesamt gibt.
  sichtbar: number
  gesamt: number
  suchtAktiv: boolean
  auswahlAktiv: boolean
  seite: number
  seiten: number
}

export interface FussHandeln {
  blaettere: (zu: number) => void
  // Klicks in der Leiste duerfen den Baustein nicht anfassen (Editor: Auswahl).
  stop: (e: Event) => void
}

export function tabelleFuss(lage: FussLage, tun: FussHandeln): TemplateResult {
  return html`<div class="fusszeile">
    <div class="seiten-info">${datensatzText({
      hatQuelle: lage.hatQuelle,
      sichtbar: lage.sichtbar,
      gesamt: lage.gesamt,
      suchtAktiv: lage.suchtAktiv,
      auswahlAktiv: lage.auswahlAktiv,
    })}</div>
    <div class="seiten-nav">
      <button
        aria-label="Seite zurück"
        ?disabled=${lage.seite <= 0}
        @click=${() => tun.blaettere(lage.seite - 1)}
      >‹</button>
      <span>Seite ${lage.seite + 1} von ${lage.seiten}</span>
      <button
        aria-label="Seite vor"
        ?disabled=${lage.seite >= lage.seiten - 1}
        @click=${() => tun.blaettere(lage.seite + 1)}
      >›</button>
    </div>
  </div>`
}
