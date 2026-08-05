// tabelleFuss — die Bedienleiste unter der Tabelle.
//
// Drei Dinge, ein Streifen: wie viele Saetze zu sehen sind, wie viele Zeilen
// eine Seite zeigt, und das Blaettern.
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

import { html, nothing, type TemplateResult } from 'lit'
import { PASSEND, ZEILEN_PRO_SEITE } from './seitengroesse'
import { datensatzText } from './suche'

export interface FussLage {
  // Kommen echte Daten? (Editor ohne Quelle -> Striche statt Zahlen.)
  hatQuelle: boolean
  // Wie viele Saetze gerade sichtbar sind bzw. es insgesamt gibt.
  sichtbar: number
  gesamt: number
  suchtAktiv: boolean
  auswahlAktiv: boolean
  // Steht der Zeilen-Waehler hier? Im Editor immer (dort STELLT der Bauer ihn
  // ein), in der Maske nur, wenn er es erlaubt hat (Prop `zeilenWaehler`).
  // Blaetter-Knoepfe und Zeilen-Info bleiben in jedem Fall — sie sind keine
  // Einstellung, sondern das Blaettern selbst.
  zeigeWaehler: boolean
  // Die gerade wirksame Einstellung, wie sie auch im Attribut steht:
  // PASSEND oder eine Zahl als Text.
  einstellung: string
  seite: number
  seiten: number
}

export interface FussHandeln {
  // Der gewaehlte Wert, wie er in der Prop steht (PASSEND oder Zahl als Text).
  // Was damit passiert, entscheidet der Baustein: im Editor wird er
  // PERSISTENT gesetzt, in der Maske gilt er nur bis zum Neuladen.
  waehleProSeite: (wert: string) => void
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
      ${lage.zeigeWaehler ? html`<select
        aria-label="Zeilen pro Seite"
        @pointerdown=${tun.stop}
        @change=${(e: Event) => tun.waehleProSeite((e.target as HTMLSelectElement).value)}
      >
        <!-- „Passend zur Hoehe" ist der Standard: die Tabelle zeigt so viele
             Zeilen, wie in ihre Hoehe passen — kein Scrollen bei einer hohen
             Tabelle, kein leerer Rest bei einer flachen. Die festen Zahlen
             sind die bewusste Uebersteuerung; wer sie waehlt, nimmt das
             Scrollen in Kauf. Im EDITOR schreibt diese Wahl den Bauplan, in
             der MASKE gilt sie nur fuer diese Sitzung. -->
        <option value=${PASSEND} ?selected=${lage.einstellung === PASSEND}>passend zur Höhe</option>
        ${ZEILEN_PRO_SEITE.map(
          (n) => html`<option value=${n} ?selected=${lage.einstellung === String(n)}>${n} pro Seite</option>`,
        )}
      </select>` : nothing}
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
